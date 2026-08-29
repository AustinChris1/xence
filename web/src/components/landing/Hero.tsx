"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock } from "lucide-react";
import { XenceMark } from "@/components/brand/XenceMark";
import { StarknetLogo, StrkLogo, PragmaLogo, CairoLogo } from "@/components/brand/EcosystemLogos";
import lighthouse from "../../../public/img/hero-lighthouse.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 bg-[#fafbfc]">
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-8">
        
        {/* Left Column */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-800 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-600" />
            </span>
            <span>Starknet Mainnet · STRK20 Privacy Pool</span>
          </div>

          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.04] tracking-tight text-slate-950">
            Proof you were right, <br />
            <span className="text-teal-700 italic">
              before it happened.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 font-normal">
            Seal probabilistic forecasts into zero-knowledge vaults before market outcomes exist.
            Bond STRK privately through shielded notes, settle automatically via Pragma oracles, and build an unforgeable track record without leaking your alpha.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-slate-800 px-7 py-3.5 font-bold text-white text-sm shadow-md hover:shadow-lg transition-all"
            >
              <span>Seal a Forecast</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-6 py-3.5 font-semibold text-slate-800 text-sm shadow-2xs transition-all"
            >
              Explore Leaderboard
            </Link>
          </div>

          <div className="mt-12 border-t border-slate-200/80 pt-6">
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Built for Starknet forecasters
            </p>
            <div className="mt-3.5 flex flex-wrap items-center gap-6 text-slate-700 font-medium">
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <StarknetLogo size={16} className="text-teal-700" /> Starknet
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <StrkLogo size={16} className="text-teal-700" /> STRK20 Pool
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <PragmaLogo size={16} className="text-teal-700" /> Pragma Oracle
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <CairoLogo size={16} className="text-teal-700" /> Cairo VM
              </div>
            </div>
          </div>
        </div>

        {/* Right: Initial Lighthouse Artwork Plate */}
        <div className="relative mx-auto w-full max-w-[420px] lg:max-w-[460px]">
          <figure className="relative">
            <div className="aspect-[4/5] rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden bg-slate-950 relative">
              <Image
                src={lighthouse}
                alt="A lighthouse standing above a storm surge burying the sea wall around it"
                fill
                priority
                sizes="(min-width: 1024px) 460px, 90vw"
                className="object-cover opacity-95"
              />
            </div>

            {/* Floating Sealed Forecast Card */}
            <div className="absolute -bottom-6 -left-4 w-[250px] sm:-left-8 sm:w-[270px] rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-xl backdrop-blur-md transition-all">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-teal-800">
                    Sealed forecast
                  </p>
                  <p className="mt-1.5 text-base font-bold leading-tight text-slate-900">
                    BTC above $120,000
                  </p>
                  <p className="mt-1 font-mono text-[10.5px] text-slate-500">
                    resolves 30 Sep · Pragma
                  </p>
                </div>
                <XenceMark size={24} accent="#0f766e" alive />
              </div>

              <div className="my-3 border-t border-slate-100" />

              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500 font-semibold">
                  Probability
                </span>
                <span className="relative inline-block h-3.5 w-16 overflow-hidden rounded-sm bg-teal-100 border border-teal-200">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-300/60 to-transparent animate-shimmer" />
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500 font-semibold">
                  Bond Tier
                </span>
                <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-teal-800">
                  Gold · 50 STRK
                </span>
              </div>

              <p className="mt-3 flex items-center gap-1.5 text-[11px] leading-snug text-slate-500">
                <Lock size={11} className="shrink-0 text-teal-700" />
                Unreadable until the forecaster opens it.
              </p>
            </div>
          </figure>
        </div>

      </div>
    </section>
  );
}
