"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Ban,
  Check,
  Clock,
  Copy,
  HandCoins,
  KeyRound,
  Loader2,
} from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/landing/Proof";
import { XenceMark } from "@/components/brand/XenceMark";
import { CalibrationPlot } from "@/components/art/CalibrationPlot";
import {
  fetchCalibration,
  fetchPayout,
  fetchRecord,
  type ForecasterRecord,
} from "@/lib/registry";
import { backForecaster, explainWalletError } from "@/lib/strk20";
import { useXence } from "@/components/app/useXence";
import { InfoTip } from "@/components/ui/InfoTip";
import { txUrl } from "@/lib/config";
import { handleFor } from "@/lib/forecast";
import { fetchClaims, type PublicClaim } from "@/lib/vault";
import { TIERS } from "@/lib/scoring";
import { useNow } from "@/components/app/useNow";
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
      <main className="flex-1 pt-32 pb-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 transition-colors hover:text-teal-300"
          >
            <ArrowLeft size={13} /> All forecasters
          </Link>

          <header className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-400">
                Forecaster Profile
              </span>
              <h1 className="mt-2 text-[clamp(2.2rem,5vw,3.5rem)] font-bold leading-tight text-white">
                {reputationKey ? handleFor(reputationKey) : "—"}
              </h1>
              <p className="mt-2 break-all font-mono text-[11px] text-slate-400">
                {reputationKey}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ShareLink />
              <XenceMark size={44} accent="#2dd4bf" alive />
            </div>
          </header>

          <BackPanel reputationKey={reputationKey} />

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-24 text-slate-400">
              <Loader2 size={18} className="animate-spin text-teal-400" />
              <span className="text-[14px]">Reading the registry…</span>
            </div>
          ) : !record || tested === 0 ? (
            <div className="mt-12 rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-16 text-center backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-white">
                Nothing settled yet
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-slate-300">
                {record && record.open > 0
                  ? `${record.open} forecast${record.open === 1 ? "" : "s"} sealed and still running. A record only means something once calls have been opened and scored.`
                  : "This key has no history on-chain."}
              </p>
            </div>
          ) : (
            <>
              <dl className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-4">
                <Stat
                  k="vs coin flip"
                  v={`${record.skill > 0 ? "+" : ""}${(record.skill * 100).toFixed(1)}%`}
                  tone={record.skill > 0 ? "good" : "bad"}
                />
                <Stat k="Brier Score" v={record.meanBrier.toFixed(3)} />
                <Stat k="Resolved" v={String(record.resolved)} />
                <Stat
                  k="Forfeited"
                  v={String(record.forfeited)}
                  tone={record.forfeited > 0 ? "bad" : undefined}
                />
              </dl>

              <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-start">
                <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-white shadow-xl backdrop-blur-xl sm:p-8">
                  <CalibrationPlot bins={bins} size={440} className="w-full" />
                  <p className="mt-4 text-center text-[12px] text-slate-400">
                    Claimed against observed. On the pale diagonal is honest;
                    below it is overconfident.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                    <h2 className="text-xl font-bold text-white">
                      Reading this record
                    </h2>
                    <p className="mt-2.5 text-[14px] leading-relaxed text-slate-300">
                      {record.skill > 0.15
                        ? "Consistently better than guessing, across enough resolved calls to be more than luck."
                        : record.skill > 0
                          ? "Slightly better than a coin flip. Real, but not yet a large edge."
                          : "Not currently beating a coin flip. Worth knowing before paying for the next call."}
                    </p>
                  </div>

                  {record.forfeited > 0 ? (
                    <div className="flex gap-3.5 rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6">
                      <Ban size={18} className="mt-0.5 shrink-0 text-rose-400" />
                      <div>
                        <p className="text-[14px] font-bold text-rose-300">
                          {record.forfeited} forecast
                          {record.forfeited === 1 ? "" : "s"} never opened
                        </p>
                        <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-300">
                          Sealed, then left to expire. Each is scored at the
                          maximum possible error (1.00) and is already priced into
                          the number above.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-teal-500/30 bg-teal-500/10 p-6">
                      <p className="text-[14px] font-bold text-teal-300">
                        Every call opened
                      </p>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-300">
                        No forfeits. Nothing sealed here was quietly allowed to
                        expire, which is the part a screenshot can never show.
                      </p>
                    </div>
                  )}

                  {record.open > 0 ? (
                    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
                      <p className="text-[14px] font-semibold text-white">
                        {record.open} still sealed
                      </p>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-400">
                        Running now, unreadable until their horizons pass.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          )}

          <ClaimHistory reputationKey={reputationKey} />

          <p className="mt-10 flex items-start gap-2.5 text-[12.5px] leading-relaxed text-slate-400">
            <KeyRound size={14} className="mt-0.5 shrink-0 text-teal-400" />
            <span>
              This page is rebuilt from chain events, so it outlives any browser.
              The key that signs new forecasts does not: it is generated in the
              forecaster&apos;s browser and never sent anywhere, so clearing site
              data loses the identity, not the record. Export it if it matters.
            </span>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

function BackPanel({ reputationKey }: { reputationKey: string }) {
  const x = useXence();
  const [payout, setPayout] = useState<{ key: string; addr: string | null } | null>(null);
  const [amount, setAmount] = useState(25);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reputationKey) return;
    let live = true;
    fetchPayout(reputationKey).then((addr) => {
      if (live) setPayout({ key: reputationKey, addr });
    });
    return () => {
      live = false;
    };
  }, [reputationKey]);

  const addr = payout?.key === reputationKey ? payout.addr : null;
  if (!addr) return null;

  const connected = x.wallet.status === "connected" && x.wallet.strk20;

  async function back() {
    if (x.wallet.status !== "connected") return;
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      setDone(await backForecaster(x.wallet.account, addr!, amount));
    } catch (e) {
      setError(explainWalletError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <HandCoins size={16} className="text-teal-400" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
          Back this forecaster
        </span>
        <InfoTip align="left">
          A private STRK20 transfer to the payout address this key signed for.
          Nobody — including them — learns who sent it.
        </InfoTip>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {[5, 25, 100].map((v) => (
          <button
            key={v}
            onClick={() => setAmount(v)}
            className={cn(
              "btn-spring rounded-xl px-4 py-2 font-mono text-[12.5px] font-semibold transition-all",
              amount === v
                ? "bg-teal-400 text-slate-950 shadow-[0_0_15px_rgba(45,212,191,0.4)]"
                : "border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white",
            )}
          >
            {v} STRK
          </button>
        ))}
        <button
          onClick={back}
          disabled={!connected || busy}
          className="btn-spring inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 px-5 py-2.5 text-[13.5px] font-bold text-slate-950 shadow-[0_0_20px_rgba(45,212,191,0.35)] transition-all disabled:opacity-40"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <HandCoins size={14} />}
          Back privately
        </button>
        {!connected ? (
          <span className="text-[12.5px] text-slate-400">
            connect a privacy wallet on the app page first
          </span>
        ) : null}
      </div>

      {done ? (
        <a
          href={txUrl(done)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 font-mono text-[12px] text-teal-300 underline underline-offset-2"
        >
          sent privately — {done.slice(0, 16)}… <ArrowUpRight size={12} />
        </a>
      ) : null}
      {error ? (
        <p className="mt-3 break-words text-[12.5px] text-rose-400">{error}</p>
      ) : null}
    </div>
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
    <div className="bg-[#0b1322] p-5">
      <dt className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {k}
      </dt>
      <dd
        className={cn(
          "tnum mt-1.5 font-display text-3xl font-bold font-mono",
          tone === "good"
            ? "text-teal-300"
            : tone === "bad"
              ? "text-rose-400"
              : "text-white",
        )}
      >
        {v}
      </dd>
    </div>
  );
}

function ShareLink() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        void navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className="btn-spring inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2 text-[13px] font-medium text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
    >
      {copied ? <Check size={13} className="text-teal-400" /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

function ClaimHistory({ reputationKey }: { reputationKey: string }) {
  const [rows, setRows] = useState<PublicClaim[] | null>(null);
  const now = useNow();

  useEffect(() => {
    if (!reputationKey) return;
    let live = true;
    fetchClaims(30, reputationKey).then((r) => live && setRows(r));
    return () => {
      live = false;
    };
  }, [reputationKey]);

  if (!rows || rows.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-white">The claims</h2>
        <InfoTip align="left">
          Read from vault events, not a database. Sealed rows show the
          question only — the probability stays dark until the forecaster
          opens the seal.
        </InfoTip>
      </div>

      <ul className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
        {rows.map((c) => (
          <li
            key={c.commitmentHash}
            className="flex items-start gap-3.5 border-b border-white/10 px-6 py-4.5 last:border-b-0"
          >
            {c.state === "settled" ? (
              <Check size={15} className="mt-1 shrink-0 text-teal-400" />
            ) : c.state === "forfeited" ? (
              <Ban size={15} className="mt-1 shrink-0 text-rose-400" />
            ) : (
              <Clock size={15} className="mt-1 shrink-0 text-slate-400" />
            )}

            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium text-white">{c.question}</p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-slate-400">
                {c.state === "settled" && c.probabilityBp !== undefined
                  ? `Said ${(c.probabilityBp / 100).toFixed(0)}% — it ${c.outcome ? "happened" : "did not"}${
                      c.brierBp !== undefined
                        ? `. Brier ${(c.brierBp / 10_000).toFixed(2)}`
                        : ""
                    }`
                  : c.state === "forfeited"
                    ? "Never opened — scored at the maximum error"
                    : now !== null && c.horizon > 0 && now < c.horizon
                      ? "Sealed. Confidence hidden until the horizon passes"
                      : "Sealed and due — waiting to be opened"}
              </p>
            </div>

            <a
              href={txUrl(c.tx)}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-300 transition-colors hover:text-white"
            >
              {TIERS[c.tier].label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
