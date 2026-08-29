"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, Loader2, Trophy, Ban, Clock, Search } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/landing/Proof";
import { XenceMark } from "@/components/brand/XenceMark";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { fetchLeaderboard, type ForecasterRecord } from "@/lib/registry";
import { handleFor } from "@/lib/forecast";
import { REGISTRY_ADDRESS } from "@/lib/config";
import { cn } from "@/lib/cn";

export default function LeaderboardPage() {
  const [rows, setRows] = useState<ForecasterRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "alpha" | "clean">("all");

  useEffect(() => {
    let live = true;
    fetchLeaderboard()
      .then((r) => live && setRows(r))
      .catch((e) => live && setError(e instanceof Error ? e.message : "Failed"));
    return () => {
      live = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    if (!rows) return null;
    return rows.filter((r) => {
      const handle = handleFor(r.reputationKey).toLowerCase();
      const key = r.reputationKey.toLowerCase();
      const matchesQuery = !query || handle.includes(query.toLowerCase()) || key.includes(query.toLowerCase());
      if (!matchesQuery) return false;

      if (filter === "alpha") return r.skill > 0;
      if (filter === "clean") return r.forfeited === 0;
      return true;
    });
  }, [rows, query, filter]);

  return (
    <>
      <Nav />
      <main className="flex-1 pt-32 pb-24 bg-[#f8fafc]">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          
          <header className="mb-8">
            <span className="font-mono text-[11.5px] font-bold uppercase tracking-[0.22em] text-teal-700">
              The Public Record
            </span>
            <h1 className="mt-3 text-[clamp(2.3rem,4.5vw,3.5rem)] font-extrabold tracking-tight text-slate-950 leading-tight">
              Verified Forecaster Rankings
            </h1>
            <p className="mt-3 max-w-2xl text-[16.5px] leading-relaxed text-slate-600">
              Ranked by strictly proper Brier calibration against the coin-flip baseline. Recomputed 100% on-chain from Starknet events.
            </p>
          </header>

          {/* Search & Filter Bar */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by pseudonym or 0x key..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 font-mono text-[13px] text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 font-mono text-[12px]">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={cn(
                  "btn-spring rounded-xl px-3.5 py-2 transition-colors font-bold",
                  filter === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                All ({rows?.length ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setFilter("alpha")}
                className={cn(
                  "btn-spring rounded-xl px-3.5 py-2 transition-colors font-bold",
                  filter === "alpha"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                +Alpha Only
              </button>
              <button
                type="button"
                onClick={() => setFilter("clean")}
                className={cn(
                  "btn-spring rounded-xl px-3.5 py-2 transition-colors font-bold",
                  filter === "clean"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                0 Forfeits
              </button>
            </div>
          </div>

          <div className="mt-8">
            {error ? (
              <Empty
                title="Couldn't reach the chain"
                body={error}
              />
            ) : rows === null ? (
              <div className="flex items-center justify-center gap-3 py-24 text-slate-500">
                <Loader2 size={18} className="animate-spin text-teal-600" />
                <span className="text-[14px] font-medium">Reading the registry on-chain…</span>
              </div>
            ) : filteredRows && filteredRows.length === 0 ? (
              <Empty
                title={
                  query
                    ? "No matching forecasters found"
                    : REGISTRY_ADDRESS
                      ? "Nobody has been scored yet"
                      : "Registry not deployed yet"
                }
                body={
                  query
                    ? `No forecaster matched "${query}". Try another pseudonym or address.`
                    : REGISTRY_ADDRESS
                      ? "Forecasters appear here automatically once their first sealed claim resolves and is scored on-chain."
                      : "Once the contracts are deployed to mainnet, this leaderboard is generated live from Starknet events."
                }
              />
            ) : (
              <Table rows={filteredRows!} />
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
          <tr className="text-left font-mono text-[10.5px] uppercase tracking-[0.16em] text-slate-500">
            <th className="px-5 pb-2 font-bold">#</th>
            <th className="px-5 pb-2 font-bold">Forecaster</th>
            <th className="px-5 pb-2 text-right font-bold">Skill vs Coin</th>
            <th className="px-5 pb-2 text-right font-bold">Brier Score</th>
            <th className="px-5 pb-2 text-right font-bold">Resolved</th>
            <th className="px-5 pb-2 text-right font-bold">Forfeits</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.reputationKey}
              className="group transition-all"
            >
              <td className="rounded-l-2xl border-y border-l border-slate-200 bg-white px-5 py-4 shadow-xs">
                <span
                  className={cn(
                    "tnum font-mono text-[13px] font-bold",
                    i === 0
                      ? "inline-flex items-center gap-1.5 text-amber-600"
                      : i === 1
                        ? "text-slate-800"
                        : i === 2
                          ? "text-slate-700"
                          : "text-slate-500",
                  )}
                >
                  {i === 0 ? (
                    <Trophy size={14} className="text-amber-500" />
                  ) : (
                    `#${i + 1}`
                  )}
                </span>
              </td>
              <td className="border-y border-slate-200 bg-white px-5 py-4 shadow-xs">
                <Link
                  href={`/f/${r.reputationKey}`}
                  className="btn-spring inline-flex items-center gap-2.5 text-base font-bold text-slate-900 transition-colors hover:text-teal-700"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 font-mono text-[11px] font-bold text-teal-800 border border-teal-200">
                    {r.reputationKey.slice(2, 4).toUpperCase()}
                  </span>
                  {handleFor(r.reputationKey)}
                  <ArrowUpRight
                    size={14}
                    className="opacity-0 transition-opacity group-hover:opacity-100 text-teal-600"
                  />
                </Link>
              </td>
              <td className="border-y border-slate-200 bg-white px-5 py-4 text-right shadow-xs">
                <span
                  className={cn(
                    "tnum inline-flex items-center rounded-lg px-2.5 py-1 font-mono text-[12.5px] font-bold",
                    r.skill > 0
                      ? "bg-teal-50 text-teal-800 border border-teal-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200",
                  )}
                >
                  {r.skill > 0 ? "+" : ""}
                  {(r.skill * 100).toFixed(1)}%
                </span>
              </td>
              <td className="tnum border-y border-slate-200 bg-white px-5 py-4 text-right font-mono text-[13.5px] font-bold text-slate-900 shadow-xs">
                {r.meanBrier.toFixed(3)}
              </td>
              <td className="tnum border-y border-slate-200 bg-white px-5 py-4 text-right font-mono text-[13.5px] text-slate-600 shadow-xs">
                {r.resolved}
              </td>
              <td className="rounded-r-2xl border-y border-r border-slate-200 bg-white px-5 py-4 text-right shadow-xs">
                <span
                  className={cn(
                    "tnum font-mono text-[13px]",
                    r.forfeited > 0 ? "font-bold text-rose-600" : "text-slate-400",
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

      <p className="mt-6 flex items-center gap-2 text-[12.5px] text-slate-500 font-medium">
        <Clock size={14} className="shrink-0 text-teal-600" />
        Unrevealed forecasts automatically forfeit at maximum Brier penalty (1.00) to guarantee verifiable calibration.
      </p>
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <SpotlightCard className="flex flex-col items-center p-12 text-center bg-white border border-slate-200 shadow-sm">
      <XenceMark size={48} accent="#bd7407" alive />
      <h2 className="mt-6 text-2xl font-bold text-slate-950">{title}</h2>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-slate-600">
        {body}
      </p>
      <Link
        href="/app"
        className="btn-primary mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[14px] font-bold shadow-md"
      >
        Seal the first forecast <ArrowUpRight size={15} />
      </Link>
    </SpotlightCard>
  );
}
