"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  KeyRound,
  Loader2,
  Lock,
  ShieldAlert,
  Unlock,
} from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { XenceMark } from "@/components/brand/XenceMark";
import { ProbabilityDial } from "@/components/app/ProbabilityDial";
import { Card, Preflight, TierPicker, WalletPanel } from "@/components/app/Panels";
import { useXence } from "@/components/app/useXence";
import { useNow } from "@/components/app/useNow";
import {
  ASSETS,
  describeQuestion,
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
import { TIERS, type Tier } from "@/lib/scoring";
import { commitActions, dryRun, revealActions, submit } from "@/lib/strk20";
import { IS_CONFIGURED, txUrl, VAULT_ADDRESS } from "@/lib/config";
import { cn } from "@/lib/cn";

type Phase =
  | { kind: "idle" }
  | { kind: "working"; message: string }
  | { kind: "done"; hash: string; commitment: string }
  | { kind: "error"; message: string };

const DEFAULT_STRIKE: Record<Asset, number> = {
  "BTC/USD": 120000,
  "ETH/USD": 4500,
  "STRK/USD": 0.25,
};

const HORIZONS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

export default function AppPage() {
  const x = useXence();

  const [asset, setAsset] = useState<Asset>("BTC/USD");
  const [comparator, setComparator] = useState<Comparator>("above");
  const [strike, setStrike] = useState<number>(DEFAULT_STRIKE["BTC/USD"]);
  const [days, setDays] = useState(30);
  const [probabilityBp, setProbabilityBp] = useState(6500);
  const [rationale, setRationale] = useState("");
  const [tier, setTier] = useState<Tier>("bronze");
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });

  const now = useNow();
  const horizon = useMemo(() => (now ? now + days * 86400 : 0), [now, days]);

  const question: Question = useMemo(
    () => ({ asset, comparator, strikeUsd: strike, horizon }),
    [asset, comparator, strike, horizon],
  );

  const connected = x.wallet.status === "connected";
  const canSeal =
    x.wallet.status === "connected" &&
    x.wallet.strk20 &&
    IS_CONFIGURED &&
    phase.kind !== "working";

  async function handleSeal() {
    if (x.wallet.status !== "connected") return;

    try {
      setPhase({ kind: "working", message: "Sealing the forecast…" });
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

      // Dry run first. It skips proof generation, so a calldata-shape mistake
      // costs a second here instead of a ~29s proof and a failed transaction.
      setPhase({ kind: "working", message: "Checking the transaction…" });
      const check = await dryRun(x.wallet.account, actions);
      if (!check.ok) {
        setPhase({ kind: "error", message: check.error ?? "Preflight failed" });
        return;
      }

      setPhase({
        kind: "working",
        message: "Generating the proof — this takes ~30 seconds…",
      });
      const hash = await submit(x.wallet.account, actions);

      const stored: StoredForecast = {
        ...sealed,
        question,
        tier,
        rationale,
        reputationKey: identity.reputationKey,
        committedAt: Math.floor(Date.now() / 1000),
        txHash: hash,
      };
      saveForecast(stored);
      x.refreshForecasts();
      setPhase({ kind: "done", hash, commitment: sealed.commitmentHash });
    } catch (e) {
      setPhase({
        kind: "error",
        message: e instanceof Error ? e.message : "Something went wrong",
      });
    }
  }

  async function handleReveal(f: StoredForecast) {
    if (x.wallet.status !== "connected") return;
    try {
      setPhase({ kind: "working", message: "Opening the seal…" });
      const actions = revealActions({
        sealed: f,
        recipient: x.wallet.address,
      });
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
      setPhase({
        kind: "error",
        message: e instanceof Error ? e.message : "Reveal failed",
      });
    }
  }

  return (
    <>
      <Nav />
      <main className="flex-1 pt-28 pb-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <header className="mb-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-seal-600">
              Seal a forecast
            </p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] text-teal-950">
              Put a number on it,{" "}
              <span className="italic text-teal-700">before anyone knows.</span>
            </h1>
          </header>

          {!IS_CONFIGURED ? (
            <div className="mb-8 flex gap-3 rounded-2xl border border-seal-500/40 bg-seal-500/10 p-5">
              <ShieldAlert size={17} className="mt-0.5 shrink-0 text-seal-500" />
              <div>
                <p className="font-medium text-teal-900">
                  Vault not deployed yet
                </p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--text-dim)]">
                  Set <code className="font-mono text-teal-700">NEXT_PUBLIC_VAULT_ADDRESS</code>{" "}
                  once the contracts are on mainnet. Everything below works and
                  will build a real transaction; it just has nowhere to send it.
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
            {/* ---------------- the forecast ---------------- */}
            <div className="space-y-6">
              <Card label="The question">
                <div className="flex flex-wrap gap-2">
                  {ASSETS.map((a) => (
                    <button
                      key={a}
                      onClick={() => {
                        setAsset(a);
                        setStrike(DEFAULT_STRIKE[a]);
                      }}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 font-mono text-[12px] transition-colors",
                        asset === a
                          ? "border-teal-600 bg-teal-700/10 text-teal-900"
                          : "border-[var(--edge)] text-[var(--text-dim)] hover:border-[var(--edge-strong)]",
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-[auto_1fr]">
                  <div className="flex gap-2">
                    {(["above", "below"] as Comparator[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => setComparator(c)}
                        className={cn(
                          "rounded-lg border px-4 py-2.5 text-[13px] capitalize transition-colors",
                          comparator === c
                            ? "border-teal-600 bg-teal-700/10 text-teal-900"
                            : "border-[var(--edge)] text-[var(--text-dim)] hover:border-[var(--edge-strong)]",
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <label className="block">
                    <span className="sr-only">Strike price in USD</span>
                    <div className="flex items-center gap-2 rounded-lg border border-[var(--edge)] bg-cream-50 px-3.5 py-2.5">
                      <span className="text-[var(--text-faint)]">$</span>
                      <input
                        type="number"
                        value={strike}
                        min={0}
                        step={asset === "STRK/USD" ? 0.01 : 100}
                        onChange={(e) => setStrike(Number(e.target.value))}
                        className="tnum w-full bg-transparent font-mono text-[14px] text-teal-900 outline-none"
                      />
                    </div>
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    Resolves in
                  </span>
                  {HORIZONS.map((h) => (
                    <button
                      key={h.days}
                      onClick={() => setDays(h.days)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-[12px] transition-colors",
                        days === h.days
                          ? "border-teal-600 bg-teal-700/10 text-teal-900"
                          : "border-[var(--edge)] text-[var(--text-dim)] hover:border-[var(--edge-strong)]",
                      )}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>

                <p className="mt-5 rounded-xl border border-[var(--edge)] bg-cream-300/50 p-4 font-display text-xl text-teal-900">
                  {describeQuestion(question)}
                  <span className="ml-2 font-sans text-[13px] text-[var(--text-faint)]">
                    on {new Date(horizon * 1000).toLocaleDateString()}
                  </span>
                </p>
              </Card>

              <Card label="Your probability">
                <div className="mx-auto max-w-sm">
                  <ProbabilityDial
                    value={probabilityBp}
                    onChange={setProbabilityBp}
                    disabled={phase.kind === "working"}
                  />
                </div>
                <p className="mt-4 text-center text-[13px] leading-relaxed text-[var(--text-faint)]">
                  Not a direction — a number. Saying{" "}
                  <span className="text-teal-700">
                    {probabilityLabel(probabilityBp)}
                  </span>{" "}
                  means you expect to be right about that often when you say it.
                  Being honestly uncertain costs you nothing here; being
                  confidently wrong does.
                </p>
              </Card>

              <Card label="Your thesis">
                <textarea
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  rows={4}
                  placeholder="Why? This is hashed, never published. It only becomes readable if you reveal it — and it is what subscribers pay for."
                  className="w-full resize-y rounded-xl border border-[var(--edge)] bg-cream-50 p-3.5 text-[14px] leading-relaxed text-teal-900 outline-none transition-colors placeholder:text-[var(--text-faint)] focus:border-[var(--edge-strong)]"
                />
              </Card>

              <Card label="Conviction">
                <TierPicker value={tier} onChange={setTier} />
                <p className="mt-3 text-[12.5px] leading-relaxed text-[var(--text-faint)]">
                  The tier is public. The exact bond and the wallet behind it are
                  not. Tiers are the same for everyone, so nobody can buy a
                  louder reputation than anyone else.
                </p>
              </Card>

              <Card label="Before you sign">
                <Preflight tier={tier} horizon={horizon} />
              </Card>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleSeal}
                  disabled={!canSeal}
                  className="group inline-flex items-center gap-2 rounded-full bg-teal-700 px-6 py-3.5 font-medium text-cream-100 transition-all hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {phase.kind === "working" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Lock size={16} />
                  )}
                  Seal for {TIERS[tier].bond} STRK
                </button>
                {!connected ? (
                  <span className="text-[13px] text-[var(--text-faint)]">
                    Connect a wallet to seal.
                  </span>
                ) : null}
              </div>

              <AnimatePresence mode="wait">
                {phase.kind !== "idle" ? (
                  <motion.div
                    key={phase.kind + ("message" in phase ? phase.message : "")}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <StatusBlock phase={phase} />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* ---------------- side rail ---------------- */}
            <div className="space-y-6 lg:sticky lg:top-24">
              <WalletPanel
                wallets={x.wallets}
                wallet={x.wallet}
                onConnect={x.connectTo}
                onDisconnect={x.disconnect}
                balance={x.balance}
                onRevealBalance={x.revealBalance}
              />

              <IdentityPanel
                reputationKey={x.identity?.reputationKey ?? null}
                onCreate={() => x.ensureIdentity()}
              />

              <SealedList forecasts={x.forecasts} onReveal={handleReveal} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function StatusBlock({ phase }: { phase: Phase }) {
  if (phase.kind === "working") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-[var(--edge-strong)] bg-cream-50 p-4">
        <Loader2 size={15} className="animate-spin text-seal-600" />
        <p className="text-[13.5px] text-teal-900">{phase.message}</p>
      </div>
    );
  }
  if (phase.kind === "error") {
    return (
      <div className="rounded-xl border border-seal-500/40 bg-seal-500/10 p-4">
        <p className="text-[13.5px] font-medium text-seal-600">
          That didn&apos;t go through
        </p>
        <p className="mt-1 break-words font-mono text-[12px] leading-relaxed text-[var(--text-dim)]">
          {phase.message}
        </p>
      </div>
    );
  }
  if (phase.kind === "idle") return null;
  return (
    <div className="rounded-xl border border-teal-600/30 bg-teal-600/10 p-4">
      <p className="flex items-center gap-2 text-[13.5px] font-medium text-teal-800">
        <Check size={14} /> Sealed on mainnet
      </p>
      <p className="mt-2 break-all font-mono text-[11.5px] text-[var(--text-dim)]">
        {phase.commitment}
      </p>
      <a
        href={txUrl(phase.hash)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-teal-700 underline underline-offset-2"
      >
        View transaction <ArrowUpRight size={12} />
      </a>
    </div>
  );
}

function IdentityPanel({
  reputationKey,
  onCreate,
}: {
  reputationKey: string | null;
  onCreate: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!reputationKey) {
    return (
      <Card label="Forecaster identity">
        <p className="text-[13px] leading-relaxed text-[var(--text-faint)]">
          Your track record attaches to a key, not a wallet. It is created in
          your browser and never leaves it.
        </p>
        <button
          onClick={onCreate}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--edge-strong)] px-4 py-2 text-[13px] text-teal-900 transition-colors hover:bg-cream-300/60"
        >
          <KeyRound size={13} /> Create identity
        </button>
      </Card>
    );
  }

  return (
    <Card label="Forecaster identity">
      <p className="font-display text-2xl text-teal-900">
        {handleFor(reputationKey)}
      </p>
      <button
        onClick={() => {
          void navigator.clipboard.writeText(reputationKey);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
        className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-faint)] transition-colors hover:text-teal-700"
      >
        {copied ? <Check size={11} /> : <Copy size={11} />}
        {reputationKey.slice(0, 10)}…{reputationKey.slice(-6)}
      </button>
      <div className="mt-4 flex gap-2.5 rounded-xl border border-seal-500/40 bg-seal-500/10 p-3">
        <Download size={13} className="mt-0.5 shrink-0 text-seal-500" />
        <p className="text-[12px] leading-relaxed text-[var(--text-dim)]">
          Back this up. The key and each forecast&apos;s salt live only in this
          browser — lose them and your sealed forecasts can never be opened,
          which scores them as forfeits.
        </p>
      </div>
    </Card>
  );
}

function SealedList({
  forecasts,
  onReveal,
}: {
  forecasts: StoredForecast[];
  onReveal: (f: StoredForecast) => void;
}) {
  // Null until mounted. Until we know the time, a forecast reads as "sealed"
  // rather than guessing at a deadline the server would render differently.
  const now = useNow();

  if (forecasts.length === 0) {
    return (
      <Card label="Your sealed forecasts">
        <div className="flex flex-col items-center py-6 text-center">
          <XenceMark size={34} accent="var(--color-teal-500)" />
          <p className="mt-4 text-[13px] leading-relaxed text-[var(--text-faint)]">
            Nothing sealed yet. The first one takes about a minute.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card label={`Your sealed forecasts (${forecasts.length})`}>
      <ul className="space-y-3">
        {forecasts.map((f) => {
          const due = now !== null && now >= f.question.horizon;
          const revealed = Boolean(f.revealTxHash);
          return (
            <li
              key={f.commitmentHash}
              className="rounded-xl border border-[var(--edge)] bg-cream-50 p-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] text-teal-900">
                    {describeQuestion(f.question)}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-[var(--text-faint)]">
                    {TIERS[f.tier].label} ·{" "}
                    {new Date(f.question.horizon * 1000).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em]",
                    revealed
                      ? "bg-teal-600/15 text-teal-800"
                      : due
                        ? "bg-teal-700/15 text-teal-700"
                        : "bg-cream-300 text-[var(--text-faint)]",
                  )}
                >
                  {revealed ? "settled" : due ? "ready" : "sealed"}
                </span>
              </div>

              {revealed ? (
                <p className="mt-2 font-mono text-[11.5px] text-[var(--text-dim)]">
                  revealed at {probabilityLabel(f.probabilityBp)}
                </p>
              ) : due ? (
                <button
                  onClick={() => onReveal(f)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-teal-600/50 px-3 py-1.5 text-[12px] text-teal-900 transition-colors hover:bg-teal-700/10"
                >
                  <Unlock size={11} /> Reveal & settle
                </button>
              ) : (
                <p className="mt-2 text-[11.5px] text-[var(--text-faint)]">
                  Opens{" "}
                  {new Date(f.question.horizon * 1000).toLocaleDateString()} —
                  reveal within 48 hours of that or it forfeits.
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[11px] leading-relaxed text-[var(--text-faint)]">
        Vault:{" "}
        <Link
          href={`https://voyager.online/contract/${VAULT_ADDRESS}`}
          className="font-mono underline underline-offset-2"
        >
          {VAULT_ADDRESS ? `${VAULT_ADDRESS.slice(0, 10)}…` : "not deployed"}
        </Link>
      </p>
    </Card>
  );
}
