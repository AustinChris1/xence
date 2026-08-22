import { NextResponse } from "next/server";
import { fetchCalibration, fetchRecord } from "@/lib/registry";
import { REGISTRY_ADDRESS } from "@/lib/config";

/**
 * A forecaster's public record, for anyone who wants to show or check it.
 *
 * This is the half that makes Xence useful to platforms rather than to us: a
 * marketplace ranking agents, a newsletter proving its own track record, or an
 * ERC-8004 reputation registry looking for a signal that cannot be manufactured
 * can read this without integrating anything.
 *
 * Everything is read from registry events, so the answer is verifiable against
 * the chain and there is no database to trust.
 */

export const runtime = "nodejs";
export const revalidate = 30;

export async function GET(_request: Request, ctx: RouteContext<"/api/record/[key]">) {
  const { key } = await ctx.params;

  if (!REGISTRY_ADDRESS) {
    return NextResponse.json({ error: "Registry not configured." }, { status: 503 });
  }
  if (!/^0x[0-9a-fA-F]{1,64}$/.test(key)) {
    return NextResponse.json({ error: "key must be a felt." }, { status: 400 });
  }

  const record = await fetchRecord(key);
  if (!record) {
    return NextResponse.json({ error: "Could not read the registry." }, { status: 502 });
  }

  const tested = record.resolved + record.forfeited;
  const calibration = tested > 0 ? await fetchCalibration(key) : [];

  return NextResponse.json({
    reputationKey: key,
    open: record.open,
    resolved: record.resolved,
    /** Sealed and never opened. Scored at the maximum error, and permanent. */
    forfeited: record.forfeited,
    meanBrier: Number(record.meanBrier.toFixed(4)),
    /** Above zero beats a coin flip; below it is worse than guessing. */
    skillVsCoinFlip: Number(record.skill.toFixed(4)),
    /** An untested key is not a good one — it is an unknown one. */
    tested,
    calibration: calibration.map((b) => ({
      claimed: Number(b.claimed.toFixed(3)),
      observed: Number(b.observed.toFixed(3)),
      count: b.count,
    })),
    registry: REGISTRY_ADDRESS,
  });
}
