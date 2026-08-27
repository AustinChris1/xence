"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock, ShieldCheck, Timer } from "lucide-react";
import { XenceMark } from "@/components/brand/XenceMark";
import { StarknetLogo, StrkLogo, PragmaLogo, CairoLogo } from "@/components/brand/EcosystemLogos";
import lighthouse from "../../../public/img/hero-lighthouse.jpg";

export function Hero() {
  return (
    <section className="grain relative overflow-hidden pt-32 pb-16 sm:pt-36 lg:min-h-[92svh]">
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
            </span>
            Starknet Mainnet · STRK20 Privacy Pool
          </span>

          <h1 className="mt-7 text-[clamp(2.9rem,7.2vw,5.4rem)] font-extrabold leading-[0.96] tracking-[-0.02em] text-white">
            Proof you were right,
            <br />
            <span className="bg-gradient-to-r from-teal-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              before it happened.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[17.5px] leading-relaxed font-normal text-slate-300">
            Seal probabilistic forecasts into zero-knowledge vaults before the outcome exists.
            Bond STRK privately, settle automatically via Pragma oracles, and build an unforgeable reputation.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/app"
              className="btn-spring group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 to-teal-500 px-7 py-4 font-bold text-slate-950 shadow-[0_0_25px_rgba(45,212,191,0.4)] transition-all hover:shadow-[0_0_35px_rgba(45,212,191,0.6)]"
            >
              Launch App
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/leaderboard"
              className="btn-spring inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-4 font-semibold text-slate-200 backdrop-blur-md transition-all hover:border-teal-400/40 hover:bg-white/[0.08] hover:text-white"
            >
              Leaderboard
            </Link>
          </div>

          {/* Ecosystem badgestrip */}
          <div className="mt-10 border-t border-white/10 pt-6">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Powered by native Starknet infrastructure
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-5 text-slate-300">
              <div className="flex items-center gap-1.5 font-mono text-[11.5px]">
                <StarknetLogo size={16} className="text-teal-400" /> Starknet
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11.5px]">
                <StrkLogo size={16} className="text-teal-400" /> STRK20 Pool
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11.5px]">
                <PragmaLogo size={16} className="text-teal-400" /> Pragma Oracle
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11.5px]">
                <CairoLogo size={16} className="text-teal-400" /> Cairo VM
              </div>
            </div>
          </div>

          <dl className="mt-8 grid max-w-lg grid-cols-3 gap-5 border-t border-white/10 pt-5 sm:gap-7">
            {[
              { icon: Lock, k: "Poseidon Hash", v: "Zero reveal before horizon" },
              {
                icon: ShieldCheck,
                k: "STRK20 Bond",
                v: "Shielded skin-in-the-game",
              },
              { icon: Timer, k: "Brier Scored", v: "Strict mathematical audit" },
            ].map(({ icon: Icon, k, v }) => (
              <div key={k} className="rounded-xl border border-white/5 bg-slate-900/40 p-3 backdrop-blur-md">
                <Icon size={16} className="text-teal-400" />
                <dt className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200">
                  {k}
                </dt>
                <dd className="mt-0.5 text-[11.5px] leading-tight text-slate-400">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* The Visual Plate */}
        <div className="relative mx-auto w-full max-w-[420px] lg:max-w-[460px]">
          <figure className="relative">
            <div
              aria-hidden
              className="arch absolute -inset-x-3 -top-3 bottom-3 rotate-[-2.2deg] border border-teal-500/20 bg-teal-500/5 blur-xs"
            />
            <div
              aria-hidden
              className="arch absolute -inset-x-1.5 -top-1.5 bottom-1.5 rotate-[1.4deg] border border-teal-400/20 bg-slate-900/60 shadow-[0_0_30px_rgba(20,184,166,0.15)]"
            />

            <div className="duo arch relative aspect-[4/5.1] shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10">
              <Image
                src={lighthouse}
                alt="A lighthouse standing above a storm surge burying the sea wall around it"
                fill
                priority
                sizes="(min-width: 1024px) 460px, 90vw"
                className="object-cover"
              />
            </div>

            {/* The sealed-forecast HUD label */}
            <div className="absolute -bottom-8 -left-4 w-[250px] rounded-2xl border border-white/15 bg-[#070d18]/90 p-4.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all sm:-left-10 sm:w-[270px]">
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
                <span className="rounded-full border border-teal-400/40 bg-teal-500/20 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-teal-300 shadow-[0_0_10px_rgba(45,212,191,0.4)]">
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
