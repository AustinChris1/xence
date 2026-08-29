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
      <main className="flex-1 pt-32 pb-24 bg-[#f8fafc]">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 transition-colors hover:text-teal-700 font-medium"
          >
            <ArrowLeft size={13} /> All forecasters
          </Link>

          <header className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="font-mono text-[11.5px] font-bold uppercase tracking-[0.22em] text-teal-700">
                Forecaster Profile
              </span>
              <h1 className="mt-2 text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold leading-tight text-slate-950">
                {reputationKey ? handleFor(reputationKey) : "—"}
              </h1>
              <p className="mt-2 break-all font-mono text-[11.5px] text-slate-500">
                {reputationKey}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ShareLink />
              <XenceMark size={44} accent="#bd7407" alive />
            </div>
          </header>

          <BackPanel reputationKey={reputationKey} />

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-24 text-slate-500">
              <Loader2 size={18} className="animate-spin text-teal-600" />
              <span className="text-[14px] font-medium">Reading the registry…</span>
            </div>
          ) : !record || tested === 0 ? (
            <div className="mt-12 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-slate-950">
                Nothing settled yet
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-slate-600">
                {record && record.open > 0
                  ? `${record.open} forecast${record.open === 1 ? "" : "s"} sealed and still running. A record only means something once calls have been opened and scored.`
                  : "This key has no history on-chain."}
              </p>
            </div>
          ) : (
            <>
              <dl className="mt-10 grid gap-3 sm:grid-cols-4">
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
                <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-950 shadow-sm sm:p-8">
                  <CalibrationPlot bins={bins} size={440} className="w-full" />
                  <p className="mt-4 text-center text-[12px] text-slate-500 font-medium">
                    Claimed against observed. On the diagonal is honest;
                    below it is overconfident.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                    <h2 className="text-xl font-bold text-slate-950">
                      Reading this record
                    </h2>
                    <p className="mt-2.5 text-[14.5px] leading-relaxed text-slate-600">
                      {record.skill > 0.15
                        ? "Consistently better than guessing, across enough resolved calls to be more than luck."
                        : record.skill > 0
                          ? "Slightly better than a coin flip. Real, but not yet a large edge."
                          : "Not currently beating a coin flip. Worth knowing before paying for the next call."}
                    </p>
                  </div>

                  {record.forfeited > 0 ? (
                    <div className="flex gap-3.5 rounded-3xl border border-rose-200 bg-rose-50/70 p-6 shadow-xs">
                      <Ban size={18} className="mt-0.5 shrink-0 text-rose-600" />
                      <div>
                        <p className="text-[14.5px] font-bold text-rose-800">
                          {record.forfeited} forecast
                          {record.forfeited === 1 ? "" : "s"} never opened
                        </p>
                        <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">
                          Sealed, then left to expire. Each is scored at the
                          maximum possible error (1.00) and is already priced into
                          the number above.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-teal-200 bg-teal-50/70 p-6 shadow-xs">
                      <p className="text-[14.5px] font-bold text-teal-900">
                        Every call opened
                      </p>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">
                        No forfeits. Nothing sealed here was quietly allowed to
                        expire, which is the part a screenshot can never show.
                      </p>
                    </div>
                  )}

                  {record.open > 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                      <p className="text-[14px] font-bold text-slate-950">
                        {record.open} still sealed
                      </p>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500">
                        Running now, unreadable until their horizons pass.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          )}

          <ClaimHistory reputationKey={reputationKey} />

          <p className="mt-10 flex items-start gap-2.5 text-[12.5px] leading-relaxed text-slate-500">
            <KeyRound size={14} className="mt-0.5 shrink-0 text-teal-700" />
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
    <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <HandCoins size={16} className="text-teal-700" />
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700">
          Back this forecaster
        </span>
        <InfoTip align="left">
          A private STRK20 transfer to the payout address this key signed for.
          Not even they learn who sent it.
        </InfoTip>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {[5, 25, 100].map((v) => (
          <button
            key={v}
            onClick={() => setAmount(v)}
            className={cn(
              "btn-spring rounded-xl px-4 py-2 font-mono text-[12.5px] font-bold transition-all",
              amount === v
                ? "bg-teal-700 text-white shadow-xs"
                : "border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100",
            )}
          >
            {v} STRK
          </button>
        ))}
        <button
          onClick={back}
          disabled={!connected || busy}
          className="btn-spring btn-primary inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-[13.5px] font-bold shadow-xs disabled:opacity-40"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <HandCoins size={14} />}
          Back privately
        </button>
        {!connected ? (
          <span className="text-[12.5px] text-slate-500">
            connect a privacy wallet on the app page first
          </span>
        ) : null}
      </div>

      {done ? (
        <a
          href={txUrl(done)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 font-mono text-[12px] text-teal-700 underline underline-offset-2 font-bold"
        >
          sent privately · {done.slice(0, 16)}… <ArrowUpRight size={12} />
        </a>
      ) : null}
      {error ? (
        <p className="mt-3 break-words text-[12.5px] text-rose-600">{error}</p>
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
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <dt className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-slate-500">
        {k}
      </dt>
      <dd
        className={cn(
          "tnum mt-1.5 font-display text-3xl font-extrabold font-mono",
          tone === "good"
            ? "text-teal-800"
            : tone === "bad"
              ? "text-rose-700"
              : "text-slate-900",
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
      className="btn-spring btn-secondary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-bold shadow-xs"
    >
      {copied ? <Check size={13} className="text-teal-700" /> : <Copy size={13} />}
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
        <h2 className="text-2xl font-extrabold text-slate-950">The claims</h2>
        <InfoTip align="left">
          Read from vault events, not a database. Sealed rows show the
          question only. The probability stays dark until the forecaster
          opens the seal.
        </InfoTip>
      </div>

      <ul className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {rows.map((c) => (
          <li
            key={c.commitmentHash}
            className="flex items-start gap-3.5 border-b border-slate-100 px-6 py-4.5 last:border-b-0"
          >
            {c.state === "settled" ? (
              <Check size={15} className="mt-1 shrink-0 text-teal-600" />
            ) : c.state === "forfeited" ? (
              <Ban size={15} className="mt-1 shrink-0 text-rose-600" />
            ) : (
              <Clock size={15} className="mt-1 shrink-0 text-slate-400" />
            )}

            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-slate-900">{c.question}</p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-slate-600">
                {c.state === "settled" && c.probabilityBp !== undefined
                  ? `Said ${(c.probabilityBp / 100).toFixed(0)}%, it ${c.outcome ? "happened" : "did not"}${
                      c.brierBp !== undefined
                        ? `. Brier ${(c.brierBp / 10_000).toFixed(2)}`
                        : ""
                    }`
                  : c.state === "forfeited"
                    ? "Never opened, scored at the maximum error"
                    : now !== null && c.horizon > 0 && now < c.horizon
                      ? "Sealed. Confidence hidden until the horizon passes"
                      : "Sealed and due, waiting to be opened"}
              </p>
            </div>

            <a
              href={txUrl(c.tx)}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700 hover:underline"
            >
              {TIERS[c.tier].label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
