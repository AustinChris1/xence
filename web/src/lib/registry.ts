/** Reading the public record. */

import { RpcProvider, hash, num } from "starknet";
import { REGISTRY_ADDRESS, REGISTRY_ADDRESSES, RPC_URL, REGISTRY_FROM_BLOCK } from "./config";
import { BP, REFERENCE_BRIER, TIER_ORDER, skillScore, type CalibrationBin } from "./scoring";

export type ForecasterRecord = {
  reputationKey: string;
  open: number;
  resolved: number;
  forfeited: number;
  meanBrier: number;
  /** Positive means better than a coin flip. */
  skill: number;
};

const provider = () => new RpcProvider({ nodeUrl: RPC_URL });

/** Annotated explicitly: inferring this from the paginated loop below would be circular. */
type EventsPage = Awaited<ReturnType<RpcProvider["getEvents"]>>;

/** The chain is the index: discover forecasters from the registry's events. */
export async function discoverForecasters(
  limit = 200,
): Promise<string[]> {
  if (!REGISTRY_ADDRESSES.length) return [];
  const p = provider();
  const keys = new Set<string>();

  const scans: Promise<void>[] = [];
  for (const registry of REGISTRY_ADDRESSES)
  for (const eventName of ["Sealed", "Settled", "Forfeited"]) {
    scans.push((async () => {
    let token: string | undefined = undefined;
    // The reputation key is the second key on every registry event: the first
    // is the event selector, the second is the `#[key]` field.
    do {
      let page: EventsPage;
      try {
        page = await p.getEvents({
          address: registry,
          // Scanning from genesis makes the node walk millions of empty blocks
          // and time out; the registry cannot have events before it existed.
          from_block: { block_number: REGISTRY_FROM_BLOCK },
          to_block: "latest",
          keys: [[hash.getSelectorFromName(eventName)]],
          chunk_size: 100,
          continuation_token: token,
        });
      } catch {
        // A partial leaderboard beats an error page.
        break;
      }
      for (const e of page.events) {
        const k = e.keys?.[1];
        if (k) keys.add(num.toHex(BigInt(k)));
      }
      token = page.continuation_token;
    } while (token && keys.size < limit);
    })());
  }

  // The scans are independent, so run them together rather than end to end.
  await Promise.all(scans);
  return [...keys].slice(0, limit);
}

export async function fetchRecord(
  reputationKey: string,
): Promise<ForecasterRecord | null> {
  if (!REGISTRY_ADDRESSES.length) return null;
  // A record is per-key across registry generations, so the sums merge cleanly.
  let open = 0, resolved = 0, forfeited = 0, weighted = 0, weight = 0, seen = false;
  for (const registry of REGISTRY_ADDRESSES) {
    try {
      const res = await provider().callContract({
        contractAddress: registry,
        entrypoint: "get_record",
        calldata: [reputationKey],
      });
      const [o, r, f, wb, wt] = res.map((v) => Number(BigInt(v)));
      open += o; resolved += r; forfeited += f; weighted += wb; weight += wt;
      seen = true;
    } catch {
      /* one generation unreachable is not fatal */
    }
  }
  if (!seen) return null;
  const meanBrier = weight > 0 ? weighted / weight / BP : REFERENCE_BRIER;
  return { reputationKey, open, resolved, forfeited, meanBrier, skill: skillScore(meanBrier) };
}

export async function fetchCalibration(
  reputationKey: string,
): Promise<CalibrationBin[]> {
  if (!REGISTRY_ADDRESSES.length) return [];
  const p = provider();
  const bins: CalibrationBin[] = [];

  for (let i = 0; i < 5; i++) {
    let count = 0, hits = 0, claimedSum = 0;
    for (const registry of REGISTRY_ADDRESSES) {
      try {
        const res = await p.callContract({
          contractAddress: registry,
          entrypoint: "get_bin",
          calldata: [reputationKey, String(i)],
        });
        const [c, h, cs] = res.map((v) => Number(BigInt(v)));
        count += c; hits += h; claimedSum += cs;
      } catch {
        /* skip unreachable generation */
      }
    }
    bins.push({
      bucket: (i + 0.5) / 5,
      claimed: count > 0 ? claimedSum / count / BP : (i + 0.5) / 5,
      observed: count > 0 ? hits / count : 0,
      count,
    });
  }
  return bins;
}

export async function fetchLeaderboard(): Promise<ForecasterRecord[]> {
  const keys = await discoverForecasters();
  const records = await Promise.all(keys.map(fetchRecord));
  return (
    records
      .filter((r): r is ForecasterRecord => r !== null)
      // An unresolved record says nothing yet. Ranking on zero history is how
      // you get a leaderboard topped by someone who has never been tested.
      .filter((r) => r.resolved + r.forfeited > 0)
      .sort((a, b) => b.skill - a.skill)
  );
}

export { TIER_ORDER };

/** Where a forecaster receives private support; null until they set one. */
export async function fetchPayout(reputationKey: string): Promise<string | null> {
  if (!REGISTRY_ADDRESS) return null;
  try {
    const res = await provider().callContract({
      contractAddress: REGISTRY_ADDRESS,
      entrypoint: "payout_of",
      calldata: [reputationKey],
    });
    const v = BigInt(res[0]);
    return v === 0n ? null : num.toHex(v);
  } catch {
    return null;
  }
}

export async function fetchPayoutNonce(reputationKey: string): Promise<number> {
  const res = await provider().callContract({
    contractAddress: REGISTRY_ADDRESS,
    entrypoint: "payout_nonce",
    calldata: [reputationKey],
  });
  return Number(BigInt(res[0]));
}

export type Activity = {
  kind: "sealed" | "settled" | "forfeited";
  reputationKey: string;
  block: number;
  tx: string;
  /** Present only once a forecast has been opened. */
  probabilityBp?: number;
  outcome?: number;
  brierBp?: number;
};

/** Recent registry events, newest first. The public ledger, as it happens. */
export async function fetchActivity(limit = 12): Promise<Activity[]> {
  if (!REGISTRY_ADDRESSES.length) return [];
  const p = provider();
  const out: Activity[] = [];
  try {
    for (const registry of REGISTRY_ADDRESSES)
    for (const kind of ["Sealed", "Settled", "Forfeited"] as const) {
      const page = await p.getEvents({
        address: registry,
        from_block: { block_number: REGISTRY_FROM_BLOCK },
        to_block: "latest",
        keys: [[hash.getSelectorFromName(kind)]],
        chunk_size: 100,
      });
      for (const e of page.events) {
        const row: Activity = {
          kind: kind.toLowerCase() as Activity["kind"],
          reputationKey: num.toHex(BigInt(e.keys[1] ?? 0)),
          block: e.block_number ?? 0,
          tx: e.transaction_hash,
        };
        if (kind === "Settled" && e.data?.length >= 5) {
          row.probabilityBp = Number(BigInt(e.data[1]));
          row.outcome = Number(BigInt(e.data[2]));
          row.brierBp = Number(BigInt(e.data[3]));
        }
        out.push(row);
      }
    }
  } catch {
    return [];
  }
  return out.sort((a, b) => b.block - a.block).slice(0, limit);
}
