/**
 * Public claims on the vault. The question, tier and horizon are in storage;
 * probability stays dark until reveal. The tape is this file, not a backend.
 */

import { RpcProvider, hash, num, shortString } from "starknet";
import { RPC_URL, VAULT_ADDRESS } from "./config";
import { formatPrice } from "./pragma";
import { formatRawAmount, matchMetric, tokenMeta } from "./metrics";
import { TIER_ORDER, type Tier } from "./scoring";

const provider = () => new RpcProvider({ nodeUrl: RPC_URL });

type EventsPage = Awaited<ReturnType<RpcProvider["getEvents"]>>;

export type ClaimState = "sealed" | "settled" | "forfeited";

export type PublicClaim = {
  commitmentHash: string;
  reputationKey: string;
  kind: "price" | "metric";
  /** Human sentence: "BTC above $79,330" / "Privacy pool · STRK above 3,000,000 STRK". */
  question: string;
  comparator: "above" | "below";
  horizon: number;
  tier: Tier;
  state: ClaimState;
  probabilityBp?: number;
  outcome?: number;
  brierBp?: number;
  tx: string;
  block: number;
};

function asTier(n: number): Tier {
  return TIER_ORDER[n] ?? "bronze";
}

function asState(n: number): ClaimState {
  if (n === 2) return "settled";
  if (n === 3) return "forfeited";
  return "sealed";
}

function decodePair(felt: string): string {
  try {
    const s = shortString.decodeShortString(felt);
    return s && s.length > 0 ? s : "price";
  } catch {
    return "price";
  }
}

function describeForecast(res: string[]): { kind: "price" | "metric"; question: string; comparator: "above" | "below" } {
  const kind = Number(BigInt(res[2] ?? 0)) === 1 ? "metric" : "price";
  const subject = res[3] ?? "0x0";
  const holder = res[4] ?? "0x0";
  const strike = BigInt(res[5] ?? 0);
  const comparator: "above" | "below" =
    Number(BigInt(res[7] ?? 0)) === 1 ? "above" : "below";

  if (kind === "price") {
    const pair = decodePair(subject);
    const base = pair.split("/")[0] ?? pair;
    const usd = Number(strike) / 1e8;
    return {
      kind,
      comparator,
      question: `${base} ${comparator} $${formatPrice(usd)}`,
    };
  }

  const known = matchMetric(subject, holder);
  const { symbol } = tokenMeta(subject);
  const amount = formatRawAmount(strike, subject);
  const label = known?.label ?? `${symbol} of ${holder.slice(0, 6)}…`;
  return {
    kind,
    comparator,
    question: `${label} ${comparator} ${amount}`,
  };
}

async function getForecast(commitment: string): Promise<string[] | null> {
  if (!VAULT_ADDRESS) return null;
  try {
    const res = await provider().callContract({
      contractAddress: VAULT_ADDRESS,
      entrypoint: "get_forecast",
      calldata: [commitment],
    });
    if (!res || res.length < 12) return null;
    if (BigInt(res[11] ?? 0) === 0n) return null;
    return res;
  } catch {
    return null;
  }
}

/**
 * On-chain state for one commitment. "absent" is a successful read saying the
 * vault has never seen it; "unknown" means the read itself failed, and a
 * caller must never treat that as absence.
 */
export async function fetchClaimState(
  commitment: string,
): Promise<ClaimState | "absent" | "unknown"> {
  if (!VAULT_ADDRESS) return "unknown";
  try {
    const res = await provider().callContract({
      contractAddress: VAULT_ADDRESS,
      entrypoint: "get_forecast",
      calldata: [commitment],
    });
    if (!res || res.length < 12) return "unknown";
    const state = Number(BigInt(res[11] ?? 0));
    return state === 0 ? "absent" : asState(state);
  } catch {
    return "unknown";
  }
}

/** Live tape of claims on the current vault, newest first. */
export async function fetchClaims(
  limit = 24,
  reputationKey?: string,
): Promise<PublicClaim[]> {
  if (!VAULT_ADDRESS) return [];
  const p = provider();
  const sealed = new Map<
    string,
    { reputationKey: string; tx: string; block: number }
  >();
  const settled = new Map<
    string,
    { probabilityBp: number; outcome: number; brierBp: number }
  >();
  const forfeited = new Set<string>();

  try {
    const tip = await p.getBlockNumber();
    const from = { block_number: Math.max(0, tip - 50_000) };

    for (const name of ["Sealed", "Settled", "Forfeited"] as const) {
      let token: string | undefined;
      do {
        const page: EventsPage = await p.getEvents({
          address: VAULT_ADDRESS,
          from_block: from,
          to_block: "latest",
          keys: [[hash.getSelectorFromName(name)]],
          chunk_size: 100,
          continuation_token: token,
        });
        for (const e of page.events) {
          const commitment = num.toHex(BigInt(e.keys[1] ?? 0));
          if (name === "Sealed") {
            sealed.set(commitment, {
              reputationKey: num.toHex(BigInt(e.keys[2] ?? 0)),
              tx: e.transaction_hash,
              block: e.block_number ?? 0,
            });
          } else if (name === "Settled") {
            settled.set(commitment, {
              probabilityBp: Number(BigInt(e.data[0] ?? 0)),
              outcome: Number(BigInt(e.data[1] ?? 0)),
              brierBp: Number(BigInt(e.data[3] ?? 0)),
            });
          } else {
            forfeited.add(commitment);
          }
        }
        token = page.continuation_token;
      } while (token && sealed.size < 80);
    }
  } catch {
    return [];
  }

  let want: bigint | null = null;
  try {
    want = reputationKey ? BigInt(reputationKey) : null;
  } catch {
    return [];
  }

  const hashes = [...sealed.entries()]
    .filter(([, m]) => want === null || BigInt(m.reputationKey) === want)
    .sort((a, b) => b[1].block - a[1].block)
    .slice(0, limit);

  const decoded = await Promise.all(
    hashes.map(async ([commitment, meta]) => {
      const res = await getForecast(commitment);
      const extra = settled.get(commitment);
      const state: ClaimState = forfeited.has(commitment)
        ? "forfeited"
        : extra
          ? "settled"
          : res
            ? asState(Number(BigInt(res[11] ?? 1)))
            : "sealed";

      const described = res
        ? describeForecast(res)
        : { kind: "price" as const, question: "sealed claim", comparator: "above" as const };

      const horizon = res ? Number(BigInt(res[6] ?? 0)) : 0;
      const tier = res ? asTier(Number(BigInt(res[8] ?? 0))) : "bronze";

      const claim: PublicClaim = {
        commitmentHash: commitment,
        reputationKey: meta.reputationKey,
        kind: described.kind,
        question: described.question,
        comparator: described.comparator,
        horizon,
        tier,
        state,
        tx: meta.tx,
        block: meta.block,
      };
      if (extra) {
        claim.probabilityBp = extra.probabilityBp;
        claim.outcome = extra.outcome;
        claim.brierBp = extra.brierBp;
      }
      return claim;
    }),
  );

  return decoded;
}
