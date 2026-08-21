"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Ban, Loader2 } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { XenceMark } from "@/components/brand/XenceMark";
import { CalibrationPlot } from "@/components/art/CalibrationPlot";
import { Reveal } from "@/components/ui/Reveal";
import {
  fetchCalibration,
  fetchRecord,
  type ForecasterRecord,
} from "@/lib/registry";
import { handleFor } from "@/lib/forecast";
import type { CalibrationBin } from "@/lib/scoring";
import { cn } from "@/lib/cn";

export default function ForecasterPage() {
  const params = useParams<{ key: string }>();
  const reputationKey = params?.key ?? "";

  const [record, setRecord] = useState<ForecasterRecord | null>(null);
  const [bins, setBins] = useState<CalibrationBin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reputationKey) return;
    let live = true;
    Promise.all([fetchRecord(reputationKey), fetchCalibration(reputationKey)])
      .then(([r, b]) => {
        if (!live) return;
        setRecord(r);
        setBins(b);
      })
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [reputationKey]);

  const tested = record ? record.resolved + record.forfeited : 0;

  return (
    <>
      <Nav />
      <main className="flex-1 pt-28 pb-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 text-[13px] text-[var(--text-faint)] transition-colors hover:text-teal-700"
          >
            <ArrowLeft size={13} /> All forecasters
          </Link>

          <header className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-seal-600">
                Forecaster
              </p>
              <h1 className="mt-2 font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-none text-teal-950">
                {reputationKey ? handleFor(reputationKey) : "—"}
              </h1>
              <p className="mt-2 break-all font-mono text-[11px] text-[var(--text-faint)]">
                {reputationKey}
              </p>
            </div>
            <XenceMark size={44} accent="var(--color-teal-700)" alive />
          </header>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-24 text-[var(--text-faint)]">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-[13.5px]">Reading the registry…</span>
            </div>
          ) : !record || tested === 0 ? (
            <div className="mt-12 rounded-2xl border border-[var(--edge)] bg-cream-100 px-6 py-16 text-center">
              <h2 className="font-display text-2xl text-teal-900">
                Nothing settled yet
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-[var(--text-faint)]">
                {record && record.open > 0
                  ? `${record.open} forecast${record.open === 1 ? "" : "s"} sealed and still running. A record only means something once calls have been opened and scored.`
                  : "This key has no history on-chain."}
              </p>
            </div>
          ) : (
            <>
              <Reveal>
                <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--edge)] sm:grid-cols-4">
                  <Stat
                    k="vs coin flip"
                    v={`${record.skill > 0 ? "+" : ""}${(record.skill * 100).toFixed(1)}%`}
                    tone={record.skill > 0 ? "good" : "bad"}
                  />
                  <Stat k="Brier" v={record.meanBrier.toFixed(3)} />
                  <Stat k="Resolved" v={String(record.resolved)} />
                  <Stat
                    k="Forfeited"
                    v={String(record.forfeited)}
                    tone={record.forfeited > 0 ? "bad" : undefined}
                  />
                </dl>
              </Reveal>

              <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-start">
                <Reveal>
                  <div className="rounded-2xl border border-[var(--edge)] bg-cream-300/50 p-4 text-teal-900 sm:p-6">
                    <CalibrationPlot bins={bins} size={440} className="w-full" />
                    <p className="mt-3 text-center text-[12px] text-[var(--text-faint)]">
                      Claimed against observed. On the pale diagonal is honest;
                      below it is overconfident.
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={0.1}>
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-[var(--edge)] bg-cream-100 p-5">
                      <h2 className="font-display text-xl text-teal-950">
                        Reading this
                      </h2>
                      <p className="mt-2.5 text-[13.5px] leading-relaxed text-[var(--text-dim)]">
                        {record.skill > 0.15
                          ? "Consistently better than guessing, across enough resolved calls to be more than luck."
                          : record.skill > 0
                            ? "Slightly better than a coin flip. Real, but not yet a large edge."
                            : "Not currently beating a coin flip. Worth knowing before paying for the next call."}
                      </p>
                    </div>

                    {record.forfeited > 0 ? (
                      <div className="flex gap-3 rounded-2xl border border-seal-500/40 bg-seal-500/10 p-5">
                        <Ban size={15} className="mt-0.5 shrink-0 text-seal-500" />
                        <div>
                          <p className="text-[13.5px] font-medium text-seal-600">
                            {record.forfeited} forecast
                            {record.forfeited === 1 ? "" : "s"} never opened
                          </p>
                          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-dim)]">
                            Sealed, then left to expire. Each is scored at the
                            maximum possible error and is already priced into
                            the number above — being wrong out loud would have
                            cost less.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-teal-600/30 bg-teal-600/10 p-5">
                        <p className="text-[13.5px] font-medium text-teal-800">
                          Every call opened
                        </p>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-dim)]">
                          No forfeits. Nothing sealed here was quietly allowed to
                          expire, which is the part a screenshot can never show.
                        </p>
                      </div>
                    )}

                    {record.open > 0 ? (
                      <div className="rounded-2xl border border-[var(--edge)] bg-cream-100 p-5">
                        <p className="text-[13.5px] text-teal-900">
                          {record.open} still sealed
                        </p>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-faint)]">
                          Running now, unreadable until their horizons pass.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </Reveal>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function Stat({
  k,
  v,
  tone,
}: {
  k: string;
  v: string;
  tone?: "good" | "bad";
}) {
  return (
    <div className="bg-cream-100 p-5">
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
        {k}
      </dt>
      <dd
        className={cn(
          "tnum mt-1.5 font-display text-3xl",
          tone === "good"
            ? "text-teal-600"
            : tone === "bad"
              ? "text-seal-500"
              : "text-teal-900",
        )}
      >
        {v}
      </dd>
    </div>
  );
}
