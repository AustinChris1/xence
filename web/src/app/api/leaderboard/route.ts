import { NextResponse } from "next/server";
import { fetchLeaderboard } from "@/lib/registry";

/**
 * The leaderboard, rebuilt once on the server rather than in every browser.
 *
 * Ranking means walking each registry's events in windows, which takes
 * seconds. Doing that per visitor is why the page felt broken; doing it here
 * and caching the answer keeps it chain-derived and instant.
 */
export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  try {
    const rows = await fetchLeaderboard();
    return NextResponse.json(
      { rows, at: Date.now() },
      {
        headers: {
          "cache-control": "public, s-maxage=60, stale-while-revalidate=600",
        },
      },
    );
  } catch {
    // A slow chain should not render an error page; the client falls back.
    return NextResponse.json({ rows: [], at: Date.now(), degraded: true });
  }
}
