/**
 * Reading the public record.
 *
 * The registry deliberately has no "list every forecaster" entry point — an
 * on-chain array you can iterate is an on-chain array someone has to pay to
 * grow, and it would cap how many people can ever use this. Instead the
 * leaderboard is rebuilt from events, which is what events are for: the chain
 * is the index.
 *
 * That also means anyone can rebuild this page from scratch without trusting
 * us. There is no backend in the path between a forecaster's score and the
 * person reading it.
 */

import { RpcProvider, hash, num } from "starknet";
import { REGISTRY_ADDRESS, RPC_URL } from "./config";
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

/** Annotated explicitly: inferring it from the paginated loop is circular,
 *  because the page supplies the token that the next page is fetched with. */
type EventsPage = Awaited<ReturnType<RpcProvider["getEvents"]>>;

/** The chain is the index: discover forecasters from the registry's events. */
export async function discoverForecasters(
  limit = 200,
): Promise<string[]> {
  if (!REGISTRY_ADDRESS) return [];
  const p = provider();
  const keys = new Set<string>();

  for (const eventName of ["Sealed", "Settled", "Forfeited"]) {
    let token: string | undefined = undefined;
    // The reputation key is the second key on every registry event: the first
    // is the event selector, the second is the `#[key]` field.
    do {
      const page: EventsPage = await p.getEvents({
        address: REGISTRY_ADDRESS,
        from_block: { block_number: 0 },
        to_block: "latest",
        keys: [[hash.getSelectorFromName(eventName)]],
        chunk_size: 100,
        continuation_token: token,
      });
      for (const e of page.events) {
        const k = e.keys?.[1];
        if (k) keys.add(num.toHex(BigInt(k)));
      }
      token = page.continuation_token;
    } while (token && keys.size < limit);
  }

  return [...keys].slice(0, limit);
}

export async function fetchRecord(
  reputationKey: string,
): Promise<ForecasterRecord | null> {
  if (!REGISTRY_ADDRESS) return null;
  try {
    const res = await provider().callContract({
      contractAddress: REGISTRY_ADDRESS,
      entrypoint: "get_record",
      calldata: [reputationKey],
    });
    // Record { open, resolved, forfeited, weighted_brier, weight_total }
    const [open, resolved, forfeited, weighted, weight] = res.map((v) =>
      Number(BigInt(v)),
    );
    const meanBrier = weight > 0 ? weighted / weight / BP : REFERENCE_BRIER;
    return {
      reputationKey,
      open,
      resolved,
      forfeited,
      meanBrier,
      skill: skillScore(meanBrier),
    };
  } catch {
    return null;
  }
}

export async function fetchCalibration(
  reputationKey: string,
): Promise<CalibrationBin[]> {
  if (!REGISTRY_ADDRESS) return [];
  const p = provider();
  const bins: CalibrationBin[] = [];

  for (let i = 0; i < 5; i++) {
    try {
      const res = await p.callContract({
        contractAddress: REGISTRY_ADDRESS,
        entrypoint: "get_bin",
        calldata: [reputationKey, String(i)],
      });
      const [count, hits, claimedSum] = res.map((v) => Number(BigInt(v)));
      bins.push({
        bucket: (i + 0.5) / 5,
        claimed: count > 0 ? claimedSum / count / BP : (i + 0.5) / 5,
        observed: count > 0 ? hits / count : 0,
        count,
      });
    } catch {
      bins.push({
        bucket: (i + 0.5) / 5,
        claimed: (i + 0.5) / 5,
        observed: 0,
        count: 0,
      });
    }
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
