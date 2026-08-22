"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ban, Check, Clock, Loader2 } from "lucide-react";
import { CalibrationPlot } from "@/components/art/CalibrationPlot";
import { InfoTip } from "@/components/ui/InfoTip";
import {
  fetchActivity,
  fetchCalibration,
  fetchRecord,
  type Activity,
  type ForecasterRecord,
} from "@/lib/registry";
import { handleFor } from "@/lib/forecast";
import type { CalibrationBin } from "@/lib/scoring";
import { txUrl } from "@/lib/config";
import { cn } from "@/lib/cn";

function Panel({
  title,
  tip,
  children,
}: {
  title: string;
  tip?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--edge)] bg-cream-100">
      <div className="flex items-center gap-1.5 border-b border-[var(--edge)] px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
          {title}
        </span>
        {tip ? <InfoTip align="left">{tip}</InfoTip> : null}
      </div>
      {children}
    </section>
  );
}

/** The connected identity's own record, read from the chain. */
export function MyRecord({ reputationKey }: { reputationKey: string | null }) {
  // Keyed by the identity it describes, so a slow read for a previous key is
  // never shown against a new one, and "loading" needs no separate flag.
  const [loaded, setLoaded] = useState<{
    key: string;
    record: ForecasterRecord | null;
    bins: CalibrationBin[];
  } | null>(null);

  useEffect(() => {
    if (!reputationKey) return;
    let live = true;
    Promise.all([fetchRecord(reputationKey), fetchCalibration(reputationKey)]).then(
      ([r, b]) => {
        if (live) setLoaded({ key: reputationKey, record: r, bins: b });
      },
    );
    return () => {
      live = false;
    };
  }, [reputationKey]);

  const fresh = loaded?.key === reputationKey ? loaded : null;
  const record = fresh?.record ?? null;
  const bins = fresh?.bins ?? [];
  const loading = Boolean(reputationKey) && !fresh;
  const tested = record ? record.resolved + record.forfeited : 0;

  return (
    <Panel
      title="Your record"
      tip="Read from registry events, not from this browser. Anyone can rebuild it, and nothing here can be edited after the fact."
    >
      {!reputationKey ? (
        <p className="px-4 py-6 text-center text-[13px] text-[var(--text-faint)]">
          No identity yet.
        </p>
      ) : loading ? (
        <p className="flex items-center justify-center gap-2 px-4 py-8 text-[13px] text-[var(--text-faint)]">
          <Loader2 size={13} className="animate-spin" /> reading
        </p>
      ) : tested === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="font-display text-2xl text-teal-900">
            {handleFor(reputationKey)}
          </p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--text-faint)]">
            {record && record.open > 0
              ? `${record.open} sealed, none opened yet. A record means nothing until calls are scored.`
              : "Untested. That is not the same as good."}
          </p>
        </div>
      ) : (
        <>
          <dl className="grid grid-cols-3 gap-px bg-[var(--edge)]">
            <Stat
              k="vs coin flip"
              v={`${record!.skill > 0 ? "+" : ""}${(record!.skill * 100).toFixed(0)}%`}
              tone={record!.skill > 0 ? "good" : "bad"}
            />
            <Stat k="resolved" v={String(record!.resolved)} />
            <Stat
              k="forfeited"
              v={String(record!.forfeited)}
              tone={record!.forfeited > 0 ? "bad" : undefined}
            />
          </dl>
          <div className="p-3 text-teal-800">
            <CalibrationPlot bins={bins} size={320} className="w-full" />
          </div>
        </>
      )}
    </Panel>
  );
}

function Stat({ k, v, tone }: { k: string; v: string; tone?: "good" | "bad" }) {
  return (
    <div className="bg-cream-100 px-3 py-2.5">
      <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--text-faint)]">
        {k}
      </dt>
      <dd
        className={cn(
          "tnum mt-0.5 font-display text-xl",
          tone === "good"
            ? "text-teal-700"
            : tone === "bad"
              ? "text-seal-600"
              : "text-teal-900",
        )}
      >
        {v}
      </dd>
    </div>
  );
}

export function RecentActivity() {
  const [rows, setRows] = useState<Activity[] | null>(null);

  useEffect(() => {
    let live = true;
    fetchActivity(10).then((r) => live && setRows(r));
    const id = setInterval(() => fetchActivity(10).then((r) => live && setRows(r)), 60_000);
    return () => {
      live = false;
      clearInterval(id);
    };
  }, []);

  return (
    <Panel
      title="On the record"
      tip="Every seal, reveal and forfeit in the protocol. A sealed row shows nothing about the call — that is the point."
    >
      {rows === null ? (
        <p className="flex items-center justify-center gap-2 px-4 py-8 text-[13px] text-[var(--text-faint)]">
          <Loader2 size={13} className="animate-spin" /> reading
        </p>
      ) : rows.length === 0 ? (
        <p className="px-4 py-6 text-center text-[13px] text-[var(--text-faint)]">
          Nothing sealed yet.
        </p>
      ) : (
        <ul>
          {rows.map((r) => (
            <li
              key={`${r.tx}-${r.kind}-${r.reputationKey}`}
              className="flex items-center gap-2.5 border-b border-[var(--edge)] px-4 py-2.5 last:border-b-0"
            >
              <Icon kind={r.kind} />
              <Link
                href={`/f/${r.reputationKey}`}
                className="font-mono text-[11.5px] text-teal-800 hover:text-teal-600"
              >
                {handleFor(r.reputationKey)}
              </Link>
              <span className="flex-1 truncate text-[12px] text-[var(--text-faint)]">
                {r.kind === "settled" && r.probabilityBp !== undefined
                  ? `said ${(r.probabilityBp / 100).toFixed(0)}% · ${r.outcome ? "happened" : "did not"}`
                  : r.kind === "forfeited"
                    ? "never opened"
                    : "sealed"}
              </span>
              <a
                href={txUrl(r.tx)}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 font-mono text-[10px] text-[var(--text-faint)] hover:text-teal-700"
              >
                {r.block}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function Icon({ kind }: { kind: Activity["kind"] }) {
  if (kind === "settled")
    return <Check size={12} className="shrink-0 text-teal-700" />;
  if (kind === "forfeited")
    return <Ban size={12} className="shrink-0 text-seal-600" />;
  return <Clock size={12} className="shrink-0 text-[var(--text-faint)]" />;
}
