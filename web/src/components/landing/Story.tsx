"use client";

import {
  EyeOff,
  Trash2,
  Megaphone,
  TrendingUp,
  Ban,
} from "lucide-react";
import { Pipeline } from "./Pipeline";

const CLAIMS = [
  { text: "Called ETH at $1,800. Told you.", state: "kept" },
  { text: "SOL to $400 by June, screenshot this", state: "deleted" },
  { text: "I said rotate out three weeks ago", state: "kept" },
  { text: "This is the bottom. Loading up.", state: "deleted" },
  { text: "Been bullish since the start, check my TL", state: "kept" },
  { text: "Shorting here, easy money", state: "deleted" },
];

export function Problem() {
  return (
    <section className="relative border-t border-white/10 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <div className="relative">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-400">
              01 · The problem
            </p>
            <h2 className="mt-4 text-[clamp(2.2rem,4.2vw,3.6rem)] font-bold leading-[1.04] tracking-tight text-white">
              Everyone remembers
              <span className="block text-rose-400">their winning calls.</span>
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-slate-300">
              Bad predictions vanish. Good ones become screenshots. Xence makes
              the timestamp impossible to fake, so a record has to include both.
            </p>

            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-rose-500/25 bg-rose-500/[0.08] p-4.5 backdrop-blur-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
                <Ban size={20} />
              </div>
              <div className="text-[13.5px] leading-relaxed text-slate-200">
                <span className="font-semibold text-rose-300">The gap:</span> public calls leak your trade; private calls can be denied later.
              </div>
            </div>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            {CLAIMS.map((c) => (
              <div
                key={c.text}
                className={`rounded-2xl border p-4.5 backdrop-blur-md transition-all ${
                  c.state === "deleted"
                    ? "border-rose-500/25 bg-rose-500/[0.05]"
                    : "border-teal-500/25 bg-teal-500/[0.05]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                      c.state === "deleted"
                        ? "bg-rose-500/15 text-rose-400"
                        : "bg-teal-500/15 text-teal-300"
                    }`}
                  >
                    {c.state === "deleted" ? <Trash2 size={14} /> : <Megaphone size={14} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[14px] font-medium leading-snug ${
                        c.state === "deleted"
                          ? "text-slate-400 line-through decoration-rose-500/70"
                          : "text-white"
                      }`}
                    >
                      {c.text}
                    </p>
                    <span
                      className={`mt-2.5 inline-block font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] ${
                        c.state === "deleted" ? "text-rose-400" : "text-teal-300"
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
    <section className="on-teal grain relative overflow-hidden border-t border-white/10 py-20 sm:py-28">
      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-400">
          02 · The fix
        </p>

        <h2 className="mx-auto mt-4 max-w-3xl text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[1.05] tracking-tight text-white">
          Lock the prediction. Hide the edge.
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-7 text-left shadow-[0_14px_34px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all hover:border-teal-500/35">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-teal-500/25 bg-teal-500/15 text-teal-300">
              <TrendingUp size={20} />
            </div>
            <h3 className="mt-5 text-2xl font-bold text-white">Accountable later</h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-slate-300">
              The timestamp and question are public. The call cannot be edited
              once the forecast is sealed.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-7 text-left shadow-[0_14px_34px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all hover:border-teal-500/35">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/25 bg-indigo-500/15 text-indigo-300">
              <EyeOff size={20} />
            </div>
            <h3 className="mt-5 text-2xl font-bold text-white">Private until reveal</h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-slate-300">
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
    <section id="mechanism" className="relative border-t border-white/10 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-400">
            03 · How it works
          </p>
          <h2 className="mt-3 text-[clamp(2.2rem,4.2vw,3.6rem)] font-bold leading-[1.02] tracking-tight text-white">
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
    <section id="forfeit" className="grain relative overflow-hidden border-t border-white/10 py-20 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-16">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-400">
              04 · The rule
            </p>
            <h2 className="mt-4 text-[clamp(2.2rem,4.2vw,3.5rem)] font-bold leading-[1.02] tracking-tight text-white">
              If you disappear,
              <span className="block text-rose-400">the record shows it.</span>
            </h2>

            <p className="mt-5 text-[17px] leading-relaxed text-slate-300">
              If a forecast is never revealed, it is scored as the worst
              possible miss. That keeps people from showing winners and hiding
              losers.
            </p>

            <div className="mt-7 flex items-center gap-4 rounded-2xl border border-rose-500/25 bg-rose-500/[0.08] p-4.5 backdrop-blur-md">
              <Ban size={20} className="shrink-0 text-rose-400" />
              <p className="text-[14px] font-medium text-slate-200">
                Being wrong is allowed. Vanishing is expensive.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/65 p-7 shadow-[0_14px_34px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Forecast score
            </p>
            <ul className="mt-6 space-y-5">
              {[
                { l: "Confident and right", v: "0.04", w: "4%", cls: "bg-teal-400" },
                { l: "Honest uncertainty", v: "0.25", w: "25%", cls: "bg-cyan-300" },
                { l: "Confident and wrong", v: "0.81", w: "81%", cls: "bg-amber-400" },
                { l: "Never revealed", v: "1.00", w: "100%", cls: "bg-rose-500" },
              ].map((row) => (
                <li key={row.l}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span
                      className={`text-[14px] font-medium ${row.v === "1.00" ? "font-semibold text-rose-300" : "text-white"}`}
                    >
                      {row.l}
                    </span>
                    <span className="tnum font-mono text-[13px] font-bold text-white">
                      {row.v}
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-800">
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
