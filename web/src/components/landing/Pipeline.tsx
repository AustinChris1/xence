"use client";

import { useState } from "react";
import { Coins, FileLock2, Gavel, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";

type Row = { k: string; v: string; tone?: "sealed" | "good" | "dim" };

const STEPS = [
  {
    icon: FileLock2,
    n: "01",
    title: "Seal",
    tag: "Poseidon hash",
    lede: "Your answer is hashed with a random salt in the browser. Only the hash reaches Starknet.",
    caption: "Written on-chain — nothing here can be edited later.",
    rows: [
      { k: "commitment", v: "0x2b4c…92fd" },
      { k: "question", v: "BTC above $120,000" },
      { k: "horizon", v: "30 Sep · 14:00 UTC" },
      { k: "probability", v: "sealed", tone: "sealed" },
      { k: "thesis", v: "sealed", tone: "sealed" },
    ] as Row[],
  },
  {
    icon: Coins,
    n: "02",
    title: "Bond",
    tag: "STRK20 pool",
    lede: "The stake is funded from inside the privacy pool, so the claim carries weight without carrying your identity.",
    caption: "The vault sees a bond. It never sees a wallet.",
    rows: [
      { k: "from", v: "shielded note · pool" },
      { k: "to", v: "XenceVault" },
      { k: "amount", v: "2 STRK · Bronze", tone: "good" },
      { k: "your wallet", v: "not revealed", tone: "sealed" },
      { k: "submitted by", v: "relayer, not you", tone: "dim" },
    ] as Row[],
  },
  {
    icon: Gavel,
    n: "03",
    title: "Reveal",
    tag: "STARK curve",
    lede: "After the horizon you publish the salt. The contract recomputes the hash and refuses anything that does not match.",
    caption: "Same hash, weeks later. There is no rewriting the call.",
    rows: [
      { k: "salt", v: "0x7f31…a04c" },
      { k: "recomputed", v: "0x2b4c…92fd ✓", tone: "good" },
      { k: "probability", v: "72%", tone: "good" },
      { k: "thesis", v: "funding flipped negative" },
      { k: "state", v: "open → revealed", tone: "dim" },
    ] as Row[],
  },
  {
    icon: TrendingUp,
    n: "04",
    title: "Score",
    tag: "Pragma · or the chain",
    lede: "The oracle median — or an ERC-20 balance for ecosystem questions — settles it. Calibration, not luck, moves the record.",
    caption: "Bond returns to the pool, adjusted by how honest the number was.",
    rows: [
      { k: "observed", v: "$121,430 · 11 sources" },
      { k: "outcome", v: "happened", tone: "good" },
      { k: "brier", v: "0.078", tone: "good" },
      { k: "settlement", v: "+16% → 2.32 STRK", tone: "good" },
      { k: "record", v: "updated on-chain", tone: "dim" },
    ] as Row[],
  },
];

export function Pipeline() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <div className="mt-12">
      <div className="flex flex-wrap justify-center gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.n}
            onClick={() => setActive(i)}
            className={cn(
              "btn-spring relative overflow-hidden rounded-full border px-4.5 py-2.5 text-[13.5px] font-medium transition-all",
              i === active
                ? "border-transparent bg-gradient-to-r from-teal-400 to-teal-500 text-slate-950 shadow-[0_0_20px_rgba(45,212,191,0.35)] font-semibold"
                : "border-white/10 text-slate-400 bg-white/[0.03] hover:border-teal-400/40 hover:text-white",
            )}
          >
            <span className="relative z-10 inline-flex items-center gap-2">
              <s.icon size={15} />
              <span className="font-mono text-[11px] opacity-75">{s.n}</span>
              {s.title}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8 grid overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative flex flex-col justify-center overflow-hidden p-7 sm:p-9">
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-5 right-6 select-none font-display font-extrabold text-[7rem] leading-none text-teal-400/[0.06]"
          >
            {step.n}
          </span>
          <div>
            <span className="inline-block rounded-md bg-teal-500/10 border border-teal-500/30 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-300">
              {step.tag}
            </span>
            <h3 className="mt-4 text-[2rem] font-bold leading-none text-white">
              {step.title}
            </h3>
            <p className="mt-3.5 max-w-sm text-[15px] leading-relaxed text-slate-300">
              {step.lede}
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#030712] p-6 sm:p-8 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-400">
              what Starknet sees
            </p>
            <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          </div>

          <dl className="mt-5 space-y-3">
            {step.rows.map((r) => (
              <div
                key={r.k}
                className="flex items-baseline justify-between gap-4 border-b border-white/[0.06] pb-2.5 last:border-b-0"
              >
                <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">
                  {r.k}
                </dt>
                <dd
                  className={cn(
                    "text-right font-mono text-[13px]",
                    r.tone === "good"
                      ? "text-teal-300 font-semibold"
                      : r.tone === "dim"
                        ? "text-slate-400"
                        : "text-slate-200",
                  )}
                >
                  {r.tone === "sealed" ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3 w-16 rounded-sm bg-teal-500/20 blur-[1px]" />
                      <span className="text-slate-400 font-mono text-[11px]">{r.v}</span>
                    </span>
                  ) : (
                    r.v
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-[12.5px] leading-relaxed text-slate-400">
            {step.caption}
          </p>
        </div>
      </div>
    </div>
  );
}
