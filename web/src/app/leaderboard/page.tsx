"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Loader2, Trophy, Ban, Clock } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/landing/Proof";
import { XenceMark } from "@/components/brand/XenceMark";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
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
      <main className="flex-1 pt-28 pb-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <header className="mb-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-seal-600">
              The Public Record
            </p>
            <h1 className="mt-2 font-display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] text-teal-950">
              <RevealWords text="Verified Forecaster" />{" "}
              <span className="italic text-teal-700">
                <RevealWords text="Rankings." delay={0.15} />
              </span>
            </h1>
            <Reveal delay={0.25}>
              <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-[var(--text-dim)]">
                Ranked by strictly proper Brier calibration against the coin-flip baseline. Recomputed 100% on-chain from Starknet events.
              </p>
            </Reveal>
          </header>

          <div className="mt-10">
            {error ? (
              <Empty
                title="Couldn't reach the chain"
                body={error}
              />
            ) : rows === null ? (
              <div className="flex items-center justify-center gap-3 py-20 text-[var(--text-faint)]">
                <Loader2 size={16} className="animate-spin text-teal-700" />
                <span className="text-[13.5px]">Reading the registry on-chain…</span>
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
      <table className="w-full min-w-[640px] border-separate border-spacing-y-2">
        <thead>
          <tr className="text-left font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
            <th className="px-4 pb-2 font-normal">#</th>
            <th className="px-4 pb-2 font-normal">Forecaster</th>
            <th className="px-4 pb-2 text-right font-normal">Skill vs Coin</th>
            <th className="px-4 pb-2 text-right font-normal">Brier Score</th>
            <th className="px-4 pb-2 text-right font-normal">Resolved</th>
            <th className="px-4 pb-2 text-right font-normal">Forfeits</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <motion.tr
              key={r.reputationKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.4), duration: 0.35 }}
              className="card-hover group"
            >
              <td className="rounded-l-2xl border-y border-l border-[var(--edge)] bg-cream-100 px-4 py-3.5">
                <span
                  className={cn(
                    "tnum font-mono text-[13px] font-bold",
                    i === 0
                      ? "inline-flex items-center gap-1 text-teal-700"
                      : i === 1
                        ? "text-teal-800"
                        : i === 2
                          ? "text-teal-900"
                          : "text-[var(--text-faint)]",
                  )}
                >
                  {i === 0 ? (
                    <Trophy size={14} className="text-teal-600" />
                  ) : (
                    `#${i + 1}`
                  )}
                </span>
              </td>
              <td className="border-y border-[var(--edge)] bg-cream-100 px-4 py-3.5">
                <Link
                  href={`/f/${r.reputationKey}`}
                  className="btn-spring inline-flex items-center gap-2 font-display text-lg font-medium text-teal-900 transition-colors hover:text-teal-700"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-700/10 font-mono text-[10px] text-teal-800">
                    {r.reputationKey.slice(2, 4).toUpperCase()}
                  </span>
                  {handleFor(r.reputationKey)}
                  <ArrowUpRight
                    size={13}
                    className="opacity-0 transition-opacity group-hover:opacity-60"
                  />
                </Link>
              </td>
              <td className="border-y border-[var(--edge)] bg-cream-100 px-4 py-3.5 text-right">
                <span
                  className={cn(
                    "tnum inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[12.5px] font-bold",
                    r.skill > 0
                      ? "bg-teal-700/10 text-teal-700"
                      : "bg-seal-500/10 text-seal-600",
                  )}
                >
                  {r.skill > 0 ? "+" : ""}
                  {(r.skill * 100).toFixed(1)}%
                </span>
              </td>
              <td className="tnum border-y border-[var(--edge)] bg-cream-100 px-4 py-3.5 text-right font-mono text-[13px] font-medium text-teal-900">
                {r.meanBrier.toFixed(3)}
              </td>
              <td className="tnum border-y border-[var(--edge)] bg-cream-100 px-4 py-3.5 text-right font-mono text-[13px] text-[var(--text-dim)]">
                {r.resolved}
              </td>
              <td className="rounded-r-2xl border-y border-r border-[var(--edge)] bg-cream-100 px-4 py-3.5 text-right">
                <span
                  className={cn(
                    "tnum font-mono text-[13px]",
                    r.forfeited > 0 ? "font-bold text-seal-600" : "text-[var(--text-faint)]",
                  )}
                >
                  {r.forfeited > 0 ? (
                    <span className="inline-flex items-center gap-1 text-seal-600">
                      <Ban size={12} /> {r.forfeited}
                    </span>
                  ) : (
                    "0"
                  )}
                </span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      <p className="mt-5 flex items-center gap-2 text-[12px] text-[var(--text-faint)]">
        <Clock size={13} className="shrink-0 text-seal-600" />
        Unrevealed forecasts automatically forfeit at maximum Brier penalty (1.00) to guarantee verifiable calibration.
      </p>
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-[var(--edge)] bg-cream-100 px-6 py-20 text-center">
      <XenceMark size={44} accent="var(--color-teal-500)" />
      <h2 className="mt-6 font-display text-2xl text-teal-900">{title}</h2>
      <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-[var(--text-faint)]">
        {body}
      </p>
      <Link
        href="/app"
        className="btn-spring mt-7 inline-flex items-center gap-2 rounded-full border border-[var(--edge-strong)] px-5 py-2.5 text-[13.5px] text-teal-900 transition-colors hover:bg-cream-300/60"
      >
        Seal the first one <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}
