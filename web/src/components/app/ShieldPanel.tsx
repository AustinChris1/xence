"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpRight, Loader2, Info } from "lucide-react";
import type { WalletAccountV6 } from "starknet";
import { Card } from "./Panels";
import {
  explainWalletError,
  formatStrk,
  poolFee,
  publicBalance,
  shield,
} from "@/lib/strk20";
import { TIERS } from "@/lib/scoring";
import { txUrl } from "@/lib/config";

/**
 * SHIELDING — the step everything else depends on.
 *
 * Nothing in Xence can be sealed with public STRK: a bond is paid from inside
 * the pool, so value has to cross in first. That crossing is the one
 * deliberately public leg of the whole system.
 *
 * The dapp asks the wallet to do it. Users should not have to go hunting for a
 * "shield" button in their wallet's own UI — most wallets don't surface one,
 * because the Wallet API exists precisely so applications can request it.
 */
export function ShieldPanel({
  account,
  address,
  onShielded,
}: {
  account: WalletAccountV6;
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

  const bronze = TIERS.bronze.bond;
  // One seal costs the bond plus one pool fee; the reveal costs another fee and
  // returns the bond. Quote the round trip, since a user who shields only
  // enough for the seal gets stuck holding a forecast they cannot open.
  const feeStrk = fee !== null ? Number(fee) / 1e18 : null;
  const roundTrip = feeStrk === null ? null : bronze + feeStrk * 2;

  async function onShield() {
    setError(null);
    setTx(null);
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    const wei = BigInt(Math.round(value * 1e6)) * 10n ** 12n; // 6dp, then scale
    if (pub !== null && wei > pub) {
      setError(`You only hold ${formatStrk(pub)} STRK publicly.`);
      return;
    }
    setBusy(true);
    try {
      const hash = await shield(account, wei);
      setTx(hash);
      onShielded();
      setTimeout(refresh, 4000);
    } catch (e) {
      setError(explainWalletError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card label="Shield STRK">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
          Public balance
        </span>
        <span className="tnum font-display text-xl text-teal-900">
          {pub === null ? "…" : `${formatStrk(pub)} STRK`}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-[var(--edge)] bg-cream-50 px-3 py-2">
          <input
            type="number"
            min={0}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={busy}
            className="tnum w-full bg-transparent font-mono text-[14px] text-teal-900 outline-none"
            aria-label="Amount of STRK to shield"
          />
          <span className="font-mono text-[11px] text-[var(--text-faint)]">STRK</span>
        </div>
        <button
          onClick={onShield}
          disabled={busy || pub === null}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-[13px] font-medium text-cream-100 transition-colors hover:bg-teal-600 disabled:opacity-40"
        >
          {busy ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <ArrowDownToLine size={14} />
          )}
          Shield
        </button>
      </div>

      {roundTrip !== null ? (
        <div className="mt-3 flex gap-2 rounded-lg border border-[var(--edge)] bg-cream-50 p-3">
          <Info size={13} className="mt-0.5 shrink-0 text-teal-700" />
          <p className="text-[12px] leading-relaxed text-[var(--text-dim)]">
            The pool charges{" "}
            <span className="tnum font-medium text-teal-800">
              {feeStrk?.toFixed(0)} STRK
            </span>{" "}
            per private operation, on top of gas. A Bronze forecast needs{" "}
            <span className="tnum font-medium text-teal-800">{bronze}</span> for
            the bond plus a fee to seal and another to reveal — about{" "}
            <span className="tnum font-medium text-teal-800">
              {roundTrip.toFixed(0)} STRK
            </span>{" "}
            for the round trip. The bond comes back when you reveal.
          </p>
        </div>
      ) : null}

      {tx ? (
        <div className="mt-3 rounded-lg border border-teal-600/40 bg-teal-600/10 p-3">
          <p className="text-[12.5px] font-medium text-teal-800">
            Shielded. It takes a moment to appear.
          </p>
          <a
            href={txUrl(tx)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-teal-700 underline underline-offset-2"
          >
            {tx.slice(0, 18)}… <ArrowUpRight size={11} />
          </a>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 break-words rounded-lg border border-seal-500/40 bg-seal-500/10 p-3 font-mono text-[11.5px] leading-relaxed text-seal-700">
          {error}
        </p>
      ) : null}

      <p className="mt-3 text-[11.5px] leading-relaxed text-[var(--text-faint)]">
        This step is public on purpose: the chain records that you deposited, and
        how much. What it cannot show is what you later do inside the pool.
        Shield well before you seal — separating the two in time is what actually
        breaks the link.
      </p>
    </Card>
  );
}
