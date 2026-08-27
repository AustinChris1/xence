"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Loader2, Trophy, Ban, Clock } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/landing/Proof";
import { XenceMark } from "@/components/brand/XenceMark";
import { fetchLeaderboard, type ForecasterRecord } from "@/lib/registry";
import { handleFor } from "@/lib/forecast";
import { REGISTRY_ADDRESS } from "@/lib/config";
import { cn } from "@/lib/cn";

export default function LeaderboardPage() {
  const [rows, setRows] = useState<ForecasterRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetchLeaderboard()
      .then((r) => live && setRows(r))
      .catch((e) => live && setError(e instanceof Error ? e.message : "Failed"));
    return () => {
      live = false;
    };
  }, []);

  return (
    <>
      <Nav />
      <main className="flex-1 pt-32 pb-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <header className="mb-4">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-600">
              The Public Record
            </span>
            <h1 className="mt-3 text-[clamp(2.2rem,4.5vw,3.5rem)] font-bold tracking-tight text-teal-950 leading-tight">
              Verified Forecaster Rankings
            </h1>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-cream-500">
              Ranked by strictly proper Brier calibration against the coin-flip baseline. Recomputed 100% on-chain from Starknet events.
            </p>
          </header>

          <div className="mt-10">
            {error ? (
              <Empty
                title="Couldn't reach the chain"
                body={error}
              />
            ) : rows === null ? (
              <div className="flex items-center justify-center gap-3 py-20 text-cream-400">
                <Loader2 size={18} className="animate-spin text-teal-600" />
                <span className="text-[14px]">Reading the registry on-chain…</span>
              </div>
            ) : rows.length === 0 ? (
              <Empty
                title={
                  REGISTRY_ADDRESS
                    ? "Nobody has been scored yet"
                    : "Registry not deployed yet"
                }
                body={
                  REGISTRY_ADDRESS
                    ? "Forecasters appear here automatically once their first sealed claim resolves and is scored on-chain."
                    : "Once the contracts are deployed to mainnet, this leaderboard is generated live from Starknet events."
                }
              />
            ) : (
              <Table rows={rows} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Table({ rows }: { rows: ForecasterRecord[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-y-2.5">
        <thead>
          <tr className="text-left font-mono text-[10.5px] uppercase tracking-[0.16em] text-cream-400">
            <th className="px-5 pb-2 font-semibold">#</th>
            <th className="px-5 pb-2 font-semibold">Forecaster</th>
            <th className="px-5 pb-2 text-right font-semibold">Skill vs Coin</th>
            <th className="px-5 pb-2 text-right font-semibold">Brier Score</th>
            <th className="px-5 pb-2 text-right font-semibold">Resolved</th>
            <th className="px-5 pb-2 text-right font-semibold">Forfeits</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.reputationKey}
              className="group transition-all"
            >
              <td className="rounded-l-2xl border-y border-l border-cream-300 bg-white px-5 py-4 backdrop-blur-md">
                <span
                  className={cn(
                    "tnum font-mono text-[13px] font-bold",
                    i === 0
                      ? "inline-flex items-center gap-1.5 text-teal-700"
                      : i === 1
                        ? "text-teal-900"
                        : i === 2
                          ? "text-cream-500"
                          : "text-cream-400",
                  )}
                >
                  {i === 0 ? (
                    <Trophy size={14} className="text-amber-400" />
                  ) : (
                    `#${i + 1}`
                  )}
                </span>
              </td>
              <td className="border-y border-cream-300 bg-white px-5 py-4 backdrop-blur-md">
                <Link
                  href={`/f/${r.reputationKey}`}
                  className="btn-spring inline-flex items-center gap-2.5 text-base font-semibold text-teal-950 transition-colors hover:text-teal-700"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/15 font-mono text-[11px] font-bold text-teal-700 border border-teal-600/35">
                    {r.reputationKey.slice(2, 4).toUpperCase()}
                  </span>
                  {handleFor(r.reputationKey)}
                  <ArrowUpRight
                    size={14}
                    className="opacity-0 transition-opacity group-hover:opacity-80 text-teal-600"
                  />
                </Link>
              </td>
              <td className="border-y border-cream-300 bg-white px-5 py-4 text-right backdrop-blur-md">
                <span
                  className={cn(
                    "tnum inline-flex items-center rounded-lg px-2.5 py-1 font-mono text-[12.5px] font-bold",
                    r.skill > 0
                      ? "bg-teal-500/15 text-teal-700 border border-teal-600/35"
                      : "bg-rose-500/15 text-rose-600 border border-rose-400/45",
                  )}
                >
                  {r.skill > 0 ? "+" : ""}
                  {(r.skill * 100).toFixed(1)}%
                </span>
              </td>
              <td className="tnum border-y border-cream-300 bg-white px-5 py-4 text-right font-mono text-[13.5px] font-semibold text-teal-950 backdrop-blur-md">
                {r.meanBrier.toFixed(3)}
              </td>
              <td className="tnum border-y border-cream-300 bg-white px-5 py-4 text-right font-mono text-[13.5px] text-cream-500 backdrop-blur-md">
                {r.resolved}
              </td>
              <td className="rounded-r-2xl border-y border-r border-cream-300 bg-white px-5 py-4 text-right backdrop-blur-md">
                <span
                  className={cn(
                    "tnum font-mono text-[13px]",
                    r.forfeited > 0 ? "font-bold text-rose-600" : "text-cream-400",
                  )}
                >
                  {r.forfeited > 0 ? (
                    <span className="inline-flex items-center gap-1 text-rose-600">
                      <Ban size={12} /> {r.forfeited}
                    </span>
                  ) : (
                    "0"
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-6 flex items-center gap-2 text-[12.5px] text-cream-400">
        <Clock size={14} className="shrink-0 text-teal-600" />
        Unrevealed forecasts automatically forfeit at maximum Brier penalty (1.00) to guarantee verifiable calibration.
      </p>
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-cream-300 bg-white px-6 py-20 text-center backdrop-blur-xl shadow-xl">
      <XenceMark size={48} accent="#2dd4bf" alive />
      <h2 className="mt-6 text-2xl font-bold text-teal-950">{title}</h2>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-cream-500">
        {body}
      </p>
      <Link
        href="/app"
        className="btn-spring mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-3 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(13,148,136,0.18)]"
      >
        Seal the first forecast <ArrowUpRight size={15} />
      </Link>
    </div>
  );
}
