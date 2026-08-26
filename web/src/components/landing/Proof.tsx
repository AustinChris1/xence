"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowUpRight,
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
import waxseal from "../../../public/img/wax-seal.jpg";
import horizon from "../../../public/img/storm-horizon.jpg";

const HIDDEN = [
  "Which wallet funded the bond",
  "The probability and thesis, until you reveal them",
  "Who submitted the transaction — a relayer signs, not you",
  "Which notes were spent, and your balance behind them",
  "Who backs which forecaster, and with how much",
  "Every other position you hold",
];

const VISIBLE = [
  "That a forecast was sealed, and exactly when",
  "The question and its resolution date",
  "The bond and its tier — sizes are fixed, so an amount identifies nobody",
  "The full call, permanently, once revealed",
  "Your calibration curve and Brier history",
  "Aggregate flows in and out of the pool",
];

export function Privacy() {
  return (
    <section id="privacy" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-seal-600">
              05 · Privacy Matrix
            </p>
          </Reveal>
          <h2 className="mt-4 font-display text-[clamp(2.2rem,4.2vw,3.4rem)] leading-[1.02] text-teal-900">
            <RevealWords text="Public record." />{" "}
            <span className="italic text-seal-600">
              <RevealWords text="Private book." delay={0.15} />
            </span>
          </h2>
          <Reveal delay={0.25}>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-dim)]">
              Everything needed to mathematically verify a forecaster is transparent on-chain. Everything that would reveal your book, wallet, or position size stays dark.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="on-teal h-full rounded-2xl border border-[var(--edge)] p-7 shadow-[var(--shadow-deep)] backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-800 text-teal-300">
                  <EyeOff size={16} />
                </div>
                <h3 className="font-display text-xl text-cream-50">Stays 100% Dark</h3>
              </div>
              <ul className="mt-5 space-y-3">
                {HIDDEN.map((h) => (
                  <li key={h} className="flex items-center gap-3 text-[14px] text-cream-100/80">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="h-full rounded-2xl border border-[var(--edge)] bg-cream-100 p-7 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-seal-600/10 text-seal-700">
                  <Eye size={16} />
                </div>
                <h3 className="font-display text-xl text-teal-900">Stays On-Chain</h3>
              </div>
              <ul className="mt-5 space-y-3">
                {VISIBLE.map((v) => (
                  <li key={v} className="flex items-center gap-3 text-[14px] text-teal-900/80">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-seal-500" />
                    <span>{v}</span>
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

const DEMO_BINS: CalibrationBin[] = [
  { bucket: 0.1, claimed: 0.11, observed: 0.09, count: 18 },
  { bucket: 0.3, claimed: 0.31, observed: 0.28, count: 24 },
  { bucket: 0.5, claimed: 0.52, observed: 0.55, count: 31 },
  { bucket: 0.7, claimed: 0.71, observed: 0.68, count: 27 },
  { bucket: 0.9, claimed: 0.9, observed: 0.86, count: 15 },
];

export function Calibration() {
  return (
    <section className="relative border-t border-[var(--edge)] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-seal-600">
                06 · Evaluation
              </p>
            </Reveal>
            <h2 className="mt-4 font-display text-[clamp(2.2rem,4.2vw,3.4rem)] leading-[1.02] text-teal-900">
              <RevealWords text="Proper Brier score," />{" "}
              <span className="italic text-seal-600">
                <RevealWords text="zero hedging." delay={0.15} />
              </span>
            </h2>
            <Reveal delay={0.25}>
              <p className="mt-5 text-[17px] leading-relaxed text-[var(--text-dim)]">
                The Brier scoring rule is strictly proper: honesty is the unique mathematically optimal strategy. No hedge or obfuscation beats stating your true probabilistic belief.
              </p>
            </Reveal>

            <Reveal delay={0.35}>
              <div className="mt-7 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--edge)] shadow-xs">
                {[
                  { k: "Mean Brier", v: "0.148" },
                  { k: "vs Baseline", v: "+40.8%" },
                  { k: "Calls Scored", v: "115" },
                ].map((s) => (
                  <div key={s.k} className="bg-cream-100 p-3.5 text-center">
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--text-faint)]">
                      {s.k}
                    </p>
                    <p className="tnum mt-1 font-display text-xl font-bold text-teal-800">
                      {s.v}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="rounded-2xl border border-[var(--edge)] bg-cream-100 p-5 text-teal-800 shadow-[var(--shadow-card)] sm:p-7">
              <CalibrationPlot bins={DEMO_BINS} size={420} className="w-full" />
              <div className="mt-3 flex items-center justify-center gap-3 font-mono text-[11px] text-[var(--text-faint)]">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-teal-700" /> Forecaster Calibration
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-0.5 w-3 bg-teal-800/30" /> Perfect Calibration
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function SealedDrops() {
  return (
    <section className="relative border-t border-[var(--edge)] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
          {/* The plate: a woman sealing a letter by candlelight, 1771. */}
          <Reveal>
            <figure className="relative mx-auto max-w-[380px]">
              <div
                aria-hidden
                className="absolute -inset-3 rotate-[-1.6deg] rounded-2xl border border-[var(--edge)] bg-cream-100"
              />
              <div className="duo relative rounded-xl border border-[var(--edge)] shadow-[var(--shadow-deep)]">
                <Image
                  src={waxseal}
                  alt="Eighteenth-century mezzotint of a woman sealing a letter by candlelight"
                  className="aspect-[3/4] object-cover object-top"
                  sizes="(min-width: 1024px) 380px, 85vw"
                />
              </div>
              <figcaption className="relative mt-4 text-center font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--text-faint)]">
                fig. 04 — the seal was always the business model · 1771
              </figcaption>
            </figure>
          </Reveal>

          <div>
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-seal-600">
                07 — Where this goes
              </p>
            </Reveal>
            <h2 className="mt-6 max-w-2xl font-display text-[clamp(2.2rem,4.6vw,3.7rem)] leading-[1.02] tracking-[-0.015em] text-teal-900">
              <RevealWords text="Sell the thesis now." />{" "}
              <span className="italic text-seal-600">
                <RevealWords text="Prove it later." delay={0.18} />
              </span>
            </h2>
            <Reveal delay={0.25}>
              <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-[var(--text-dim)]">
                Today, a supporter can already back a forecaster through the
                pool — a private transfer that nobody can map to either side.
                The next layer is sealed drops: a thesis encrypted to
                subscriber keys in the same action that commits the hash.
                Subscribers would read the full call immediately; everyone else
                waits for the reveal and sees it scored. Nobody could map who
                buys whose alpha, or copy-trade the copy-traders.
              </p>
            </Reveal>

            <Stagger className="mt-10 space-y-3">
              {[
                {
                  icon: Radio,
                  t: "Backed privately — live now",
                  d: "Supporting a forecaster is a private transfer inside the pool. No payer, no amount, no graph.",
                },
                {
                  icon: FileKey2,
                  t: "Encrypted at commit — next",
                  d: "The thesis sealed to subscriber keys in the same action that writes the hash.",
                },
                {
                  icon: Layers,
                  t: "Verified publicly — always",
                  d: "When a seal opens, the thesis is exactly what gets scored. Paid or not, the record is one.",
                },
              ].map((c) => (
                <StaggerItem key={c.t}>
                  <div className="flex gap-4 rounded-2xl border border-[var(--edge)] bg-cream-100 p-5 shadow-[var(--shadow-card)]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-seal-600 text-cream-100">
                      <c.icon size={15} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg leading-tight text-teal-900">
                        {c.t}
                      </h3>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--text-faint)]">
                        {c.d}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}

const SURFACES = [
  {
    icon: Boxes,
    t: "Anonymizer contract",
    d: "XenceVault implements privacy_invoke. The pool withdraws the bond to it, it parks the stake and returns an empty span — the protocol's own idiom for “credit nothing yet”.",
  },
  {
    icon: Layers,
    t: "Open notes",
    d: "Settlement credits an open note via the ${openNoteIds[0]} placeholder, because the payout cannot be known at proof time — the oracle has not been read yet.",
  },
  {
    icon: Radio,
    t: "Starknet Wallet API",
    d: "Every private action is one atomic strk20InvokeTransaction. Xence never sees a viewing key, never discovers a note, never generates a proof.",
  },
  {
    icon: KeyRound,
    t: "Signed pseudonyms",
    d: "A reputation key is a STARK-curve identity, authenticated on-chain by signature — so nobody can commit deliberately terrible calls under a rival's name.",
  },
  {
    icon: FileKey2,
    t: "Compliance path",
    d: "The pool's escrowed viewing key still applies. A forecaster can prove authorship of a past call to a regulator without opening anything else.",
  },
  {
    icon: Eye,
    t: "Leakage preflight",
    d: "Before you sign, the app tells you what the action will reveal — amount, timing, anonymity set — instead of implying it is all magic.",
  },
];

export function Stack() {
  return (
    <section className="relative border-t border-[var(--edge)] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-seal-600">
              09 — Built on STRK20
            </p>
          </Reveal>
          <h2 className="mt-6 font-display text-[clamp(2.2rem,4.6vw,3.7rem)] leading-[1.02] tracking-[-0.015em] text-teal-900">
            <RevealWords text="Six surfaces of the privacy stack," />{" "}
            <span className="italic text-seal-600">
              <RevealWords text="not a wrapper around one." delay={0.2} />
            </span>
          </h2>
        </div>

        <Stagger className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SURFACES.map((s) => (
            <StaggerItem key={s.t}>
              <div className="group h-full rounded-2xl border border-[var(--edge)] bg-cream-100 p-6 shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-deep)]">
                <s.icon
                  size={17}
                  className="text-teal-700 transition-transform duration-500 group-hover:-translate-y-0.5"
                />
                <h3 className="mt-4 font-display text-xl text-teal-900">{s.t}</h3>
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

export function CTA() {
  return (
    <section className="relative overflow-hidden">
      {/* the photograph is the section */}
      <div className="duo absolute inset-0">
        <Image
          src={horizon}
          alt="A calm sea horizon under early light"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      {/* deepen it into a dark room so cream type carries */}
      <div
        aria-hidden
        className="absolute inset-0 z-[3] bg-gradient-to-b from-teal-950/70 via-teal-900/40 to-teal-950/78"
      />

      {/* .on-teal is declared outside CSS layers, so its background-color outranks the. */}
      <div
        className="on-teal relative z-[4] py-24 sm:py-32"
        style={{ backgroundColor: "transparent" }}
      >
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,5.6vw,4.4rem)] leading-[1.0] tracking-[-0.02em] text-cream-50">
              <RevealWords text="Put a number on it." />
              <br />
              <span className="italic text-cream-200">
                <RevealWords text="Before anyone knows." delay={0.18} />
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mx-auto mt-7 max-w-xl text-[17px] leading-relaxed text-cream-100/85">
              Seal a forecast in under a minute. It costs a Bronze bond and it
              stays unreadable until you decide to open it.
            </p>
          </Reveal>
          <Reveal delay={0.42}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/app"
                className="btn-spring group inline-flex items-center gap-2 rounded-full bg-cream-200 px-7 py-4 font-medium text-teal-900 shadow-[var(--shadow-deep)] transition-all hover:-translate-y-0.5 hover:bg-cream-100"
              >
                Seal a forecast
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/leaderboard"
                className="btn-spring inline-flex items-center gap-2 rounded-full border border-cream-200/50 px-7 py-4 text-cream-100 backdrop-blur-sm transition-colors hover:border-cream-200 hover:bg-cream-200/10"
              >
                Browse the record
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="on-teal border-t border-[var(--edge)] !bg-teal-950 py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <XenceLogo
              size={24}
              accent="var(--color-cream-200)"
              className="text-cream-100"
            />
            <p className="mt-4 text-[13.5px] leading-relaxed text-[var(--text-faint)]">
              A private, stake-backed reputation layer for forecasts and the
              agents that make them. From{" "}
              <em className="font-display">prescience</em> — knowing before it
              happens.
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

        <p
          aria-hidden
          className="pointer-events-none mt-14 select-none bg-gradient-to-b from-cream-200/[0.10] to-transparent bg-clip-text text-center font-display text-[clamp(4rem,17vw,13rem)] leading-[0.8] tracking-[-0.02em] text-transparent"
        >
          XENCE
        </p>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--edge)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="https://github.com/AustinChris1/xence"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-[11px] text-[var(--text-faint)] transition-colors hover:text-cream-100"
          >
            <Code2 size={13} /> Read the contracts
            <ArrowUpRight size={11} />
          </a>
        </div>
      </div>
    </footer>
  );
}

/** A quiet band of recent sealed commitments — the teal ribbon on the paper. */
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
    <div className="on-teal relative overflow-hidden border-y border-[var(--edge)] py-3.5">
      <div className="flex w-max animate-marquee gap-8">
        {[...hashes, ...hashes].map((h, i) => (
          <span
            key={`${h}-${i}`}
            className="flex shrink-0 items-center gap-2.5 font-mono text-[11px] text-[var(--text-faint)]"
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-cream-300"
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
