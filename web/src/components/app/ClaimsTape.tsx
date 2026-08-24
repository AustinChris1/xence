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
        <p className="px-4 py-8 text-center text-[13px] leading-relaxed text-[var(--text-faint)]">
          Nothing sealed on this vault yet. The first claim on the tape is
          yours.
        </p>
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
    <li className="border-b border-[var(--edge)] px-4 py-3 last:border-b-0">
      <div className="flex items-start gap-2">
        <StateIcon state={claim.state} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] text-teal-900">{claim.question}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[10.5px] text-[var(--text-faint)]">
            <span>{TIERS[claim.tier].label}</span>
            <Link
              href={`/f/${claim.reputationKey}`}
              className="text-teal-800 hover:text-teal-600"
            >
              {handleFor(claim.reputationKey)}
            </Link>
            {claim.horizon > 0 ? (
              <span>
                {due
                  ? "due"
                  : now
                    ? `in ${horizonLeft(claim.horizon, now)}`
                    : ""}
              </span>
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
          className="shrink-0 font-mono text-[10px] text-[var(--text-faint)] hover:text-teal-700"
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
