"use client";

import { AlertTriangle, Check, Eye, Info, Loader2, Wallet, X } from "lucide-react";
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
        "rounded-2xl border border-[var(--edge)] bg-cream-100 p-5 sm:p-6",
        className,
      )}
    >
      {label ? (
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-teal-600">
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
  capabilities,
}: {
  wallets: readonly DiscoveredWallet[];
  wallet: WalletState;
  onConnect: (w: DiscoveredWallet) => void;
  onDisconnect: () => void;
  balance: bigint | null;
  onRevealBalance: () => void;
  capabilities: Record<string, boolean | undefined>;
}) {
  if (wallet.status === "connected") {
    return (
      <Card label="Wallet">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate font-mono text-[13px] text-teal-900">
              {wallet.address.slice(0, 8)}…{wallet.address.slice(-6)}
            </p>
            <p className="mt-1 text-[12px] text-[var(--text-faint)]">
              {wallet.walletName}
            </p>
          </div>
          <button
            onClick={onDisconnect}
            className="rounded-full border border-[var(--edge-strong)] p-1.5 text-[var(--text-faint)] transition-colors hover:text-teal-900"
            aria-label="Disconnect"
          >
            <X size={13} />
          </button>
        </div>

        {wallet.strk20 ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--edge)] bg-cream-50 p-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
                Shielded balance
              </p>
              <p className="tnum mt-0.5 font-display text-xl text-teal-900">
                {balance === null ? "— — —" : `${formatStrk(balance)} STRK`}
              </p>
            </div>
            {balance === null ? (
              <button
                onClick={onRevealBalance}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--edge-strong)] px-3 py-1.5 text-[12px] text-teal-700 transition-colors hover:bg-cream-300/60"
              >
                <Eye size={12} /> Reveal
              </button>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 flex gap-2.5 rounded-xl border border-seal-500/40 bg-seal-500/10 p-3">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-seal-500" />
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
        <p className="mb-3 rounded-lg border border-seal-500/40 bg-seal-500/10 p-2.5 text-[12.5px] text-seal-700">
          {wallet.message}
        </p>
      ) : null}

      {wallets.length === 0 ? (
        <p className="text-[13px] leading-relaxed text-[var(--text-faint)]">
          No wallet detected.
        </p>
      ) : (
        <div className="space-y-2">
          {wallets.map((w) => {
            // undefined = still probing. The probe is a version query, so it
            // costs nothing and never prompts the user.
            const capable = capabilities[w.name];
            return (
              <button
                key={w.name}
                onClick={() => onConnect(w)}
                disabled={wallet.status === "connecting" || capable === false}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                  capable === false
                    ? "cursor-not-allowed border-[var(--edge)] bg-cream-50/50 opacity-55"
                    : "border-[var(--edge)] bg-cream-50 hover:border-[var(--edge-strong)] hover:bg-cream-300/60",
                )}
              >
                {w.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={w.icon} alt="" className="h-6 w-6 rounded" />
                ) : (
                  <Wallet size={16} className="text-teal-600" />
                )}
                <span className="flex-1 text-[13.5px] text-teal-900">{w.name}</span>
                {wallet.status === "connecting" ? (
                  <Loader2 size={14} className="animate-spin text-[var(--text-faint)]" />
                ) : capable === undefined ? (
                  <Loader2 size={12} className="animate-spin text-[var(--text-faint)]" />
                ) : capable ? (
                  <span className="shrink-0 rounded-full bg-teal-700/12 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-teal-800">
                    STRK20
                  </span>
                ) : (
                  <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--text-faint)]">
                    no privacy
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Always visible. The wallets a browser happens to have injected are
          mostly EVM wallets surfaced as virtual Starknet accounts; none of them
          can shield, so leaving the user to work that out by trial is unkind. */}
      <div className="mt-3 flex gap-2.5 rounded-xl border border-[var(--edge)] bg-cream-50 p-3">
        <Info size={13} className="mt-0.5 shrink-0 text-teal-700" />
        <p className="text-[12px] leading-relaxed text-[var(--text-dim)]">
          Sealing needs a wallet that implements the STRK20 privacy API — it
          holds the viewing key and builds the proof, which is exactly why Xence
          never sees either.{" "}
          <a
            href="https://www.ready.co"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-teal-700 underline underline-offset-2"
          >
            Ready
          </a>{" "}
          and{" "}
          <a
            href="https://www.xverse.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-teal-700 underline underline-offset-2"
          >
            Xverse
          </a>{" "}
          support it today.
        </p>
      </div>
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
                ? "border-teal-600 bg-teal-700/10"
                : "border-[var(--edge)] bg-cream-50 hover:border-[var(--edge-strong)]",
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "font-display text-lg",
                  active ? "text-teal-900" : "text-[var(--text-dim)]",
                )}
              >
                {tier.label}
              </span>
              {active ? <Check size={13} className="text-teal-700" /> : null}
            </div>
            <p className="tnum mt-0.5 font-mono text-[12px] text-seal-600">
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
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal-700">
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
      <div className="rounded-xl border border-[var(--edge)] bg-cream-50 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-seal-600">
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
