"use client";

import {
  EyeOff,
  Trash2,
  Megaphone,
  TrendingUp,
} from "lucide-react";
import { Pipeline } from "./Pipeline";

const CLAIMS = [
  { text: "Called ETH at $1,800. Told you.", state: "kept" },
  { text: "SOL to $400 by June, screenshot this", state: "deleted" },
  { text: "Been bullish since the start, check my TL", state: "kept" },
  { text: "Shorting here, easy money", state: "deleted" },
];

export function Problem() {
  return (
    <section className="relative border-t border-cream-300 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <div className="relative">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-600">
              01 · The problem
            </p>
            <h2 className="mt-4 text-[clamp(2.2rem,4.2vw,3.6rem)] font-bold leading-[1.04] tracking-tight text-teal-950">
              Everyone remembers
              <span className="block text-rose-600">their winning calls.</span>
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-cream-500">
              Bad predictions vanish. Good ones become screenshots. Xence makes
              the timestamp impossible to fake, so a record has to include both.
            </p>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            {CLAIMS.map((c) => (
              <div
                key={c.text}
                className={`rounded-2xl border p-4.5 backdrop-blur-md transition-all ${
                  c.state === "deleted"
                    ? "border-rose-400/45 bg-rose-500/[0.05]"
                    : "border-teal-600/35 bg-teal-500/[0.05]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                      c.state === "deleted"
                        ? "bg-rose-500/15 text-rose-600"
                        : "bg-teal-500/15 text-teal-700"
                    }`}
                  >
                    {c.state === "deleted" ? <Trash2 size={14} /> : <Megaphone size={14} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[14px] font-medium leading-snug ${
                        c.state === "deleted"
                          ? "text-cream-400 line-through decoration-rose-500/70"
                          : "text-teal-950"
                      }`}
                    >
                      {c.text}
                    </p>
                    <span
                      className={`mt-2.5 inline-block font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] ${
                        c.state === "deleted" ? "text-rose-600" : "text-teal-700"
                      }`}
                    >
                      {c.state === "deleted" ? "Gone after loss" : "Kept after win"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Conflict() {
  return (
    <section className="on-teal grain relative overflow-hidden border-t border-cream-300 py-20 sm:py-28">
      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-600">
          02 · The fix
        </p>

        <h2 className="mx-auto mt-4 max-w-3xl text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[1.05] tracking-tight text-teal-950">
          Lock the prediction. Hide the edge.
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-cream-300 bg-white p-7 text-left shadow-[0_14px_34px_rgba(16,32,29,0.10)] backdrop-blur-xl transition-all hover:border-teal-600/35">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-teal-600/35 bg-teal-500/15 text-teal-700">
              <TrendingUp size={20} />
            </div>
            <h3 className="mt-5 text-2xl font-bold text-teal-950">Accountable later</h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-cream-500">
              The timestamp and question are public. The call cannot be edited
              once the forecast is sealed.
            </p>
          </div>

          <div className="rounded-2xl border border-cream-300 bg-white p-7 text-left shadow-[0_14px_34px_rgba(16,32,29,0.10)] backdrop-blur-xl transition-all hover:border-teal-600/35">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-400/45 bg-indigo-500/15 text-indigo-600">
              <EyeOff size={20} />
            </div>
            <h3 className="mt-5 text-2xl font-bold text-teal-950">Private until reveal</h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-cream-500">
              Your probability, thesis, and wallet stay hidden while the trade
              still matters.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Mechanism() {
  return (
    <section id="mechanism" className="relative border-t border-cream-300 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-600">
            02 · How it works
          </p>
          <h2 className="mt-3 text-[clamp(2.2rem,4.2vw,3.6rem)] font-bold leading-[1.02] tracking-tight text-teal-950">
            Four steps. No revision history.
          </h2>
        </div>

        <Pipeline />
      </div>
    </section>
  );
}

export function Forfeit() {
  return (
    <section id="forfeit" className="grain relative overflow-hidden border-t border-cream-300 py-20 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-16">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-600">
              03 · The rule
            </p>
            <h2 className="mt-4 text-[clamp(2.2rem,4.2vw,3.5rem)] font-bold leading-[1.02] tracking-tight text-teal-950">
              If you disappear,
              <span className="block text-rose-600">the record shows it.</span>
            </h2>

            <p className="mt-5 text-[17px] leading-relaxed text-cream-500">
              If a forecast is never revealed, it is scored as the worst
              possible miss. That keeps people from showing winners and hiding
              losers.
            </p>

            <p className="mt-7 border-l-2 border-rose-400/45 pl-5 text-[19px] font-semibold leading-snug text-teal-950">
              Being wrong is allowed. Vanishing is expensive.
            </p>
          </div>

          <div className="rounded-2xl border border-cream-300 bg-white p-7 shadow-[0_14px_34px_rgba(16,32,29,0.10)] backdrop-blur-xl">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-400">
              Forecast score
            </p>
            <ul className="mt-6 space-y-5">
              {[
                { l: "Confident and right", v: "0.04", w: "4%", cls: "bg-teal-600" },
                { l: "Honest uncertainty", v: "0.25", w: "25%", cls: "bg-cyan-300" },
                { l: "Confident and wrong", v: "0.81", w: "81%", cls: "bg-amber-400" },
                { l: "Never revealed", v: "1.00", w: "100%", cls: "bg-rose-500" },
              ].map((row) => (
                <li key={row.l}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span
                      className={`text-[14px] font-medium ${row.v === "1.00" ? "font-semibold text-rose-700" : "text-teal-950"}`}
                    >
                      {row.l}
                    </span>
                    <span className="tnum font-mono text-[13px] font-bold text-teal-950">
                      {row.v}
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-cream-200">
                    <div
                      style={{ width: row.w }}
                      className={`h-full rounded-full ${row.cls}`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
