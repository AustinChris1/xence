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
    <section className="relative py-20 sm:py-28 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <div className="relative">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-400">
              01 · The Problem
            </p>
            <h2 className="mt-4 text-[clamp(2.2rem,4.2vw,3.6rem)] font-bold leading-[1.04] tracking-tight text-white">
              Crypto alpha runs on
              <span className="block text-rose-400">deleted evidence.</span>
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-slate-300">
              Wins get screenshotted and pinned. Losses get silently deleted. Without cryptographic commitments, track records are just marketing highlight reels.
            </p>

            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4.5 backdrop-blur-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                <Ban size={20} />
              </div>
              <div className="text-[13.5px] leading-relaxed text-slate-200">
                <span className="font-semibold text-rose-300">The Core Flaw:</span> Public calls give away your trade before you fill it; private calls can be denied if they fail.
              </div>
            </div>
          </div>

          {/* Visual comparison grid */}
          <div className="grid gap-3.5 sm:grid-cols-2">
            {CLAIMS.map((c) => (
              <div
                key={c.text}
                className={`rounded-2xl border p-4.5 backdrop-blur-md transition-all ${
                  c.state === "deleted"
                    ? "border-rose-500/30 bg-rose-500/[0.06]"
                    : "border-teal-500/30 bg-teal-500/[0.06]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                      c.state === "deleted"
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-teal-500/20 text-teal-300"
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
                      {c.state === "deleted" ? "Deleted after loss" : "Kept & pinned"}
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
    <section className="on-teal grain relative overflow-hidden py-20 sm:py-28 border-t border-white/10">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.18)_0%,transparent_65%)] opacity-60 animate-drift"
      />

      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-400">
          02 · The Solution
        </p>

        <h2 className="mx-auto mt-4 max-w-3xl text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[1.05] tracking-tight text-white">
          Privacy makes forecasters accountable.
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-7 text-left shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all hover:border-teal-500/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <TrendingUp size={20} />
            </div>
            <h3 className="mt-5 text-2xl font-bold text-white">1. Public Accountability</h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-slate-300">
              The commitment hash, horizon, and STRK bond are public on Starknet. No post-hoc edits or retroactive revisions.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-7 text-left shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all hover:border-teal-500/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <EyeOff size={20} />
            </div>
            <h3 className="mt-5 text-2xl font-bold text-white">2. Zero Alpha Leak</h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-slate-300">
              Your exact probability, reasoning, and wallet address stay 100% dark inside the STRK20 pool until reveal.
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
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-400">
            03 · Architecture
          </p>
          <h2 className="mt-3 text-[clamp(2.2rem,4.2vw,3.6rem)] font-bold leading-[1.02] tracking-tight text-white">
            Four steps, enforced by Cairo maths.
          </h2>
        </div>

        <Pipeline />
      </div>
    </section>
  );
}

export function Forfeit() {
  return (
    <section id="forfeit" className="grain relative overflow-hidden py-20 sm:py-28 border-t border-white/10">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-16">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-400">
              04 · Anti-Gaming Mechanism
            </p>
            <h2 className="mt-4 text-[clamp(2.2rem,4.2vw,3.5rem)] font-bold leading-[1.02] tracking-tight text-white">
              Silence is scored as
              <span className="block text-rose-400">a maximum forfeit.</span>
            </h2>

            <p className="mt-5 text-[17px] leading-relaxed text-slate-300">
              To prevent selective revealing (showing winners, hiding losers), any unrevealed forecast automatically scores the maximum Brier error (1.00) and slashes the bond.
            </p>

            <div className="mt-7 flex items-center gap-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4.5 backdrop-blur-md">
              <Ban size={20} className="shrink-0 text-rose-400" />
              <p className="text-[14px] font-medium text-slate-200">
                Being wrong out loud is cheap. Disappearing destroys your on-chain reputation score forever.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-7 shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Brier error penalty scale
            </p>
            <ul className="mt-6 space-y-5">
              {[
                { l: "High Confidence Correct", v: "0.04", w: "4%", cls: "bg-teal-400" },
                { l: "Honest Uncertainty (50/50)", v: "0.25", w: "25%", cls: "bg-cyan-300" },
                { l: "Confidently Wrong", v: "0.81", w: "81%", cls: "bg-amber-400" },
                { l: "Unrevealed (Forfeit)", v: "1.00", w: "100%", cls: "bg-rose-500" },
              ].map((row) => (
                <li key={row.l}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span
                      className={`text-[14px] font-medium ${row.v === "1.00" ? "text-rose-300 font-semibold" : "text-white"}`}
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
                      className={`h-full rounded-full ${row.cls} shadow-[0_0_10px_currentColor]`}
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
