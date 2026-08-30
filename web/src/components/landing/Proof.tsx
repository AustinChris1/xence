"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock, EyeOff, CheckCircle2, Radio, FileKey2, Layers } from "lucide-react";
import { XenceLogo } from "@/components/brand/XenceMark";
import waxseal from "../../../public/img/wax-seal.jpg";

export function Privacy() {
  return (
    <section id="privacy" className="py-20 sm:py-28 bg-[#fafbfc] border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        
        <div className="max-w-2xl">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-700">
            04 · Privacy Matrix
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
            Public record. <br />
            <span className="text-teal-700 italic">
              Private book.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Everything needed to mathematically verify a forecaster is transparent on-chain. Everything that would reveal your book, wallet, or position size stays dark.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
              <Lock size={18} />
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-950">The Blockchain</h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed font-normal">
              Sees only a Poseidon hash digest and the resolution date. Never your thesis, your wallet address, or your pool balance.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
              <EyeOff size={18} />
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-950">This Website</h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed font-normal">
              Sees nothing. The secret 256-bit salt is generated locally in your browser memory and never transmitted over the wire.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
              <CheckCircle2 size={18} />
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-950">Anyone on Starknet</h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed font-normal">
              Can mathematically audit your Brier calibration curve and public track record once you reveal your pre-image.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}

export function SealedDrops() {
  return (
    <section className="relative border-t border-slate-200/80 py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
          
          <figure className="relative mx-auto w-full max-w-[380px]">
            <div className="aspect-[3/4] rounded-3xl border border-slate-200 shadow-xl overflow-hidden bg-slate-900 relative">
              <Image
                src={waxseal}
                alt="Eighteenth-century mezzotint of a woman sealing a letter by candlelight"
                fill
                className="object-cover opacity-95"
                sizes="(min-width: 1024px) 380px, 85vw"
              />
            </div>
            <figcaption className="relative mt-4 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium">
              fig. 04 · the seal was always the business model · 1771
            </figcaption>
          </figure>

          <div>
            <span className="font-mono text-[11.5px] font-bold uppercase tracking-[0.22em] text-teal-700">
              05 · Economic Horizon
            </span>
            <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.02] tracking-tight text-slate-950">
              Sell the thesis now. <br />
              <span className="text-teal-700 italic">
                Prove it later.
              </span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 font-normal">
              Today, a supporter can already back a forecaster through the pool, a private transfer that nobody can map to either side. The next layer is sealed drops: a thesis encrypted to subscriber keys in the same action that commits the hash.
            </p>

            <div className="mt-10 space-y-3.5">
              {[
                {
                  icon: Radio,
                  t: "Backed privately · live now",
                  d: "Supporting a forecaster is a private transfer inside the STRK20 pool. No payer, no amount, no graph.",
                },
                {
                  icon: FileKey2,
                  t: "Encrypted at commit · next phase",
                  d: "The thesis sealed to subscriber keys in the same action that writes the Poseidon hash.",
                },
                {
                  icon: Layers,
                  t: "Verified publicly · always",
                  d: "When a seal opens, the thesis is exactly what gets scored. Paid or not, the record is immutable.",
                },
              ].map((c) => (
                <div key={c.t} className="flex gap-4.5 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-2xs">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800 border border-teal-200">
                    <c.icon size={19} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-950">
                      {c.t}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
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

export function CTA() {
  return (
    <section className="border-t border-slate-200/80 py-24 sm:py-28 bg-[#fafbfc]">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
        <h2 className="text-3xl sm:text-5xl font-extrabold leading-[1.04] tracking-tight text-slate-950">
          Put a number on it. <br />
          <span className="text-teal-700 italic">
            Before anyone knows.
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
          Seal a forecast in under a minute. It costs a Bronze bond and stays unreadable until you decide to open it.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/app"
            className="btn-spring btn-shine btn-lift inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-slate-800 px-8 py-4 font-bold text-white text-sm shadow-md hover:shadow-lg transition-all"
          >
            <span>Seal a forecast</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/leaderboard"
            className="btn-spring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-7 py-4 font-semibold text-slate-800 text-sm shadow-2xs transition-colors"
          >
            Browse the record
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-14">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <XenceLogo size={24} accent="#9a5b09" className="text-slate-900" />
          <span className="text-xs font-mono text-slate-500">
            Starknet Mainnet · STRK20 Privacy Pool
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm font-medium text-slate-600">
          <Link href="/#problem" className="hover:text-slate-950">Problem</Link>
          <Link href="/#mechanism" className="hover:text-slate-950">Architecture</Link>
          <Link href="/#privacy" className="hover:text-slate-950">Privacy</Link>
          <Link href="/leaderboard" className="hover:text-slate-950">Leaderboard</Link>
          <Link href="/docs" className="hover:text-slate-950">Docs</Link>
          <a
            href="https://github.com/AustinChris1/xence"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-950"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

export function SealTicker() {
  return null;
}
export function FAQ() {
  return null;
}
