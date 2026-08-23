"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  Loader2,
  Lock,
  ShieldAlert,
  Unlock,
} from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { ProbabilityDial } from "@/components/app/ProbabilityDial";
import { WalletBar } from "@/components/app/WalletBar";
import { MyRecord, RecentActivity } from "@/components/app/SidePanels";
import { useXence } from "@/components/app/useXence";
import { useNow } from "@/components/app/useNow";
import { InfoTip } from "@/components/ui/InfoTip";
import {
  describeQuestion,
  signPayout,
  handleFor,
  probabilityLabel,
  saveForecast,
  sealForecast,
  signCommitment,
  TIER_INDEX,
  type Asset,
  type Comparator,
  type Question,
  type StoredForecast,
} from "@/lib/forecast";
import { TIERS, TIER_ORDER, type Tier } from "@/lib/scoring";
import {
  commitActions,
  dryRun,
  explainWalletError,
  revealActions,
  submit,
} from "@/lib/strk20";
import { IS_CONFIGURED, PAYOUT_LIVE, VAULT_V2, txUrl } from "@/lib/config";
import { FEEDS, fetchQuote, formatPrice, strikeStep, type Quote } from "@/lib/pragma";
import { METRICS, fetchMetricValue, formatMetric, metricById } from "@/lib/metrics";
import { fetchPayout, fetchPayoutNonce } from "@/lib/registry";
import { loadIdentity } from "@/lib/forecast";
import { cn } from "@/lib/cn";

type Phase =
  | { kind: "idle" }
  | { kind: "working"; message: string }
  | { kind: "done"; hash: string; commitment: string }
  | { kind: "error"; message: string };

const HORIZONS = [
  { label: "1h", hours: 1 },
  { label: "6h", hours: 6 },
  { label: "1d", hours: 24 },
  { label: "7d", hours: 24 * 7 },
  { label: "30d", hours: 24 * 30 },
];

export default function AppPage() {
  const x = useXence();
  const now = useNow();

  const [asset, setAsset] = useState<Asset>("BTC/USD");
  const [comparator, setComparator] = useState<Comparator>("above");
  // "move" is how people actually talk — "BTC up 5% by Friday", not
  // "BTC above $81,250". Both compile to the same on-chain question, because
  // a move is just a strike derived from the live price at seal time.
  const [mode, setMode] = useState<"move" | "level">("move");
  const [movePct, setMovePct] = useState(5);
  const [level, setLevel] = useState<number>(0);
  // Keyed by pair so a slow response for the previous asset cannot be shown
  // against the new one.
  const [quoted, setQuoted] = useState<{ pair: string; quote: Quote | null } | null>(null);
  const [hours, setHours] = useState(1);
  const [probabilityBp, setProbabilityBp] = useState(6500);
  const [rationale, setRationale] = useState("");
  const [tier, setTier] = useState<Tier>("bronze");
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });

  useEffect(() => {
    let live = true;
    fetchQuote(asset).then((q) => {
      if (!live) return;
      setQuoted({ pair: asset, quote: q });
      if (q) setLevel(Number(q.price.toPrecision(4)));
    });
    return () => {
      live = false;
    };
  }, [asset]);

  const quote = quoted?.pair === asset ? quoted.quote : null;

  // A question is either about a price or about an on-chain metric — pool TVL,
  // protocol balances — settled by reading the number itself at the horizon.
  const [qkind, setQkind] = useState<"price" | "metric">("price");
  const [metricId, setMetricId] = useState(METRICS[0].id);
  const [metricPct, setMetricPct] = useState(10);
  const metric = metricById(metricId) ?? METRICS[0];
  const [metricRead, setMetricRead] = useState<{ id: string; value: number | null } | null>(null);

  useEffect(() => {
    let live = true;
    fetchMetricValue(metric).then((v) => {
      if (live) setMetricRead({ id: metric.id, value: v });
    });
    return () => {
      live = false;
    };
  }, [metric]);

  const metricNow = metricRead?.id === metric.id ? metricRead.value : null;

  // What actually goes on-chain is always an absolute strike.
  const strike = useMemo(() => {
    if (mode === "level") return level;
    if (!quote) return 0;
    return Number((quote.price * (1 + movePct / 100)).toPrecision(6));
  }, [mode, level, quote, movePct]);

  const horizon = useMemo(() => (now ? now + hours * 3600 : 0), [now, hours]);
  // A downward move is a "below" question; there is nothing to store.
  const effectiveComparator: Comparator =
    mode === "move" ? (movePct >= 0 ? "above" : "below") : comparator;

  const question: Question = useMemo(() => {
    if (qkind === "metric") {
      const target =
        metricNow === null ? 0 : Math.round(metricNow * (1 + metricPct / 100));
      return {
        kind: "metric" as const,
        asset: metric.label,
        subject: metric.token,
        holder: metric.holder,
        decimals: metric.decimals,
        comparator: (metricPct >= 0 ? "above" : "below") as Comparator,
        strikeUsd: target,
        horizon,
      };
    }
    return { asset, comparator: effectiveComparator, strikeUsd: strike, horizon };
  }, [qkind, metric, metricNow, metricPct, asset, effectiveComparator, strike, horizon]);

  const canSeal =
    x.wallet.status === "connected" &&
    x.wallet.strk20 &&
    IS_CONFIGURED &&
    phase.kind !== "working";

  async function handleSeal() {
    if (x.wallet.status !== "connected") return;
    try {
      setPhase({ kind: "working", message: "Sealing…" });
      const identity = x.ensureIdentity();
      const sealed = sealForecast(question, probabilityBp, rationale);
      const signature = signCommitment(
        identity,
        sealed.commitmentHash,
        sealed.questionId,
        horizon,
        TIER_INDEX[tier],
      );
      const actions = commitActions({
        sealed,
        question,
        tier,
        reputationKey: identity.reputationKey,
        signature,
      });

      // Dry run skips proof generation, so a bad payload costs a second, not ~30.
      setPhase({ kind: "working", message: "Checking…" });
      const check = await dryRun(x.wallet.account, actions);
      if (!check.ok) {
        setPhase({ kind: "error", message: check.error ?? "Preflight failed" });
        return;
      }

      setPhase({ kind: "working", message: "Proving — about 30 seconds…" });
      const hash = await submit(x.wallet.account, actions);

      saveForecast({
        ...sealed,
        question,
        tier,
        rationale,
        reputationKey: identity.reputationKey,
        committedAt: Math.floor(Date.now() / 1000),
        txHash: hash,
      });
      x.refreshForecasts();
      setPhase({ kind: "done", hash, commitment: sealed.commitmentHash });
    } catch (e) {
      setPhase({ kind: "error", message: explainWalletError(e) });
    }
  }

  async function handleReveal(f: StoredForecast) {
    if (x.wallet.status !== "connected") return;
    try {
      setPhase({ kind: "working", message: "Opening the seal…" });
      const actions = revealActions({ sealed: f, recipient: x.wallet.address });
      const check = await dryRun(x.wallet.account, actions);
      if (!check.ok) {
        setPhase({ kind: "error", message: check.error ?? "Preflight failed" });
        return;
      }
      setPhase({ kind: "working", message: "Settling against the oracle…" });
      const hash = await submit(x.wallet.account, actions);
      saveForecast({
        ...f,
        revealedAt: Math.floor(Date.now() / 1000),
        revealTxHash: hash,
      });
      x.refreshForecasts();
      setPhase({ kind: "done", hash, commitment: f.commitmentHash });
    } catch (e) {
      setPhase({ kind: "error", message: explainWalletError(e) });
    }
  }

  return (
    <>
      <Nav onDark right={<WalletBar x={x} />} />
      <main className="split-ground flex-1 pt-24 pb-20">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 xl:grid-cols-[minmax(0,1fr)_480px_minmax(0,1fr)] xl:items-start">
          <aside className="order-2 space-y-4 xl:order-1">
            <MyRecord reputationKey={x.identity?.reputationKey ?? null} />
          </aside>

          <div className="order-1 lg:order-2">

          {!IS_CONFIGURED ? (
            <div className="mt-3">
              <Row tone="warn">
                <ShieldAlert size={14} className="shrink-0" />
                Vault not deployed. Set NEXT_PUBLIC_VAULT_ADDRESS.
              </Row>
            </div>
          ) : null}

          <div className="seam-card mt-3 overflow-hidden rounded-3xl border border-cream-50/50">
            <Field
              label="Forecast"
              tip="Prices settle on the Pragma median, shown with its publisher count. Metrics settle by reading the balance itself at the horizon — no oracle in the loop at all."
            >
              {VAULT_V2 ? (
                <div className="mb-3 flex gap-1.5">
                  <Chip active={qkind === "price"} onClick={() => setQkind("price")}>
                    price
                  </Chip>
                  <Chip active={qkind === "metric"} onClick={() => setQkind("metric")}>
                    ecosystem
                  </Chip>
                </div>
              ) : null}

              {qkind === "metric" ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={metricId}
                      onChange={setMetricId}
                      options={METRICS.map((m) => ({ value: m.id, label: m.label }))}
                    />
                    <span className="tnum font-mono text-[12px] text-[var(--text-faint)]">
                      {metricNow === null ? "…" : formatMetric(metricNow, metric.unit)}
                    </span>
                    <InfoTip align="left">{metric.story}</InfoTip>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="range"
                      min={-50}
                      max={100}
                      step={1}
                      value={metricPct}
                      onChange={(e) => setMetricPct(Number(e.target.value))}
                      aria-label="Target change"
                      className="w-full accent-teal-700"
                    />
                    <span
                      className={cn(
                        "tnum w-16 shrink-0 text-right font-mono text-[14px]",
                        metricPct >= 0 ? "text-teal-800" : "text-seal-600",
                      )}
                    >
                      {metricPct > 0 ? "+" : ""}
                      {metricPct}%
                    </span>
                  </div>
                  {metricNow !== null ? (
                    <p className="mt-2 text-[12px] text-[var(--text-faint)]">
                      settles {metricPct >= 0 ? "above" : "below"}{" "}
                      {formatMetric(Math.round(metricNow * (1 + metricPct / 100)), metric.unit)}
                    </p>
                  ) : null}
                </>
              ) : (
                <>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={asset}
                  onChange={setAsset}
                  options={FEEDS.map((f) => ({
                    value: f.pair,
                    label: `${f.label} · ${f.pair.split("/")[1]}`,
                  }))}
                />
                <span className="tnum font-mono text-[12px] text-[var(--text-faint)]">
                  {quote ? `$${formatPrice(quote.price)}` : "…"}
                </span>
                {quote ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em]",
                      quote.sources >= 5
                        ? "bg-teal-700/10 text-teal-800"
                        : "bg-seal-500/15 text-seal-700",
                    )}
                  >
                    {quote.sources} sources
                  </span>
                ) : null}
              </div>


                <div className="mt-3 flex gap-1.5">
                  <Chip active={mode === "move"} onClick={() => setMode("move")}>
                    % move
                  </Chip>
                  <Chip active={mode === "level"} onClick={() => setMode("level")}>
                    price level
                  </Chip>
                </div>

                {mode === "move" ? (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="range"
                      min={-30}
                      max={30}
                      step={0.5}
                      value={movePct}
                      onChange={(e) => setMovePct(Number(e.target.value))}
                      aria-label="Percentage move"
                      className="w-full accent-teal-700"
                    />
                    <span
                      className={cn(
                        "tnum w-16 shrink-0 text-right font-mono text-[14px]",
                        movePct >= 0 ? "text-teal-800" : "text-seal-600",
                      )}
                    >
                      {movePct > 0 ? "+" : ""}
                      {movePct}%
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2">
                    <Select
                      value={comparator}
                      onChange={(v) => setComparator(v as Comparator)}
                      options={[
                        { value: "above", label: "above" },
                        { value: "below", label: "below" },
                      ]}
                    />
                    <div className="flex flex-1 items-center gap-1 rounded-xl border border-[var(--edge)] bg-cream-50 px-3 py-2">
                      <span className="text-[var(--text-faint)]">$</span>
                      <input
                        type="number"
                        value={level}
                        min={0}
                        step={quote ? strikeStep(quote.price) : 1}
                        onChange={(e) => setLevel(Number(e.target.value))}
                        className="tnum w-full bg-transparent font-mono text-[14px] text-teal-900 outline-none"
                        aria-label="Strike price"
                      />
                    </div>
                  </div>
                )}
                </>
              )}
            </Field>

            <Field
              label="Resolves in"
              tip="When a Pragma price feed is read on-chain to settle this. Short horizons are ordinary forecasts, not a shortcut."
            >
              <div className="flex gap-1.5">
                {HORIZONS.map((h) => (
                  <Chip
                    key={h.hours}
                    active={hours === h.hours}
                    onClick={() => setHours(h.hours)}
                  >
                    {h.label}
                  </Chip>
                ))}
              </div>
            </Field>

            <Field
              label="Probability"
              tip="A number, not a direction. Say 65% and you should be right about 65 times in 100. The Brier rule scores calibration, so honest uncertainty costs nothing and confident wrongness does."
            >
              <div className="mx-auto max-w-[300px]">
                <ProbabilityDial
                  value={probabilityBp}
                  onChange={setProbabilityBp}
                  disabled={phase.kind === "working"}
                />
              </div>
            </Field>

            <Field
              label="Thesis"
              tip="Hashed, never published. Readable only if you reveal — and it is what subscribers would pay for."
            >
              <input
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Why?"
                className="w-full rounded-xl border border-[var(--edge)] bg-cream-50 px-3 py-2.5 text-[14px] text-teal-900 outline-none transition-colors placeholder:text-[var(--text-faint)] focus:border-[var(--edge-strong)]"
              />
            </Field>

            <Field
              label="Conviction"
              tip="The tier is public; the exact bond and the wallet behind it are not. Tiers are identical for everyone, so nobody buys a louder reputation. A Gold call moves your record eight times as much as Bronze — in both directions."
            >
              <div className="flex gap-1.5">
                {TIER_ORDER.map((t) => (
                  <Chip
                    key={t}
                    active={tier === t}
                    onClick={() => setTier(t)}
                    className="flex-1 justify-center"
                  >
                    {TIERS[t].label}
                    <span className="ml-1.5 tnum opacity-60">{TIERS[t].bond}</span>
                  </Chip>
                ))}
              </div>
            </Field>

            <div className="border-t border-[var(--edge)] bg-cream-50/60 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <p className="font-display text-[17px] leading-snug text-teal-900">
                  {qkind === "metric"
                    ? `${metric.label} ${metricPct >= 0 ? "up" : "down"} ${Math.abs(metricPct)}%`
                    : mode === "move" && quote
                      ? `${asset.split("/")[0]} ${movePct >= 0 ? "up" : "down"} ${Math.abs(movePct)}%`
                      : describeQuestion(question)}{" "}
                  <span className="text-[var(--text-faint)]">
                    {/* Time is unknown until mount; rendering a guess here is what produced a hydration. */}
                    {now === null
                      ? "…"
                      : hours < 48
                        ? `at ${new Date(horizon * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                        : `on ${new Date(horizon * 1000).toLocaleDateString()}`}
                  </span>
                </p>
                <InfoTip label="What this reveals">
                  {mode === "move" && quote ? (
                    <>
                      Settles at{" "}
                      <strong className="text-teal-800">
                        ${formatPrice(strike)}
                      </strong>{" "}
                      — {formatPrice(quote.price)} moved {movePct >= 0 ? "up" : "down"}{" "}
                      {Math.abs(movePct)}%. That absolute level is what goes
                      on-chain; the move is just how it was chosen.
                      <br />
                      <br />
                    </>
                  ) : null}
                  <strong className="text-teal-800">Public:</strong> the pool pays{" "}
                  {TIERS[tier].bond} STRK to the vault, plus the tier, the
                  question, the horizon and the timestamp.
                  <br />
                  <br />
                  <strong className="text-teal-800">Hidden:</strong> your wallet,
                  probability, thesis, direction and balance.
                  <br />
                  <br />
                  Shield well before sealing — doing both in one session narrows
                  the anonymity set to whoever deposited in those minutes.
                </InfoTip>
              </div>

              <button
                onClick={handleSeal}
                disabled={!canSeal}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 py-3.5 font-medium text-cream-100 transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {phase.kind === "working" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Lock size={15} />
                )}
                {phase.kind === "working"
                  ? phase.message
                  : x.wallet.status !== "connected"
                    ? "Connect a wallet"
                    : `Seal for ${TIERS[tier].bond} STRK`}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {phase.kind === "done" || phase.kind === "error" ? (
              <motion.div
                key={phase.kind + ("hash" in phase ? phase.hash : phase.message)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3"
              >
                {phase.kind === "done" ? (
                  <Row tone="ok">
                    <Check size={14} className="shrink-0" />
                    <span className="flex-1">Sealed on mainnet</span>
                    <a
                      href={txUrl(phase.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 underline underline-offset-2"
                    >
                      view <ArrowUpRight size={11} />
                    </a>
                  </Row>
                ) : (
                  <Row tone="warn">{phase.message}</Row>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>

            <Sealed forecasts={x.forecasts} onReveal={handleReveal} now={now} />
            <Identity
              reputationKey={x.identity?.reputationKey ?? null}
              onCreate={() => x.ensureIdentity()}
            />
          </div>

          <aside className="order-3 space-y-4">
            <RecentActivity />
          </aside>
        </div>
      </main>
    </>
  );
}

function Field({
  label,
  tip,
  children,
}: {
  label: string;
  tip?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[var(--edge)] p-4 last:border-b-0">
      <div className="mb-2 flex items-center gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
          {label}
        </span>
        {tip ? <InfoTip align="left">{tip}</InfoTip> : null}
      </div>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-xl px-3 py-2 font-mono text-[12px] transition-colors",
        active
          ? "bg-teal-700 text-cream-100"
          : "border border-[var(--edge)] bg-cream-50 text-[var(--text-dim)] hover:border-[var(--edge-strong)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl border border-[var(--edge)] bg-cream-50 py-2 pl-3 pr-8 font-mono text-[13px] text-teal-900 outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
      />
    </div>
  );
}

function Row({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "ok" | "warn";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl border p-3 text-[13px]",
        tone === "ok"
          ? "border-teal-600/40 bg-teal-600/10 text-teal-800"
          : "border-seal-500/40 bg-seal-500/10 text-seal-700",
      )}
    >
      {children}
    </div>
  );
}

function Sealed({
  forecasts,
  onReveal,
  now,
}: {
  forecasts: StoredForecast[];
  onReveal: (f: StoredForecast) => void;
  now: number | null;
}) {
  if (forecasts.length === 0) return null;
  return (
    <div className="mt-3 overflow-hidden rounded-3xl border border-[var(--edge)] bg-cream-100">
      <div className="flex items-center gap-1.5 border-b border-[var(--edge)] px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
          Sealed ({forecasts.length})
        </span>
        <InfoTip align="left">
          Reveal within 48 hours of the horizon. An unrevealed forecast is scored
          at the maximum possible error and its bond is slashed — silence costs
          more than being wrong.
        </InfoTip>
      </div>
      <ul>
        {forecasts.map((f) => {
          const due = now !== null && now >= f.question.horizon;
          const settled = Boolean(f.revealTxHash);
          return (
            <li
              key={f.commitmentHash}
              className="flex items-center gap-3 border-b border-[var(--edge)] px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] text-teal-900">
                  {describeQuestion(f.question)}
                </p>
                <p className="font-mono text-[11px] text-[var(--text-faint)]">
                  {TIERS[f.tier].label}
                  {settled
                    ? ` · revealed ${probabilityLabel(f.probabilityBp)}`
                    : ""}
                </p>
              </div>
              {settled ? (
                <span className="shrink-0 rounded-full bg-teal-600/15 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-teal-800">
                  settled
                </span>
              ) : due ? (
                <button
                  onClick={() => onReveal(f)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-teal-700 px-3 py-1.5 text-[12px] font-medium text-cream-100 transition-colors hover:bg-teal-600"
                >
                  <Unlock size={11} /> Reveal
                </button>
              ) : (
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-faint)]">
                  {new Date(f.question.horizon * 1000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Identity({
  reputationKey,
  onCreate,
}: {
  reputationKey: string | null;
  onCreate: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [payout, setPayout] = useState<{ key: string; addr: string | null } | null>(null);
  const [editing, setEditing] = useState(false);
  const [payoutInput, setPayoutInput] = useState("");
  const [payoutBusy, setPayoutBusy] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);

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

  const payoutAddr = payout?.key === reputationKey ? payout.addr : null;

  async function announce() {
    const identity = loadIdentity();
    if (!identity || !reputationKey) return;
    if (!/^0x[0-9a-fA-F]{1,64}$/.test(payoutInput.trim())) {
      setPayoutError("Enter a Starknet address.");
      return;
    }
    setPayoutBusy(true);
    setPayoutError(null);
    try {
      const nonce = await fetchPayoutNonce(reputationKey);
      const signature = signPayout(identity, payoutInput.trim(), nonce);
      const res = await fetch("/api/payout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reputationKey, payout: payoutInput.trim(), signature }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Relay failed");
      setPayout({ key: reputationKey, addr: payoutInput.trim() });
      setEditing(false);
    } catch (e) {
      setPayoutError(e instanceof Error ? e.message : "Failed");
    } finally {
      setPayoutBusy(false);
    }
  }
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--edge)] bg-cream-100">
      <div className="flex items-center gap-2 px-4 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
        Identity
      </span>
      <InfoTip align="left">
        Your record attaches to this key, not your wallet. It is created in your
        browser and never leaves it, as is each forecast&apos;s salt. Lose them
        and sealed forecasts can never be opened, which scores them as forfeits.
        Back it up.
      </InfoTip>
      <span className="flex-1" />
      {reputationKey ? (
        <button
          onClick={() => {
            void navigator.clipboard.writeText(reputationKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
          className="inline-flex items-center gap-1.5 font-mono text-[12px] text-teal-800 transition-colors hover:text-teal-600"
        >
          {handleFor(reputationKey)}
          {copied ? <Check size={11} /> : <Copy size={11} />}
        </button>
      ) : (
        <button
          onClick={onCreate}
          className="rounded-xl border border-[var(--edge-strong)] px-3 py-1.5 text-[12px] text-teal-800"
        >
          Create
        </button>
      )}
      </div>

      {reputationKey && PAYOUT_LIVE ? (
        <div className="border-t border-[var(--edge)] px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
              Payout
            </span>
            <InfoTip align="left">
              Where supporters&apos; private STRK20 transfers land. Signed by
              your identity key and relayed by the server, so the wallet paying
              gas never links to your record. Use a fresh pool-registered
              address, not your main wallet.
            </InfoTip>
            <span className="flex-1" />
            {payoutAddr && !editing ? (
              <button
                onClick={() => {
                  setEditing(true);
                  setPayoutInput(payoutAddr);
                }}
                className="font-mono text-[11.5px] text-teal-800 underline underline-offset-2"
              >
                {payoutAddr.slice(0, 8)}…{payoutAddr.slice(-4)}
              </button>
            ) : null}
          </div>

          {!payoutAddr || editing ? (
            <div className="mt-2 flex gap-2">
              <input
                value={payoutInput}
                onChange={(e) => setPayoutInput(e.target.value)}
                placeholder="0x… address that receives backing"
                className="w-full rounded-xl border border-[var(--edge)] bg-cream-50 px-3 py-2 font-mono text-[12px] text-teal-900 outline-none"
              />
              <button
                onClick={announce}
                disabled={payoutBusy}
                className="shrink-0 rounded-xl bg-teal-700 px-3 py-2 text-[12px] font-medium text-cream-100 disabled:opacity-40"
              >
                {payoutBusy ? "…" : "Announce"}
              </button>
            </div>
          ) : null}
          {payoutError ? (
            <p className="mt-2 break-words text-[11.5px] text-seal-700">{payoutError}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
