"use client";

import Link from "next/link";
import Image from "next/image";
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
import { CalibrationPlot } from "@/components/art/CalibrationPlot";
import { XenceLogo } from "@/components/brand/XenceMark";
import type { CalibrationBin } from "@/lib/scoring";
import waxseal from "../../../public/img/wax-seal.jpg";
import horizon from "../../../public/img/storm-horizon.jpg";

const HIDDEN = [
  "The wallet that funded the bond",
  "Your probability and thesis, until you reveal",
  "Who signed the transaction",
  "Every other position you hold",
];

const VISIBLE = [
  "That a forecast was sealed, and exactly when",
  "The question and its resolution date",
  "The full call, permanently, once revealed",
  "Your calibration curve and score history",
];

export function Privacy() {
  return (
    <section id="privacy" className="relative py-20 sm:py-28 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-400">
            04 · What is public
          </p>
          <h2 className="mt-4 text-[clamp(2.2rem,4.2vw,3.6rem)] font-bold leading-[1.02] tracking-tight text-white">
            Public record.{" "}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
              Private book.
            </span>
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-slate-300">
            Enough is on-chain to verify a forecaster. Nothing on-chain reveals
            their book.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="h-full rounded-3xl border border-teal-500/30 bg-slate-900/70 p-8 shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all hover:border-teal-500/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <EyeOff size={18} />
              </div>
              <h3 className="text-2xl font-bold text-white">Hidden</h3>
            </div>
            <ul className="mt-6 space-y-3.5">
              {HIDDEN.map((h) => (
                <li key={h} className="flex items-center gap-3 text-[14.5px] text-slate-300">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-full rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all hover:border-white/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Eye size={18} />
              </div>
              <h3 className="text-2xl font-bold text-white">Public</h3>
            </div>
            <ul className="mt-6 space-y-3.5">
              {VISIBLE.map((v) => (
                <li key={v} className="flex items-center gap-3 text-[14.5px] text-slate-300">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
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
    <section className="relative border-t border-white/10 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-400">
              05 · Evaluation
            </p>
            <h2 className="mt-4 text-[clamp(2.2rem,4.2vw,3.6rem)] font-bold leading-[1.02] tracking-tight text-white">
              Hedging{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                never wins.
              </span>
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-slate-300">
              Playing it safe with vague numbers scores worse, every time. The
              only way to win is to say what you actually believe.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-xs">
              {[
                { k: "Mean score", v: "0.148" },
                { k: "vs baseline", v: "+40.8%" },
                { k: "Calls scored", v: "115" },
              ].map((s) => (
                <div key={s.k} className="bg-[#0b1322] p-4 text-center">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {s.k}
                  </p>
                  <p className="tnum mt-1.5 text-2xl font-bold text-teal-300 font-mono">
                    {s.v}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-white shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-8">
            <CalibrationPlot bins={DEMO_BINS} size={420} className="w-full" />
            <div className="mt-4 flex items-center justify-center gap-6 font-mono text-[11.5px] text-slate-400">
              <span className="flex items-center gap-1.5 text-teal-300">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]" /> This forecaster
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="h-0.5 w-4 bg-white/40" /> Perfect
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SealedDrops() {
  return (
    <section className="relative border-t border-white/10 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
          <figure className="relative mx-auto max-w-[380px]">
            <div
              aria-hidden
              className="absolute -inset-3 rotate-[-1.5deg] rounded-3xl border border-teal-500/20 bg-teal-500/5 blur-xs"
            />
            <div className="duo relative rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
              <Image
                src={waxseal}
                alt="Eighteenth-century mezzotint of a woman sealing a letter by candlelight"
                className="aspect-[3/4] object-cover object-top"
                sizes="(min-width: 1024px) 380px, 85vw"
              />
            </div>
            <figcaption className="relative mt-4 text-center font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-400">
              fig. 04 — the seal was always the business model · 1771
            </figcaption>
          </figure>

          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-400">
              07 · Where this goes
            </p>
            <h2 className="mt-4 max-w-2xl text-[clamp(2.2rem,4.6vw,3.7rem)] font-bold leading-[1.02] tracking-tight text-white">
              Sell the thesis now.{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                Prove it later.
              </span>
            </h2>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-slate-300">
              Today, a supporter can already back a forecaster through the
              pool, a private transfer that nobody can map to either side.
              The next layer is sealed drops: a thesis encrypted to
              subscriber keys in the same action that commits the hash.
              Subscribers would read the full call immediately; everyone else
              waits for the reveal and sees it scored. Nobody could map who
              buys whose alpha, or copy-trade the copy-traders.
            </p>

            <div className="mt-10 space-y-3.5">
              {[
                {
                  icon: Radio,
                  t: "Backed privately · live now",
                  d: "Supporting a forecaster is a private transfer inside the pool. No payer, no amount, no graph.",
                },
                {
                  icon: FileKey2,
                  t: "Encrypted at commit · next",
                  d: "The thesis sealed to subscriber keys in the same action that writes the hash.",
                },
                {
                  icon: Layers,
                  t: "Verified publicly · always",
                  d: "When a seal opens, the thesis is exactly what gets scored. Paid or not, the record is one.",
                },
              ].map((c) => (
                <div key={c.t} className="flex gap-4.5 rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    <c.icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-tight text-white">
                      {c.t}
                    </h3>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-slate-400">
                      {c.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
    d: "XenceVault implements privacy_invoke. The pool withdraws the bond to it, it parks the stake and returns an empty span, the protocol's own idiom for “credit nothing yet”.",
  },
  {
    icon: Layers,
    t: "Open notes",
    d: "Settlement credits an open note via the placeholder, because the payout cannot be known at proof time: the oracle has not been read yet.",
  },
  {
    icon: Radio,
    t: "Starknet Wallet API",
    d: "Every private action is one atomic strk20InvokeTransaction. Xence never sees a viewing key, never discovers a note.",
  },
  {
    icon: KeyRound,
    t: "Signed pseudonyms",
    d: "A reputation key is a STARK-curve identity, authenticated on-chain by signature.",
  },
  {
    icon: FileKey2,
    t: "Compliance path",
    d: "The pool's escrowed viewing key still applies. A forecaster can prove authorship of a past call to a regulator.",
  },
  {
    icon: Eye,
    t: "Leakage preflight",
    d: "Before you sign, the app tells you what the action will reveal instead of implying it is magic.",
  },
];

export function Stack() {
  return (
    <section className="relative border-t border-white/10 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-400">
            08 · Built on STRK20
          </p>
          <h2 className="mt-4 text-[clamp(2.2rem,4.6vw,3.7rem)] font-bold leading-[1.02] tracking-tight text-white">
            Six surfaces of the privacy stack,
            <span className="block text-slate-400">not a wrapper around one.</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SURFACES.map((s) => (
            <div key={s.t} className="group h-full rounded-3xl border border-white/10 bg-slate-900/60 p-7 shadow-[0_12px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/40 hover:shadow-[0_16px_40px_rgba(45,212,191,0.15)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30">
                <s.icon size={19} />
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">{s.t}</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-slate-300">
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTA() {
  return (
    <section className="relative overflow-hidden border-t border-white/10">
      <div className="duo absolute inset-0">
        <Image
          src={horizon}
          alt="A calm sea horizon under early light"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 z-[3] bg-gradient-to-b from-[#05080f]/90 via-[#05080f]/80 to-[#05080f]/95"
      />

      <div
        className="relative z-[4] py-24 sm:py-32"
        style={{ backgroundColor: "transparent" }}
      >
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="text-[clamp(2.4rem,5.6vw,4.6rem)] font-extrabold leading-[1.0] tracking-tight text-white">
            Put a number on it.
            <span className="block text-teal-400 font-semibold">Before anyone knows.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-[17px] leading-relaxed text-slate-300">
            Seal a forecast in under a minute. It costs a Bronze bond and it
            stays unreadable until you decide to open it.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/app"
              className="btn-spring group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-teal-400 to-teal-500 px-8 py-4.5 font-semibold text-slate-950 shadow-[0_0_30px_rgba(45,212,191,0.4)] transition-all hover:shadow-[0_0_40px_rgba(45,212,191,0.6)] hover:scale-[1.02]"
            >
              Seal a forecast
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1 text-slate-950"
              />
            </Link>
            <Link
              href="/leaderboard"
              className="btn-spring inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-7 py-4.5 font-medium text-slate-200 backdrop-blur-md transition-colors hover:border-teal-400/50 hover:bg-white/[0.08] hover:text-white"
            >
              Browse the record
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#02050b] py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <XenceLogo
              size={26}
              accent="#2dd4bf"
              className="text-white"
            />
            <p className="mt-4 text-[14px] leading-relaxed text-slate-400">
              A private, stake-backed reputation layer for forecasts and the
              agents that make them. From{" "}
              <em className="font-semibold text-teal-300 not-italic">prescience</em> — knowing before it
              happens.
            </p>
            <p className="mt-4 font-mono text-[11px] text-slate-500">
              Built for the STRK20 Private Sprint · Starknet mainnet
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-400">
                Product
              </p>
              <ul className="mt-4 space-y-2.5 text-[14px]">
                {[
                  { h: "/app", l: "Seal a forecast" },
                  { h: "/leaderboard", l: "Leaderboard" },
                  { h: "/#mechanism", l: "How it works" },
                  { h: "/#privacy", l: "What stays private" },
                ].map((x) => (
                  <li key={x.h}>
                    <Link
                      href={x.h}
                      className="text-slate-400 transition-colors hover:text-white"
                    >
                      {x.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-400">
                Built on
              </p>
              <ul className="mt-4 space-y-2.5 text-[14px]">
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
                      className="text-slate-400 transition-colors hover:text-white"
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
          className="pointer-events-none mt-14 select-none bg-gradient-to-b from-white/[0.08] to-transparent bg-clip-text text-center font-extrabold text-[clamp(4rem,17vw,13rem)] leading-[0.8] tracking-tight text-transparent"
        >
          XENCE
        </p>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-slate-500">
            Apache-2.0 · Starknet Native
          </p>
          <a
            href="https://github.com/AustinChris1/xence"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-[11px] text-slate-400 transition-colors hover:text-teal-300"
          >
            <Code2 size={13} /> Read the contracts
            <ArrowUpRight size={11} />
          </a>
        </div>
      </div>
    </footer>
  );
}

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
    <div className="relative overflow-hidden border-y border-white/10 bg-[#03060c] py-3.5">
      <div className="flex w-max animate-marquee gap-8">
        {[...hashes, ...hashes].map((h, i) => (
          <span
            key={`${h}-${i}`}
            className="flex shrink-0 items-center gap-2.5 font-mono text-[11px] text-slate-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.8)]" />
            sealed {h}…
          </span>
        ))}
      </div>
    </div>
  );
}
