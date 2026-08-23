/**
 * On-chain metrics a forecast can be about.
 *
 * A metric question settles by reading an ERC-20 balance at the horizon — no
 * oracle, no committee, the chain is the source. Every entry here was verified
 * against mainnet before being listed, because a metric nobody can settle is a
 * bond nobody gets back.
 */

import { RpcProvider } from "starknet";
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
};

const ETH_TOKEN =
  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const WBTC_TOKEN =
  "0x3fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac";

export const METRICS: Metric[] = [
  {
    id: "pool-strk",
    label: "Privacy adoption · STRK",
    story:
      "STRK shielded inside the STRK20 privacy pool. The single best number for whether Starknet privacy is being used — every deposit raises it, every exit lowers it.",
    token: STRK_TOKEN,
    holder: POOL_ADDRESS,
    decimals: 18,
    unit: "STRK",
  },
  {
    id: "pool-eth",
    label: "Private ETH",
    story: "ETH held privately in the STRK20 pool.",
    token: ETH_TOKEN,
    holder: POOL_ADDRESS,
    decimals: 18,
    unit: "ETH",
  },
  {
    id: "pool-wbtc",
    label: "Private BTC",
    story: "Wrapped BTC held privately in the STRK20 pool.",
    token: WBTC_TOKEN,
    holder: POOL_ADDRESS,
    decimals: 8,
    unit: "WBTC",
  },
];

export function metricById(id: string): Metric | undefined {
  return METRICS.find((m) => m.id === id);
}

const cache = new Map<string, { at: number; value: number }>();

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
    const raw = BigInt(res[0]) + (BigInt(res[1] ?? 0) << 128n);
    const value = Number(raw) / 10 ** m.decimals;
    cache.set(m.id, { at: Date.now(), value });
    return value;
  } catch {
    return null;
  }
}

export function formatMetric(value: number, unit: string): string {
  const dp = value >= 1000 ? 0 : value >= 10 ? 1 : 3;
  return `${value.toLocaleString(undefined, { maximumFractionDigits: dp })} ${unit}`;
}
