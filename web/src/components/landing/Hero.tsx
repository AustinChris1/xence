"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock } from "lucide-react";
import { XenceMark } from "@/components/brand/XenceMark";
import { StarknetLogo, StrkLogo, PragmaLogo, CairoLogo } from "@/components/brand/EcosystemLogos";
import lighthouse from "../../../public/img/hero-lighthouse.jpg";

export function Hero() {
  return (
    <section className="grain relative overflow-hidden pt-32 pb-16 sm:pt-36 lg:min-h-[92svh]">
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/[0.08] px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
            </span>
            Private forecasts, public receipts
          </span>

          <h1 className="mt-7 text-[clamp(2.9rem,7.2vw,5.4rem)] font-extrabold leading-[0.96] tracking-[-0.02em] text-white">
            Make the call now.
            <br />
            <span className="bg-gradient-to-r from-teal-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              Prove it later.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[17.5px] leading-relaxed font-normal text-slate-300">
            Xence lets forecasters lock in a prediction before the outcome exists,
            then reveal the exact call when it is time to be scored.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/app"
              className="btn-spring group inline-flex items-center gap-2 rounded-2xl bg-teal-300 px-7 py-4 font-bold text-slate-950 shadow-[0_12px_30px_rgba(45,212,191,0.22)] transition-all hover:bg-teal-200 hover:shadow-[0_16px_34px_rgba(45,212,191,0.26)]"
            >
              Launch App
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/leaderboard"
              className="btn-spring inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.035] px-6 py-4 font-semibold text-slate-200 backdrop-blur-md transition-all hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
            >
              Leaderboard
            </Link>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Built for Starknet forecasters
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-5 text-slate-300">
              <div className="flex items-center gap-1.5 font-mono text-[11.5px]">
                <StarknetLogo size={16} className="text-teal-400" /> Starknet
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11.5px]">
                <StrkLogo size={16} className="text-teal-400" /> Private bond
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11.5px]">
                <PragmaLogo size={16} className="text-teal-400" /> Oracle settled
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11.5px]">
                <CairoLogo size={16} className="text-teal-400" /> On-chain score
              </div>
            </div>
          </div>

        </div>

        <div className="relative mx-auto w-full max-w-[420px] lg:max-w-[460px]">
          <figure className="relative">
            <div
              aria-hidden
              className="arch absolute -inset-x-3 -top-3 bottom-3 rotate-[-2.2deg] border border-teal-500/15 bg-teal-500/[0.04] blur-xs"
            />
            <div
              aria-hidden
              className="arch absolute -inset-x-1.5 -top-1.5 bottom-1.5 rotate-[1.4deg] border border-teal-400/15 bg-slate-900/50"
            />

            <div className="duo arch relative aspect-[4/5.1] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
              <Image
                src={lighthouse}
                alt="A lighthouse standing above a storm surge burying the sea wall around it"
                fill
                priority
                sizes="(min-width: 1024px) 460px, 90vw"
                className="object-cover"
              />
            </div>

            <div className="absolute -bottom-8 -left-4 w-[250px] rounded-2xl border border-white/15 bg-[#070d18]/90 p-4.5 shadow-[0_16px_40px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-all sm:-left-10 sm:w-[270px]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-teal-400">
                    Sealed forecast
                  </p>
                  <p className="mt-1.5 text-[17px] font-bold leading-tight text-white">
                    BTC above $120,000
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-slate-400">
                    resolves 30 Sep · Pragma
                  </p>
                </div>
                <XenceMark size={26} accent="#2dd4bf" alive />
              </div>
              <div className="my-3 rule" />
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400">
                  Probability
                </span>
                <span className="sealed-edge relative inline-block h-3.5 w-16 overflow-hidden rounded-sm bg-teal-950/80 opacity-90">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-300/30 to-transparent animate-shimmer" />
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400">
                  Bond
                </span>
                <span className="rounded-full border border-teal-400/35 bg-teal-500/[0.16] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-teal-300">
                  Gold
                </span>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[10.5px] leading-snug text-slate-400">
                <Lock size={10} className="shrink-0 text-teal-400" />
                Unreadable until the forecaster opens it.
              </p>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
