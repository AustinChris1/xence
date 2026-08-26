"use client";

import { motion } from "motion/react";
import {
  EyeOff,
  Trash2,
  Megaphone,
  TrendingUp,
  Ban,
} from "lucide-react";
import { Reveal, RevealWords, StaggerItem } from "@/components/ui/Reveal";
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
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
          <div className="relative">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-seal-600">
                01 · The Problem
              </p>
            </Reveal>
            <h2 className="mt-4 font-display text-[clamp(2.2rem,4.2vw,3.4rem)] leading-[1.04] tracking-[-0.015em] text-teal-900">
              <RevealWords text="Crypto alpha runs on" />{" "}
              <span className="italic text-seal-600">
                <RevealWords text="deleted evidence." delay={0.15} />
              </span>
            </h2>
            <Reveal delay={0.25}>
              <p className="mt-5 text-[17px] leading-relaxed text-[var(--text-dim)]">
                Wins get screenshotted and pinned. Losses get silently deleted. Without cryptographic commitments, track records are just marketing highlight reels.
              </p>
            </Reveal>

            <Reveal delay={0.35}>
              <div className="mt-7 flex items-center gap-4 rounded-2xl border border-[var(--edge)] bg-cream-100 p-4 shadow-xs">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-seal-600/15 text-seal-600">
                  <Ban size={18} />
                </div>
                <div className="text-[13px] text-teal-900">
                  <span className="font-semibold text-seal-700">The Core Flaw:</span> Public calls give away your trade before you fill it; private calls can be denied if they fail.
                </div>
              </div>
            </Reveal>
          </div>

          {/* Visual comparison grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {CLAIMS.map((c) => (
              <div
                key={c.text}
                className={`card-hover rounded-2xl border p-4 shadow-xs transition-all ${
                  c.state === "deleted"
                    ? "border-seal-500/30 bg-seal-500/[0.04]"
                    : "border-teal-700/30 bg-cream-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      c.state === "deleted"
                        ? "bg-seal-500/15 text-seal-600"
                        : "bg-teal-700/15 text-teal-700"
                    }`}
                  >
                    {c.state === "deleted" ? <Trash2 size={13} /> : <Megaphone size={13} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[13.5px] font-medium leading-snug ${
                        c.state === "deleted"
                          ? "text-seal-800/70 line-through decoration-seal-500/60"
                          : "text-teal-900"
                      }`}
                    >
                      {c.text}
                    </p>
                    <span
                      className={`mt-2 inline-block font-mono text-[9px] uppercase tracking-[0.14em] ${
                        c.state === "deleted" ? "text-seal-600 font-semibold" : "text-teal-700 font-semibold"
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
    <section className="on-teal grain relative overflow-hidden py-16 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-teal-700)_0%,transparent_65%)] opacity-50 animate-drift"
      />

      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal-300">
            02 · The Solution
          </p>
        </Reveal>

        <h2 className="mx-auto mt-4 max-w-3xl font-display text-[clamp(2rem,3.8vw,3.2rem)] leading-[1.05] tracking-[-0.015em] text-cream-50">
          <RevealWords text="Privacy makes forecasters accountable." />
        </h2>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--edge)] bg-teal-800/50 p-6 text-left shadow-[var(--shadow-deep)] backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-cream-200">
              <TrendingUp size={18} />
            </div>
            <h3 className="mt-4 font-display text-xl text-cream-50">1. Public Accountability</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-cream-200/80">
              The commitment hash, horizon, and STRK bond are public on Starknet. No post-hoc edits or retroactive revisions.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--edge)] bg-teal-800/50 p-6 text-left shadow-[var(--shadow-deep)] backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-seal-600 text-cream-100">
              <EyeOff size={18} />
            </div>
            <h3 className="mt-4 font-display text-xl text-cream-50">2. Zero Alpha Leak</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-cream-200/80">
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
    <section id="mechanism" className="relative border-t border-[var(--edge)] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-seal-600">
              03 · Architecture
            </p>
          </Reveal>
          <h2 className="mt-3 font-display text-[clamp(2.2rem,4.2vw,3.5rem)] leading-[1.02] text-teal-900">
            <RevealWords text="Four steps, enforced by" />{" "}
            <span className="italic text-seal-600">
              <RevealWords text="Cairo maths." delay={0.15} />
            </span>
          </h2>
        </div>

        <Pipeline />
      </div>
    </section>
  );
}

export function Forfeit() {
  return (
    <section id="forfeit" className="on-teal grain relative overflow-hidden py-16 sm:py-24">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-16">
          <div>
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-seal-400">
                04 · Anti-Gaming Mechanism
              </p>
            </Reveal>
            <h2 className="mt-4 font-display text-[clamp(2.2rem,4.2vw,3.4rem)] leading-[1.02] text-cream-50">
              <RevealWords text="Silence is scored as" />{" "}
              <span className="italic text-seal-400">
                <RevealWords text="a maximum forfeit." delay={0.16} />
              </span>
            </h2>

            <Reveal delay={0.25}>
              <p className="mt-5 text-[16.5px] leading-relaxed text-[var(--text-dim)]">
                To prevent selective revealing (showing winners, hiding losers), any unrevealed forecast automatically scores the maximum Brier error (1.00) and slashes the bond.
              </p>
            </Reveal>

            <Reveal delay={0.35}>
              <div className="mt-6 flex items-center gap-3.5 rounded-2xl border border-seal-500/40 bg-seal-600/15 p-4">
                <Ban size={18} className="shrink-0 text-seal-400" />
                <p className="text-[13px] font-medium text-cream-100">
                  Being wrong out loud is cheap. Disappearing destroys your on-chain reputation score forever.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div className="rounded-2xl border border-[var(--edge-strong)] bg-teal-950/80 p-6 shadow-[var(--shadow-deep)] backdrop-blur-md">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                Brier error penalty scale
              </p>
              <ul className="mt-5 space-y-4">
                {[
                  { l: "High Confidence Correct", v: "0.04", w: "4%", cls: "bg-teal-400" },
                  { l: "Honest Uncertainty (50/50)", v: "0.25", w: "25%", cls: "bg-cream-300" },
                  { l: "Confidently Wrong", v: "0.81", w: "81%", cls: "bg-seal-500" },
                  { l: "Unrevealed (Forfeit)", v: "1.00", w: "100%", cls: "bg-seal-400" },
                ].map((row) => (
                  <li key={row.l}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span
                        className={`text-[13px] font-medium ${row.v === "1.00" ? "text-seal-300" : "text-cream-100"}`}
                      >
                        {row.l}
                      </span>
                      <span className="tnum font-mono text-[12.5px] font-bold text-cream-100">
                        {row.v}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-teal-900">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: row.w }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full ${row.cls}`}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
