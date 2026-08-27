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
    tag: "Locked in",
    lede: "Your prediction is sealed in the browser. The chain only receives a receipt that proves when it was made.",
    caption: "The call is timestamped. The answer is still hidden.",
    rows: [
      { k: "receipt", v: "0x2b4c…92fd" },
      { k: "question", v: "BTC above $120,000" },
      { k: "deadline", v: "30 Sep · 14:00 UTC" },
      { k: "probability", v: "sealed", tone: "sealed" },
      { k: "thesis", v: "sealed", tone: "sealed" },
    ] as Row[],
  },
  {
    icon: Coins,
    n: "02",
    title: "Bond",
    tag: "Skin in the game",
    lede: "A private STRK bond backs the call, so reputation has weight without exposing the wallet behind it.",
    caption: "The vault sees the bond. It does not see who funded it.",
    rows: [
      { k: "from", v: "private pool" },
      { k: "to", v: "XenceVault" },
      { k: "amount", v: "2 STRK · Bronze", tone: "good" },
      { k: "wallet", v: "not revealed", tone: "sealed" },
      { k: "sender", v: "relayer", tone: "dim" },
    ] as Row[],
  },
  {
    icon: Gavel,
    n: "03",
    title: "Reveal",
    tag: "Open the seal",
    lede: "After the deadline, the forecaster opens the seal. The contract checks that the revealed call matches the original receipt.",
    caption: "Same receipt, same call. No edits after the fact.",
    rows: [
      { k: "receipt", v: "0x2b4c…92fd" },
      { k: "match", v: "verified", tone: "good" },
      { k: "probability", v: "72%", tone: "good" },
      { k: "thesis", v: "funding flipped negative" },
      { k: "state", v: "revealed", tone: "dim" },
    ] as Row[],
  },
  {
    icon: TrendingUp,
    n: "04",
    title: "Score",
    tag: "Record updated",
    lede: "The outcome is settled, the forecast is scored, and the public track record updates.",
    caption: "Over time, reputation follows calibration instead of charisma.",
    rows: [
      { k: "observed", v: "$121,430" },
      { k: "outcome", v: "happened", tone: "good" },
      { k: "score", v: "0.078", tone: "good" },
      { k: "bond", v: "+16%", tone: "good" },
      { k: "record", v: "updated", tone: "dim" },
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
                ? "border-transparent bg-teal-600 font-semibold text-teal-950 shadow-[0_10px_24px_rgba(13,148,136,0.18)]"
                : "border-cream-300 bg-cream-200/70 text-cream-400 hover:border-cream-400/60 hover:text-teal-950",
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

      <div className="mt-8 grid overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-[0_14px_34px_rgba(16,32,29,0.10)] backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative flex flex-col justify-center overflow-hidden p-7 sm:p-9">
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-5 right-6 select-none font-display text-[7rem] font-extrabold leading-none text-teal-400/[0.05]"
          >
            {step.n}
          </span>
          <div>
            <span className="inline-block rounded-md border border-teal-600/35 bg-teal-500/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-700">
              {step.tag}
            </span>
            <h3 className="mt-4 text-[2rem] font-bold leading-none text-teal-950">
              {step.title}
            </h3>
            <p className="mt-3.5 max-w-sm text-[15px] leading-relaxed text-cream-500">
              {step.lede}
            </p>
          </div>
        </div>

        <div className="border-t border-cream-300 bg-[#f0eee6] p-6 sm:p-8 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-600">
              public receipt
            </p>
            <span className="flex h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
          </div>

          <dl className="mt-5 space-y-3">
            {step.rows.map((r) => (
              <div
                key={r.k}
                className="flex items-baseline justify-between gap-4 border-b border-cream-300/60 pb-2.5 last:border-b-0"
              >
                <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-cream-400">
                  {r.k}
                </dt>
                <dd
                  className={cn(
                    "text-right font-mono text-[13px]",
                    r.tone === "good"
                      ? "font-semibold text-teal-700"
                      : r.tone === "dim"
                        ? "text-cream-400"
                        : "text-teal-900",
                  )}
                >
                  {r.tone === "sealed" ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3 w-16 rounded-sm bg-teal-500/20 blur-[1px]" />
                      <span className="font-mono text-[11px] text-cream-400">{r.v}</span>
                    </span>
                  ) : (
                    r.v
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-[12.5px] leading-relaxed text-cream-400">
            {step.caption}
          </p>
        </div>
      </div>
    </div>
  );
}
