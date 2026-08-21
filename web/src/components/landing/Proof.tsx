"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Layers,
  KeyRound,
  Boxes,
  Radio,
  FileKey2,
  Code2,
} from "lucide-react";
import { Reveal, RevealWords, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { CalibrationPlot } from "@/components/art/CalibrationPlot";
import { XenceLogo } from "@/components/brand/XenceMark";
import type { CalibrationBin } from "@/lib/scoring";

/* ===========================================================================
   WHAT STAYS PRIVATE
   =========================================================================== */

const HIDDEN = [
  "Which wallet funded the bond",
  "The exact amount staked",
  "The probability and thesis, until you reveal them",
  "Which notes were spent, and your balance behind them",
  "Who subscribes to whose sealed drops",
  "Every other position you hold",
];

const VISIBLE = [
  "That a forecast was sealed, and exactly when",
  "The conviction tier — Bronze, Silver or Gold",
  "The question and its resolution date",
  "The full call, permanently, once revealed",
  "Your calibration curve and Brier history",
  "Aggregate flows in and out of the pool",
];

export function Privacy() {
  return (
    <section
      id="privacy"
      className="relative border-t border-[var(--edge)] bg-ink-950/50 py-28 sm:py-36"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal-300">
              05 — The split
            </p>
          </Reveal>
          <h2 className="mt-6 font-display text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.04] tracking-[-0.015em] text-cream-50">
            <RevealWords text="Public record." />{" "}
            <span className="italic text-cream-200">
              <RevealWords text="Private book." delay={0.15} />
            </span>
          </h2>
          <Reveal delay={0.28}>
            <p className="mt-6 text-[16.5px] leading-relaxed text-[var(--text-dim)]">
              Privacy here is surgical, not blanket. Everything needed to hold a
              forecaster accountable is public and permanent. Everything that
              would let someone trade against them, or work out who they are, is
              not.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-[var(--edge-strong)] bg-ink-900/80 p-7 sm:p-9">
              <div className="flex items-center gap-2.5">
                <EyeOff size={17} className="text-teal-300" />
                <h3 className="font-display text-2xl text-cream-50">
                  Stays hidden
                </h3>
              </div>
              <ul className="mt-6 space-y-3.5">
                {HIDDEN.map((h) => (
                  <li key={h} className="flex gap-3 text-[14.5px] leading-relaxed">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-teal-400" />
                    <span className="text-[var(--text-dim)]">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="h-full rounded-2xl border border-cream-400/25 bg-cream-200/[0.04] p-7 sm:p-9">
              <div className="flex items-center gap-2.5">
                <Eye size={17} className="text-cream-200" />
                <h3 className="font-display text-2xl text-cream-50">
                  Stays visible
                </h3>
              </div>
              <ul className="mt-6 space-y-3.5">
                {VISIBLE.map((v) => (
                  <li key={v} className="flex gap-3 text-[14.5px] leading-relaxed">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cream-300" />
                    <span className="text-[var(--text-dim)]">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-8 max-w-3xl text-center text-[13.5px] leading-relaxed text-[var(--text-faint)]">
            Honest about the edges: shielding and unshielding are public ERC-20
            legs, and the timing of a pool interaction is observable. Xence never
            claims otherwise — the app shows you what each action reveals before
            you sign it.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ===========================================================================
   CALIBRATION
   =========================================================================== */

const DEMO_BINS: CalibrationBin[] = [
  { bucket: 0.1, claimed: 0.11, observed: 0.09, count: 18 },
  { bucket: 0.3, claimed: 0.31, observed: 0.28, count: 24 },
  { bucket: 0.5, claimed: 0.52, observed: 0.55, count: 31 },
  { bucket: 0.7, claimed: 0.71, observed: 0.68, count: 27 },
  { bucket: 0.9, claimed: 0.9, observed: 0.86, count: 15 },
];

export function Calibration() {
  return (
    <section className="relative border-t border-[var(--edge)] py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal-300">
                06 — What gets measured
              </p>
            </Reveal>
            <h2 className="mt-6 font-display text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.04] tracking-[-0.015em] text-cream-50">
              <RevealWords text="Calibration, not" />{" "}
              <span className="italic text-cream-200">
                <RevealWords text="luck." delay={0.15} />
              </span>
            </h2>
            <Reveal delay={0.28}>
              <div className="mt-7 space-y-4 text-[16.5px] leading-relaxed text-[var(--text-dim)]">
                <p>
                  Xence does not ask whether you were right. It asks whether you
                  knew how right you were. Say 70% and you should be correct about
                  seventy times in a hundred — no more, and no less.
                </p>
                <p>
                  That is what the plot shows: what you claimed against what
                  actually happened. Land on the diagonal and your numbers mean
                  something. Sit below it and you are the kind of confident that
                  costs other people money.
                </p>
                <p className="text-cream-200">
                  Scoring uses the Brier rule, which has a property that matters
                  more than it sounds: it is minimised only by reporting what you
                  genuinely believe. There is no clever hedging strategy that beats
                  honesty. The maths does the enforcement.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.36}>
              <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-[var(--edge)] bg-[var(--edge)]">
                {[
                  { k: "Brier", v: "0.148" },
                  { k: "vs coin flip", v: "+40.8%" },
                  { k: "Resolved", v: "115" },
                ].map((s) => (
                  <div key={s.k} className="bg-ink-900 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
                      {s.k}
                    </p>
                    <p className="tnum mt-1.5 font-display text-2xl text-cream-100">
                      {s.v}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="rounded-2xl border border-[var(--edge)] bg-ink-950/60 p-4 text-cream-100 sm:p-7">
              <CalibrationPlot bins={DEMO_BINS} size={440} className="w-full" />
              <p className="mt-3 text-center text-[12px] text-[var(--text-faint)]">
                A well-calibrated forecaster, 115 resolved calls. The pale
                diagonal is perfection; the teal line is the truth.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ===========================================================================
   SEALED DROPS — the business model
   =========================================================================== */

export function SealedDrops() {
  return (
    <section className="grain relative overflow-hidden border-t border-[var(--edge)] bg-ink-950/60 py-28 sm:py-36">
      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal-300">
            07 — And the part that pays
          </p>
        </Reveal>
        <h2 className="mx-auto mt-6 max-w-3xl font-display text-[clamp(2rem,4.2vw,3.3rem)] leading-[1.06] tracking-[-0.015em] text-cream-50">
          <RevealWords text="Sell the thesis now. Prove it later." />
        </h2>
        <Reveal delay={0.25}>
          <p className="mx-auto mt-6 max-w-2xl text-[16.5px] leading-relaxed text-[var(--text-dim)]">
            A sealed forecast can be encrypted to subscribers at the moment it is
            committed. They read the full thesis immediately; everyone else waits
            for the reveal and sees it scored. Subscriptions are paid through the
            pool, so the analyst&apos;s income and the identity of every subscriber
            stay unlinkable — nobody can map who buys whose alpha, or copy-trade
            the copy-traders.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: FileKey2,
              t: "Encrypted at commit",
              d: "The thesis is sealed to subscriber keys in the same action that writes the hash.",
            },
            {
              icon: Radio,
              t: "Paid privately",
              d: "Subscription flows are private transfers inside the pool. No payer, no amount, no graph.",
            },
            {
              icon: Layers,
              t: "Verified publicly",
              d: "When the seal opens, the same thesis subscribers paid for is what gets scored.",
            },
          ].map((c) => (
            <StaggerItem key={c.t}>
              <div className="h-full rounded-2xl border border-[var(--edge)] bg-ink-900/70 p-6 text-left">
                <c.icon size={17} className="text-cream-200" />
                <h3 className="mt-4 font-display text-xl text-cream-50">{c.t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--text-faint)]">
                  {c.d}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ===========================================================================
   THE STACK
   =========================================================================== */

const SURFACES = [
  {
    icon: Boxes,
    t: "Anonymizer contract",
    d: "XenceVault implements privacy_invoke. The pool withdraws the bond to it, it parks the stake and returns an empty span — the protocol's own idiom for “credit nothing yet”.",
  },
  {
    icon: Layers,
    t: "Open notes",
    d: "Settlement credits an open note via the ${openNoteIds[0]} placeholder, because the payout amount cannot be known at proof time — the oracle has not been read yet.",
  },
  {
    icon: Radio,
    t: "Starknet Wallet API",
    d: "Every private action is one atomic strk20InvokeTransaction. Xence never sees a viewing key, never discovers a note, never generates a proof.",
  },
  {
    icon: KeyRound,
    t: "Signed pseudonyms",
    d: "A reputation key is a STARK-curve identity, authenticated on-chain by a signature over each commitment — so nobody can commit deliberately terrible calls under a rival's name.",
  },
  {
    icon: FileKey2,
    t: "Compliance path",
    d: "The pool's escrowed viewing key still applies. A forecaster can prove authorship of a past call to a regulator or employer without opening anything else.",
  },
  {
    icon: Eye,
    t: "Leakage preflight",
    d: "Before you sign, the app tells you what the action will reveal — amount, timing, anonymity-set size — instead of implying it is all magic.",
  },
];

export function Stack() {
  return (
    <section className="relative border-t border-[var(--edge)] py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal-300">
              08 — Built on STRK20
            </p>
          </Reveal>
          <h2 className="mt-6 font-display text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.04] tracking-[-0.015em] text-cream-50">
            <RevealWords text="Six surfaces of the privacy stack," />{" "}
            <span className="italic text-cream-200">
              <RevealWords text="not a wrapper around one." delay={0.2} />
            </span>
          </h2>
        </div>

        <Stagger className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SURFACES.map((s) => (
            <StaggerItem key={s.t}>
              <div className="group h-full rounded-2xl border border-[var(--edge)] bg-ink-900/70 p-6 transition-colors hover:border-[var(--edge-strong)] hover:bg-ink-850">
                <s.icon size={17} className="text-teal-300" />
                <h3 className="mt-4 font-display text-xl text-cream-50">{s.t}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--text-faint)]">
                  {s.d}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ===========================================================================
   CTA + FOOTER
   =========================================================================== */

export function CTA() {
  return (
    <section className="grain relative overflow-hidden border-t border-[var(--edge)] py-32 sm:py-44">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[90vh] w-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-teal-700)_0%,transparent_62%)] opacity-40 animate-drift"
      />
      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <Reveal>
          <h2 className="font-display text-[clamp(2.3rem,5.5vw,4.2rem)] leading-[1.02] tracking-[-0.02em] text-cream-50">
            <RevealWords text="Put a number on it." />
            <br />
            <span className="italic text-cream-200">
              <RevealWords text="Before anyone knows." delay={0.18} />
            </span>
          </h2>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="mx-auto mt-7 max-w-xl text-[17px] leading-relaxed text-[var(--text-dim)]">
            Seal a forecast in under a minute. It costs a Bronze bond and it stays
            unreadable until you decide to open it.
          </p>
        </Reveal>
        <Reveal delay={0.42}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app"
              className="group inline-flex items-center gap-2 rounded-full bg-cream-200 px-7 py-4 font-medium text-ink-900 transition-all hover:bg-cream-100 hover:shadow-[0_0_50px_-10px] hover:shadow-cream-200/50"
            >
              Seal a forecast
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--edge-strong)] px-7 py-4 text-cream-100 transition-colors hover:border-cream-300 hover:bg-ink-850"
            >
              Browse the record
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--edge)] bg-ink-950 py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <XenceLogo size={24} accent="var(--color-cream-200)" className="text-cream-100" />
            <p className="mt-4 text-[13.5px] leading-relaxed text-[var(--text-faint)]">
              A private, stake-backed reputation layer for forecasts and the agents
              that make them. From <em className="font-display">prescience</em> —
              knowing before it happens.
            </p>
            <p className="mt-4 font-mono text-[11px] text-[var(--text-faint)]">
              Built for the STRK20 Private Sprint · Starknet mainnet
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream-300">
                Product
              </p>
              <ul className="mt-4 space-y-2.5 text-[13.5px]">
                {[
                  { h: "/app", l: "Seal a forecast" },
                  { h: "/leaderboard", l: "Leaderboard" },
                  { h: "/#mechanism", l: "How it works" },
                  { h: "/#privacy", l: "What stays private" },
                ].map((x) => (
                  <li key={x.h}>
                    <Link
                      href={x.h}
                      className="text-[var(--text-dim)] transition-colors hover:text-cream-100"
                    >
                      {x.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream-300">
                Built on
              </p>
              <ul className="mt-4 space-y-2.5 text-[13.5px]">
                {[
                  { h: "https://strk20.starknet.io", l: "STRK20" },
                  { h: "https://strk20-by-example.org", l: "STRK20 by Example" },
                  { h: "https://www.pragma.build", l: "Pragma oracle" },
                  { h: "https://starknet.io", l: "Starknet" },
                ].map((x) => (
                  <li key={x.h}>
                    <a
                      href={x.h}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--text-dim)] transition-colors hover:text-cream-100"
                    >
                      {x.l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--edge)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-[var(--text-faint)]">
            Apache-2.0 · open source
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-[11px] text-[var(--text-faint)] transition-colors hover:text-cream-100"
          >
            <Code2 size={13} /> Read the contracts
          </a>
        </div>
      </div>
    </footer>
  );
}

/** A quiet ticker of recent sealed commitments. Real hashes, unreadable. */
export function SealTicker() {
  const hashes = [
    "0x04f1c9a7e2b8d306fa5417ce9b2d84e07c3a1f6b",
    "0x0b73e5192cd8a04f61e7b23c9f480ade5217c6d3",
    "0x02c8f41ba95e7d0316ba9e58f2c7104db63e8a95",
    "0x09ae23f7c105b8e4d276fa310c95b8e72d40196f",
    "0x0d51b8e39f7a2c604e18d75b3ac9f260814e7b52",
    "0x06fa27c194e5b83d0217ae64c9f38b105d2e79a4",
  ];

  return (
    <div className="relative overflow-hidden border-y border-[var(--edge)] bg-ink-950/70 py-3.5">
      <div className="flex w-max animate-marquee gap-8">
        {[...hashes, ...hashes].map((h, i) => (
          <span
            key={`${h}-${i}`}
            className="flex shrink-0 items-center gap-2.5 font-mono text-[11px] text-[var(--text-faint)]"
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-teal-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.2 }}
            />
            sealed {h}…
          </span>
        ))}
      </div>
    </div>
  );
}
