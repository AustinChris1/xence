"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownToLine, ChevronDown, Eye, Loader2, Wallet, X } from "lucide-react";
import { InfoTip } from "@/components/ui/InfoTip";
import {
  explainWalletError,
  formatStrk,
  poolFee,
  publicBalance,
  shield,
  type DiscoveredWallet,
} from "@/lib/strk20";
import { TIERS } from "@/lib/scoring";
import { txUrl } from "@/lib/config";
import { cn } from "@/lib/cn";
import type { useXence } from "./useXence";

/** Wallet, balances and shielding, condensed into one bar above the form. */
export function WalletBar({ x }: { x: ReturnType<typeof useXence> }) {
  const [open, setOpen] = useState(false);

  if (x.wallet.status !== "connected") {
    return (
      <div className="rounded-2xl border border-[var(--edge)] bg-cream-100 p-2">
        {x.wallet.status === "error" ? (
          <p className="mb-2 px-2 py-1 text-[12px] text-seal-700">
            {x.wallet.message}
          </p>
        ) : null}
        {x.wallets.length === 0 ? (
          <p className="px-2 py-2 text-[13px] text-[var(--text-faint)]">
            No wallet detected.{" "}
            <a
              href="https://www.ready.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 underline underline-offset-2"
            >
              Ready
            </a>{" "}
            supports STRK20.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {x.wallets.map((w: DiscoveredWallet) => {
              const capable = x.capabilities[w.name];
              return (
                <button
                  key={w.name}
                  onClick={() => x.connectTo(w)}
                  disabled={capable === false || x.wallet.status === "connecting"}
                  className={cn(
                    "inline-flex flex-1 items-center gap-2 rounded-xl px-3 py-2 text-[13px] transition-colors",
                    capable === false
                      ? "cursor-not-allowed opacity-45"
                      : "border border-[var(--edge)] bg-cream-50 hover:border-[var(--edge-strong)]",
                  )}
                >
                  {w.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={w.icon} alt="" className="h-4 w-4 rounded" />
                  ) : (
                    <Wallet size={13} />
                  )}
                  <span className="flex-1 truncate text-left text-teal-900">
                    {w.name}
                  </span>
                  {capable === undefined ? (
                    <Loader2 size={11} className="animate-spin opacity-50" />
                  ) : capable ? null : (
                    <span className="font-mono text-[9px] uppercase opacity-60">
                      no privacy
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--edge)] bg-cream-100">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
        <span className="font-mono text-[12px] text-teal-900">
          {x.wallet.address.slice(0, 6)}…{x.wallet.address.slice(-4)}
        </span>
        <span className="flex-1" />
        <ShieldedBalance
          balance={x.balance}
          onReveal={x.revealBalance}
        />
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-1 text-[var(--text-faint)] transition-colors hover:text-teal-700"
          aria-label={open ? "Hide shielding" : "Show shielding"}
        >
          <ChevronDown
            size={14}
            className={cn("transition-transform", open && "rotate-180")}
          />
        </button>
        <button
          onClick={x.disconnect}
          className="rounded-lg p-1 text-[var(--text-faint)] transition-colors hover:text-seal-600"
          aria-label="Disconnect"
        >
          <X size={13} />
        </button>
      </div>

      {open ? (
        <Shielding
          account={x.wallet.account}
          address={x.wallet.address}
          onShielded={x.revealBalance}
        />
      ) : null}
    </div>
  );
}

function ShieldedBalance({
  balance,
  onReveal,
}: {
  balance: bigint | null;
  onReveal: () => void;
}) {
  if (balance === null) {
    return (
      <button
        onClick={onReveal}
        className="inline-flex items-center gap-1 rounded-lg border border-[var(--edge)] px-2 py-1 font-mono text-[11px] text-[var(--text-dim)] transition-colors hover:border-[var(--edge-strong)]"
      >
        <Eye size={11} /> shielded
        <InfoTip align="right">
          Reading your shielded balance needs the wallet&apos;s consent, so Xence
          asks only when you click — never on load.
        </InfoTip>
      </button>
    );
  }
  return (
    <span className="tnum font-mono text-[12px] text-teal-800">
      {formatStrk(balance)} STRK
    </span>
  );
}

function Shielding({
  account,
  address,
  onShielded,
}: {
  account: Parameters<typeof shield>[0];
  address: string;
  onShielded: () => void;
}) {
  const [pub, setPub] = useState<bigint | null>(null);
  const [fee, setFee] = useState<bigint | null>(null);
  const [amount, setAmount] = useState("25");
  const [busy, setBusy] = useState(false);
  const [tx, setTx] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    publicBalance(address).then(setPub).catch(() => setPub(null));
    poolFee().then(setFee).catch(() => setFee(null));
  }, [address]);
  useEffect(refresh, [refresh]);

  const feeStrk = fee !== null ? Number(fee) / 1e18 : null;
  const roundTrip =
    feeStrk === null ? null : TIERS.bronze.bond + feeStrk * 2;

  async function onShield() {
    setError(null);
    setTx(null);
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return setError("Enter an amount.");
    const wei = BigInt(Math.round(value * 1e6)) * 10n ** 12n;
    if (pub !== null && wei > pub)
      return setError(`Only ${formatStrk(pub)} STRK public.`);
    setBusy(true);
    try {
      setTx(await shield(account, wei));
      onShielded();
      setTimeout(refresh, 4000);
    } catch (e) {
      setError(explainWalletError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-t border-[var(--edge)] bg-cream-50/60 p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
          Shield
        </span>
        <InfoTip align="left">
          A bond is paid from inside the pool, so value has to cross in first.
          This deposit is public by design — the chain records that you deposited
          and how much, but not what you do inside afterwards.
          {roundTrip !== null ? (
            <>
              {" "}
              The pool charges {feeStrk?.toFixed(0)} STRK per private operation,
              so a Bronze round trip costs about {roundTrip.toFixed(0)} STRK.
            </>
          ) : null}
        </InfoTip>
        <span className="flex-1" />
        <span className="tnum font-mono text-[11px] text-[var(--text-faint)]">
          {pub === null ? "…" : `${formatStrk(pub)} public`}
        </span>
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={busy}
          aria-label="Amount of STRK to shield"
          className="tnum w-full rounded-xl border border-[var(--edge)] bg-cream-50 px-3 py-2 font-mono text-[13px] text-teal-900 outline-none"
        />
        <button
          onClick={onShield}
          disabled={busy || pub === null}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-[13px] font-medium text-cream-100 transition-colors hover:bg-teal-600 disabled:opacity-40"
        >
          {busy ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <ArrowDownToLine size={13} />
          )}
          Shield
        </button>
      </div>

      {tx ? (
        <a
          href={txUrl(tx)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block font-mono text-[11px] text-teal-700 underline underline-offset-2"
        >
          shielded — {tx.slice(0, 16)}…
        </a>
      ) : null}
      {error ? (
        <p className="mt-2 break-words text-[11.5px] leading-relaxed text-seal-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
