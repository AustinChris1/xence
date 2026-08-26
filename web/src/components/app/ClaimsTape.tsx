"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ban, Check, Clock, Loader2 } from "lucide-react";
import { InfoTip } from "@/components/ui/InfoTip";
import { fetchClaims, type PublicClaim } from "@/lib/vault";
import { handleFor } from "@/lib/forecast";
import { TIERS } from "@/lib/scoring";
import { txUrl, VAULT_ADDRESS } from "@/lib/config";
import { useNow } from "@/components/app/useNow";
import { cn } from "@/lib/cn";

export function ClaimsTape() {
  const [rows, setRows] = useState<PublicClaim[] | null>(
    VAULT_ADDRESS ? null : [],
  );
  const now = useNow();

  useEffect(() => {
    if (!VAULT_ADDRESS) return;
    let live = true;
    fetchClaims(20).then((r) => live && setRows(r));
    const id = setInterval(() => fetchClaims(20).then((r) => live && setRows(r)), 60_000);
    return () => {
      live = false;
      clearInterval(id);
    };
  }, []);

  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--edge)] bg-cream-100 lg:max-h-[calc(100vh-22rem)] lg:overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center gap-1.5 border-b border-[var(--edge)] bg-cream-100 px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
          The tape
        </span>
        <InfoTip align="left">
          Every sealed claim on this vault. The question, tier and horizon are
          public — they have to be, or the record cannot be checked. Probability
          and thesis stay dark until the forecaster opens the seal.
        </InfoTip>
      </div>

      {rows === null ? (
        <p className="flex items-center justify-center gap-2 px-4 py-10 text-[13px] text-[var(--text-faint)]">
          <Loader2 size={13} className="animate-spin" /> reading the vault
        </p>
      ) : rows.length === 0 ? (
        <EmptyTape />
      ) : (
        <ul>
          {rows.map((r) => (
            <ClaimRow key={r.commitmentHash} claim={r} now={now} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ClaimRow({ claim, now }: { claim: PublicClaim; now: number | null }) {
  const due = now !== null && claim.horizon > 0 && now >= claim.horizon;
  return (
    <li className="border-b border-[var(--edge)] px-4 py-3 transition-colors hover:bg-cream-200/40 last:border-b-0">
      <div className="flex items-start gap-2.5">
        <StateIcon state={claim.state} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-medium text-teal-900">{claim.question}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[10.5px] text-[var(--text-faint)]">
            <span className="font-semibold text-teal-800">{TIERS[claim.tier].label}</span>
            <span>·</span>
            <Link
              href={`/f/${claim.reputationKey}`}
              className="text-teal-700 underline-offset-2 hover:underline hover:text-teal-900"
            >
              {handleFor(claim.reputationKey)}
            </Link>
            {claim.horizon > 0 ? (
              <>
                <span>·</span>
                <span className={cn(due && "font-semibold text-seal-600")}>
                  {due
                    ? "due for reveal"
                    : now
                      ? `in ${horizonLeft(claim.horizon, now)}`
                      : ""}
                </span>
              </>
            ) : null}
          </p>
          <p className="mt-1 text-[12px] text-[var(--text-dim)]">
            {claim.state === "settled" && claim.probabilityBp !== undefined
              ? `said ${(claim.probabilityBp / 100).toFixed(0)}% · ${claim.outcome ? "happened" : "did not"}${
                  claim.brierBp !== undefined
                    ? ` · Brier ${(claim.brierBp / 10_000).toFixed(2)}`
                    : ""
                }`
              : claim.state === "forfeited"
                ? "never opened — scored as a miss"
                : "confidence hidden until reveal"}
          </p>
        </div>
        <a
          href={txUrl(claim.tx)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-spring shrink-0 rounded-md border border-[var(--edge)] bg-cream-50 px-1.5 py-0.5 font-mono text-[9.5px] text-[var(--text-faint)] hover:border-teal-700/40 hover:text-teal-800"
        >
          {claim.block}
        </a>
      </div>
    </li>
  );
}

function StateIcon({ state }: { state: PublicClaim["state"] }) {
  if (state === "settled")
    return <Check size={12} className="mt-1 shrink-0 text-teal-700" />;
  if (state === "forfeited")
    return <Ban size={12} className="mt-1 shrink-0 text-seal-600" />;
  return <Clock size={12} className="mt-1 shrink-0 text-[var(--text-faint)]" />;
}

function horizonLeft(horizon: number, now: number): string {
  const s = Math.max(0, horizon - now);
  if (s < 90 * 60) return `${Math.max(1, Math.round(s / 60))}m`;
  if (s < 36 * 3600) return `${Math.round(s / 3600)}h`;
  return `${Math.round(s / 86400)}d`;
}

/**
 * Nothing has been sealed on this vault yet, so show the shape of a row
 * instead of a blank panel. Marked as an example — it is not chain data.
 */
function EmptyTape() {
  return (
    <div className="px-4 py-6">
      <p className="text-center text-[13px] leading-relaxed text-[var(--text-faint)]">
        Nothing sealed on this vault yet. The first claim on the tape is yours.
      </p>

      <p className="mt-6 mb-2 text-center font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
        example — not chain data
      </p>

      <div className="space-y-2 opacity-55">
        <div className="rounded-xl border border-dashed border-[var(--edge-strong)] px-3 py-2.5">
          <div className="flex items-start gap-2">
            <Clock size={12} className="mt-1 shrink-0 text-[var(--text-faint)]" />
            <div className="min-w-0">
              <p className="text-[13px] text-teal-900">STRK above $0.031</p>
              <p className="mt-0.5 font-mono text-[10.5px] text-[var(--text-faint)]">
                Bronze · in 6h
              </p>
              <p className="mt-1 text-[12px] text-[var(--text-dim)]">
                confidence hidden until reveal
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-[var(--edge-strong)] px-3 py-2.5">
          <div className="flex items-start gap-2">
            <Check size={12} className="mt-1 shrink-0 text-teal-700" />
            <div className="min-w-0">
              <p className="text-[13px] text-teal-900">
                Privacy pool · STRK above 3,000,000 STRK
              </p>
              <p className="mt-0.5 font-mono text-[10.5px] text-[var(--text-faint)]">
                Gold · settled
              </p>
              <p className="mt-1 text-[12px] text-[var(--text-dim)]">
                said 72% · happened · Brier 0.08
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-[11.5px] leading-relaxed text-[var(--text-faint)]">
        Sealed rows show the question only. The number comes out at reveal, and
        the score is computed on-chain.
      </p>
    </div>
  );
}
