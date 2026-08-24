/**
 * On-chain metrics a forecast can be about.
 *
 * A metric question settles by reading an ERC-20 balance at the horizon — no
 * oracle, no committee, the chain is the source. Every curated entry was
 * verified against mainnet before being listed, because a metric nobody can
 * settle is a bond nobody gets back. Custom token + holder is the same path.
 */

import { RpcProvider, shortString } from "starknet";
import { POOL_ADDRESS, RPC_URL, STRK_TOKEN } from "./config";

export type Metric = {
  id: string;
  label: string;
  /** What the number means, shown behind the (i). */
  story: string;
  /** ERC-20 whose balance is read. */
  token: string;
  /** Address whose balance settles the question. */
  holder: string;
  decimals: number;
  unit: string;
  /** Curated rows vs a paste-any-address row. */
  custom?: boolean;
};

export const ETH_TOKEN =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
export const WBTC_TOKEN =
  "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac";
export const USDC_TOKEN =
  "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";

/** Starknet staking dispatcher — STRK locked with validators. */
const STAKING =
  "0x00ca1702e64c81d9a07b86bd2c540188d92a2c73cf5cc0e508d949015e7e84a7";
/** Vesu V1 singleton. */
const VESU =
  "0x000d8d6dfec4d33bfb6895de9f3852143a17c6f92fd2a21da3d6924d34870160";

export const METRICS: Metric[] = [
  {
    id: "pool-strk",
    label: "Privacy pool · STRK",
    story:
      "STRK shielded inside the STRK20 privacy pool. Every deposit raises it, every exit lowers it — the number for whether Starknet privacy is being used.",
    token: STRK_TOKEN,
    holder: POOL_ADDRESS,
    decimals: 18,
    unit: "STRK",
  },
  {
    id: "pool-eth",
    label: "Privacy pool · ETH",
    story: "ETH held privately in the STRK20 pool.",
    token: ETH_TOKEN,
    holder: POOL_ADDRESS,
    decimals: 18,
    unit: "ETH",
  },
  {
    id: "pool-wbtc",
    label: "Privacy pool · BTC",
    story: "Wrapped BTC held privately in the STRK20 pool.",
    token: WBTC_TOKEN,
    holder: POOL_ADDRESS,
    decimals: 8,
    unit: "WBTC",
  },
  {
    id: "stake-strk",
    label: "STRK staked",
    story:
      "STRK locked in the Starknet staking contract. The chain's own measure of how much of the token is bonded to the network.",
    token: STRK_TOKEN,
    holder: STAKING,
    decimals: 18,
    unit: "STRK",
  },
  {
    id: "vesu-strk",
    label: "Vesu · STRK",
    story:
      "STRK sitting in Vesu's singleton. A DeFi TVL number the vault can settle by reading the balance — no oracle in the loop.",
    token: STRK_TOKEN,
    holder: VESU,
    decimals: 18,
    unit: "STRK",
  },
];

const KNOWN_DECIMALS: Record<string, { symbol: string; decimals: number }> = {
  [BigInt(STRK_TOKEN).toString()]: { symbol: "STRK", decimals: 18 },
  [BigInt(ETH_TOKEN).toString()]: { symbol: "ETH", decimals: 18 },
  [BigInt(WBTC_TOKEN).toString()]: { symbol: "WBTC", decimals: 8 },
  [BigInt(USDC_TOKEN).toString()]: { symbol: "USDC", decimals: 6 },
};

export function tokenMeta(token: string): { symbol: string; decimals: number } {
  try {
    const hit = KNOWN_DECIMALS[BigInt(token).toString()];
    if (hit) return hit;
  } catch {
    /* not a felt */
  }
  return { symbol: "token", decimals: 18 };
}

export function metricById(id: string): Metric | undefined {
  return METRICS.find((m) => m.id === id);
}

export function matchMetric(token: string, holder: string): Metric | undefined {
  try {
    const t = BigInt(token);
    const h = BigInt(holder);
    return METRICS.find((m) => BigInt(m.token) === t && BigInt(m.holder) === h);
  } catch {
    return undefined;
  }
}

export function isFeltAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{1,64}$/.test(value.trim());
}

export function shortAddr(value: string): string {
  try {
    const h = BigInt(value).toString(16).padStart(64, "0");
    return `0x${h.slice(0, 4)}…${h.slice(-4)}`;
  } catch {
    return value;
  }
}

const cache = new Map<string, { at: number; value: number }>();

function rawBalance(res: string[]): bigint {
  return BigInt(res[0] ?? 0) + (BigInt(res[1] ?? 0) << 128n);
}

/** Current value in whole units, read exactly as the vault will read it. */
export async function fetchMetricValue(m: Metric): Promise<number | null> {
  const hit = cache.get(m.id);
  if (hit && Date.now() - hit.at < 30_000) return hit.value;
  try {
    const res = await new RpcProvider({ nodeUrl: RPC_URL }).callContract({
      contractAddress: m.token,
      entrypoint: "balanceOf",
      calldata: [m.holder],
    });
    const value = Number(rawBalance(res)) / 10 ** m.decimals;
    if (!Number.isFinite(value)) return null;
    cache.set(m.id, { at: Date.now(), value });
    return value;
  } catch {
    return null;
  }
}

export async function fetchMetricValues(
  metrics: readonly Metric[] = METRICS,
): Promise<Record<string, number | null>> {
  const entries = await Promise.all(
    metrics.map(async (m) => [m.id, await fetchMetricValue(m)] as const),
  );
  return Object.fromEntries(entries);
}

/**
 * Read an arbitrary token/holder pair the way the vault will. Used for the
 * custom row: if this returns, the question is settleable.
 */
export async function probeMetric(
  token: string,
  holder: string,
): Promise<{ metric: Metric } | { error: string }> {
  const t = token.trim();
  const h = holder.trim();
  if (!isFeltAddress(t) || !isFeltAddress(h)) {
    return { error: "Both fields need a Starknet address (0x…)." };
  }
  if (BigInt(t) === 0n || BigInt(h) === 0n) {
    return { error: "Addresses cannot be zero." };
  }

  const provider = new RpcProvider({ nodeUrl: RPC_URL });
  const known = tokenMeta(t);
  let decimals = known.decimals;
  let symbol = known.symbol;

  try {
    const d = await provider.callContract({
      contractAddress: t,
      entrypoint: "decimals",
      calldata: [],
    });
    const n = Number(BigInt(d[0] ?? 0));
    if (n > 0 && n <= 36) decimals = n;
  } catch {
    /* keep known / 18 */
  }

  if (symbol === "token") {
    try {
      const s = await provider.callContract({
        contractAddress: t,
        entrypoint: "symbol",
        calldata: [],
      });
      const decoded = shortString.decodeShortString(s[0] ?? "0x0");
      if (decoded && /^[A-Za-z0-9.]+$/.test(decoded)) symbol = decoded;
    } catch {
      /* stay generic */
    }
  }

  try {
    const res = await provider.callContract({
      contractAddress: t,
      entrypoint: "balanceOf",
      calldata: [h],
    });
    const raw = rawBalance(res);
    const value = Number(raw) / 10 ** decimals;
    const id = `custom:${BigInt(t).toString(16)}:${BigInt(h).toString(16)}`;
    const metric: Metric = {
      id,
      label: `${symbol} of ${shortAddr(h)}`,
      story:
        "Any ERC-20 balance on Starknet. The vault reads this address at the horizon and settles. No oracle, no committee.",
      token: t,
      holder: h,
      decimals,
      unit: symbol,
      custom: true,
    };
    if (Number.isFinite(value)) cache.set(id, { at: Date.now(), value });
    return { metric };
  } catch {
    return {
      error:
        "Could not read a balance there. Check the token is an ERC-20 and the holder is a contract or account.",
    };
  }
}

export function formatMetric(value: number, unit: string): string {
  const dp = value >= 1000 ? 0 : value >= 10 ? 1 : 3;
  return `${value.toLocaleString(undefined, { maximumFractionDigits: dp })} ${unit}`;
}

/** Format a raw u128 amount using known or default decimals. */
export function formatRawAmount(raw: bigint, token: string): string {
  const { symbol, decimals } = tokenMeta(token);
  const d = 10n ** BigInt(decimals);
  const whole = raw / d;
  const frac = raw % d;
  if (whole >= 1000n || frac === 0n) {
    return `${whole.toLocaleString()} ${symbol}`;
  }
  const fracStr = frac.toString().padStart(decimals, "0").slice(0, 3).replace(/0+$/, "");
  return fracStr
    ? `${whole.toLocaleString()}.${fracStr} ${symbol}`
    : `${whole.toLocaleString()} ${symbol}`;
}
