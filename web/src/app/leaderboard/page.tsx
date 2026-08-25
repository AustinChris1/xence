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
              The public record
            </p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] text-teal-950">
              <RevealWords text="Who actually" />{" "}
              <span className="italic text-teal-700">
                <RevealWords text="knows things." delay={0.15} />
              </span>
            </h1>
            <Reveal delay={0.25}>
              <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-[var(--text-dim)]">
                Ranked by calibration against the coin-flip baseline, not by
                profit and not by follower count. Every number here was rebuilt
                from on-chain events — no backend sits between a forecaster&apos;s
                score and you.
              </p>
            </Reveal>
          </header>

          <div className="mt-12">
            {error ? (
              <Empty
                title="Couldn't reach the chain"
                body={error}
              />
            ) : rows === null ? (
              <div className="flex items-center justify-center gap-3 py-24 text-[var(--text-faint)]">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-[13.5px]">Reading the registry…</span>
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
                    ? "A forecaster appears here once their first sealed call has been revealed and settled — not when they seal it. An unresolved record says nothing, and a leaderboard topped by someone who has never been tested would be worse than no leaderboard."
                    : "Once the contracts are on mainnet this page rebuilds itself from registry events. Nothing here is stored off-chain."
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
            <th className="px-4 pb-2 text-right font-normal">vs coin flip</th>
            <th className="px-4 pb-2 text-right font-normal">Brier</th>
            <th className="px-4 pb-2 text-right font-normal">Resolved</th>
            <th className="px-4 pb-2 text-right font-normal">Forfeited</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <motion.tr
              key={r.reputationKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.5), duration: 0.5 }}
              className="group"
            >
              <td className="rounded-l-xl border-y border-l border-[var(--edge)] bg-cream-100 px-4 py-3.5">
                <span
                  className={cn(
                    "tnum font-mono text-[13px]",
                    i === 0 ? "text-teal-700" : "text-[var(--text-faint)]",
                  )}
                >
                  {i === 0 ? <Trophy size={13} className="inline" /> : i + 1}
                </span>
              </td>
              <td className="border-y border-[var(--edge)] bg-cream-100 px-4 py-3.5">
                <Link
                  href={`/f/${r.reputationKey}`}
                  className="inline-flex items-center gap-2 font-display text-lg text-teal-900 transition-colors hover:text-teal-700"
                >
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
                    "tnum font-mono text-[14px]",
                    r.skill > 0 ? "text-teal-600" : "text-seal-500",
                  )}
                >
                  {r.skill > 0 ? "+" : ""}
                  {(r.skill * 100).toFixed(1)}%
                </span>
              </td>
              <td className="tnum border-y border-[var(--edge)] bg-cream-100 px-4 py-3.5 text-right font-mono text-[13px] text-[var(--text-dim)]">
                {r.meanBrier.toFixed(3)}
              </td>
              <td className="tnum border-y border-[var(--edge)] bg-cream-100 px-4 py-3.5 text-right font-mono text-[13px] text-[var(--text-dim)]">
                {r.resolved}
              </td>
              <td className="rounded-r-xl border-y border-r border-[var(--edge)] bg-cream-100 px-4 py-3.5 text-right">
                <span
                  className={cn(
                    "tnum font-mono text-[13px]",
                    r.forfeited > 0 ? "text-seal-500" : "text-[var(--text-faint)]",
                  )}
                >
                  {r.forfeited > 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <Ban size={11} />
                      {r.forfeited}
                    </span>
                  ) : (
                    "—"
                  )}
                </span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      <p className="mt-6 flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--text-faint)]">
        <Clock size={13} className="mt-0.5 shrink-0" />
        Forfeits are forecasts that expired unrevealed. They are scored at the
        maximum possible error and counted here permanently — the one column
        that says nothing about what someone thought, only that they would not
        say.
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
        className="mt-7 inline-flex items-center gap-2 rounded-full border border-[var(--edge-strong)] px-5 py-2.5 text-[13.5px] text-teal-900 transition-colors hover:bg-cream-300/60"
      >
        Seal the first one <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}
