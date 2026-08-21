"use client";

import { AlertTriangle, Check, Eye, Loader2, Wallet, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatStrk } from "@/lib/strk20";
import type { DiscoveredWallet } from "@/lib/strk20";
import type { WalletState } from "./useXence";
import { TIERS, TIER_ORDER, type Tier } from "@/lib/scoring";

export function Card({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--edge)] bg-ink-900/70 p-5 sm:p-6",
        className,
      )}
    >
      {label ? (
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-cream-300">
          {label}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

export function WalletPanel({
  wallets,
  wallet,
  onConnect,
  onDisconnect,
  balance,
  onRevealBalance,
}: {
  wallets: readonly DiscoveredWallet[];
  wallet: WalletState;
  onConnect: (w: DiscoveredWallet) => void;
  onDisconnect: () => void;
  balance: bigint | null;
  onRevealBalance: () => void;
}) {
  if (wallet.status === "connected") {
    return (
      <Card label="Wallet">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate font-mono text-[13px] text-cream-100">
              {wallet.address.slice(0, 8)}…{wallet.address.slice(-6)}
            </p>
            <p className="mt-1 text-[12px] text-[var(--text-faint)]">
              {wallet.walletName}
            </p>
          </div>
          <button
            onClick={onDisconnect}
            className="rounded-full border border-[var(--edge-strong)] p-1.5 text-[var(--text-faint)] transition-colors hover:text-cream-100"
            aria-label="Disconnect"
          >
            <X size={13} />
          </button>
        </div>

        {wallet.strk20 ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--edge)] bg-ink-850/60 p-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
                Shielded balance
              </p>
              <p className="tnum mt-0.5 font-display text-xl text-cream-100">
                {balance === null ? "— — —" : `${formatStrk(balance)} STRK`}
              </p>
            </div>
            {balance === null ? (
              <button
                onClick={onRevealBalance}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--edge-strong)] px-3 py-1.5 text-[12px] text-cream-200 transition-colors hover:bg-ink-800"
              >
                <Eye size={12} /> Reveal
              </button>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 flex gap-2.5 rounded-xl border border-seal-500/30 bg-seal-500/[0.07] p-3">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-seal-400" />
            <p className="text-[12.5px] leading-relaxed text-[var(--text-dim)]">
              This wallet doesn&apos;t support the STRK20 wallet API (0.10.3+).
              You can browse, but sealing needs a privacy-enabled wallet — Ready
              supports it today.
            </p>
          </div>
        )}
        <p className="mt-3 text-[11.5px] leading-relaxed text-[var(--text-faint)]">
          Reading your shielded balance asks the wallet for consent, so Xence
          only does it when you press the button — never on load.
        </p>
      </Card>
    );
  }

  return (
    <Card label="Wallet">
      {wallet.status === "error" ? (
        <p className="mb-3 text-[12.5px] text-seal-300">{wallet.message}</p>
      ) : null}
      {wallets.length === 0 ? (
        <p className="text-[13px] leading-relaxed text-[var(--text-faint)]">
          No Starknet wallet detected. Install{" "}
          <a
            href="https://www.ready.co"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cream-200 underline underline-offset-2"
          >
            Ready
          </a>{" "}
          — it supports the STRK20 privacy actions Xence needs.
        </p>
      ) : (
        <div className="space-y-2">
          {wallets.map((w) => (
            <button
              key={w.name}
              onClick={() => onConnect(w)}
              disabled={wallet.status === "connecting"}
              className="flex w-full items-center gap-3 rounded-xl border border-[var(--edge)] bg-ink-850/60 p-3 text-left transition-colors hover:border-[var(--edge-strong)] hover:bg-ink-800 disabled:opacity-50"
            >
              {w.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={w.icon} alt="" className="h-6 w-6 rounded" />
              ) : (
                <Wallet size={16} className="text-cream-300" />
              )}
              <span className="flex-1 text-[13.5px] text-cream-100">{w.name}</span>
              {wallet.status === "connecting" ? (
                <Loader2 size={14} className="animate-spin text-[var(--text-faint)]" />
              ) : null}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

export function TierPicker({
  value,
  onChange,
}: {
  value: Tier;
  onChange: (t: Tier) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {TIER_ORDER.map((t) => {
        const tier = TIERS[t];
        const active = value === t;
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={cn(
              "rounded-xl border p-3.5 text-left transition-all",
              active
                ? "border-cream-300 bg-cream-200/10"
                : "border-[var(--edge)] bg-ink-850/50 hover:border-[var(--edge-strong)]",
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "font-display text-lg",
                  active ? "text-cream-100" : "text-[var(--text-dim)]",
                )}
              >
                {tier.label}
              </span>
              {active ? <Check size={13} className="text-cream-200" /> : null}
            </div>
            <p className="tnum mt-0.5 font-mono text-[12px] text-teal-300">
              {tier.bond} STRK
            </p>
            <p className="mt-1.5 text-[11.5px] leading-snug text-[var(--text-faint)]">
              {tier.blurb}
            </p>
          </button>
        );
      })}
    </div>
  );
}

/**
 * The leakage preflight.
 *
 * Most privacy mistakes are made by people who believed they were already
 * private. Saying plainly what an action exposes is worth more than any amount
 * of reassuring copy, and it is the difference between a privacy product and a
 * product with privacy in the name.
 */
export function Preflight({
  tier,
  horizon,
}: {
  tier: Tier;
  horizon: number;
}) {
  const reveals = [
    `The pool pays ${TIERS[tier].bond} STRK to the Xence vault — the amount and the tier are public`,
    "That a forecast was sealed, and the timestamp it was sealed at",
    `The question and its resolution date (${new Date(horizon * 1000).toLocaleDateString()})`,
  ];
  const hides = [
    "Your wallet address, and that it was you",
    "Your probability, your thesis, and which way you lean",
    "Your shielded balance and every other position you hold",
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-cream-400/25 bg-cream-200/[0.04] p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream-200">
          This will reveal
        </p>
        <ul className="mt-3 space-y-2">
          {reveals.map((r) => (
            <li key={r} className="flex gap-2 text-[12.5px] leading-snug">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cream-300" />
              <span className="text-[var(--text-dim)]">{r}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-[var(--edge)] bg-ink-850/60 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal-300">
          This stays hidden
        </p>
        <ul className="mt-3 space-y-2">
          {hides.map((h) => (
            <li key={h} className="flex gap-2 text-[12.5px] leading-snug">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-400" />
              <span className="text-[var(--text-dim)]">{h}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="sm:col-span-2 text-[11.5px] leading-relaxed text-[var(--text-faint)]">
        One caveat Xence will not paper over: if you shield STRK and seal a
        forecast minutes later, the anonymity set is whoever deposited in those
        minutes. Shield well in advance and the link stops being useful to
        anyone watching.
      </p>
    </div>
  );
}
