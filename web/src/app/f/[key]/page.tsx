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
  Loader2,
} from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/landing/Proof";
import { XenceMark } from "@/components/brand/XenceMark";
import { CalibrationPlot } from "@/components/art/CalibrationPlot";
import { Reveal } from "@/components/ui/Reveal";
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
            <div className="flex items-center gap-4">
              <ShareLink />
              <XenceMark size={44} accent="var(--color-teal-700)" alive />
            </div>
          </header>

          <BackPanel reputationKey={reputationKey} />

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

          <ClaimHistory reputationKey={reputationKey} />
        </div>
      </main>
      <Footer />
    </>
  );
}

/**
 * The economic loop: pay a forecaster whose record earned it, through the
 * pool, so nobody — the forecaster included — learns who backed them.
 */
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
    <div className="mt-8 rounded-2xl border border-[var(--edge)] bg-cream-100 p-5">
      <div className="flex items-center gap-1.5">
        <HandCoins size={15} className="text-seal-600" />
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
          Back this forecaster
        </span>
        <InfoTip align="left">
          A private STRK20 transfer to the payout address this key signed for.
          Nobody — including them — learns who sent it. The record earns the
          money; the money never touches the record.
        </InfoTip>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {[5, 25, 100].map((v) => (
          <button
            key={v}
            onClick={() => setAmount(v)}
            className={cn(
              "rounded-xl px-3 py-2 font-mono text-[12px] transition-colors",
              amount === v
                ? "bg-teal-700 text-cream-100"
                : "border border-[var(--edge)] bg-cream-50 text-[var(--text-dim)]",
            )}
          >
            {v} STRK
          </button>
        ))}
        <button
          onClick={back}
          disabled={!connected || busy}
          className="inline-flex items-center gap-1.5 rounded-xl bg-seal-600 px-4 py-2 text-[13px] font-medium text-cream-100 transition-colors hover:bg-seal-500 disabled:opacity-40"
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <HandCoins size={13} />}
          Back privately
        </button>
        {!connected ? (
          <span className="text-[12px] text-[var(--text-faint)]">
            connect a privacy wallet on the app page first
          </span>
        ) : null}
      </div>

      {done ? (
        <a
          href={txUrl(done)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 font-mono text-[11.5px] text-teal-700 underline underline-offset-2"
        >
          sent privately — {done.slice(0, 16)}… <ArrowUpRight size={11} />
        </a>
      ) : null}
      {error ? (
        <p className="mt-3 break-words text-[12px] text-seal-700">{error}</p>
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

/** The page is the artefact people share, so make the link one click. */
function ShareLink() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        void navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--edge-strong)] px-4 py-2 text-[12.5px] text-teal-900 transition-colors hover:bg-cream-300/60"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

/** Every claim this key has made on the current vault, newest first. */
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
    <Reveal>
      <section className="mt-12">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-2xl text-teal-950">The claims</h2>
          <InfoTip align="left">
            Read from vault events, not a database. Sealed rows show the
            question only — the probability stays dark until the forecaster
            opens the seal.
          </InfoTip>
        </div>

        <ul className="mt-5 overflow-hidden rounded-2xl border border-[var(--edge)] bg-cream-100">
          {rows.map((c) => (
            <li
              key={c.commitmentHash}
              className="flex items-start gap-3 border-b border-[var(--edge)] px-5 py-4 last:border-b-0"
            >
              {c.state === "settled" ? (
                <Check size={13} className="mt-1 shrink-0 text-teal-700" />
              ) : c.state === "forfeited" ? (
                <Ban size={13} className="mt-1 shrink-0 text-seal-500" />
              ) : (
                <Clock size={13} className="mt-1 shrink-0 text-[var(--text-faint)]" />
              )}

              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] text-teal-900">{c.question}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-dim)]">
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
                className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--text-faint)] transition-colors hover:text-teal-700"
              >
                {TIERS[c.tier].label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  );
}
