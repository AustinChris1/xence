"use client";

import Image from "next/image";
import { EyeOff, TrendingUp, Ban, ShieldAlert } from "lucide-react";
import observatory from "../../../public/img/observatory.jpg";

export function Problem() {
  return (
    <section id="problem" className="py-20 sm:py-28 border-t border-slate-200/80 bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          
          {/* Observatory Artwork */}
          <figure className="relative mx-auto w-full max-w-[380px]">
            <div className="aspect-[3/4] rounded-3xl border border-slate-200 shadow-xl overflow-hidden bg-slate-900 relative">
              <Image
                src={observatory}
                alt="Eighteenth-century mezzotint of astronomers in an observatory"
                fill
                className="object-cover opacity-95"
                sizes="(min-width: 1024px) 380px, 85vw"
              />
            </div>
            <figcaption className="relative mt-4 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium">
              fig. 01 — observing the sky before the storm breaks · 1782
            </figcaption>
          </figure>

          {/* Problem Narrative */}
          <div>
            <span className="font-mono text-[11.5px] font-bold uppercase tracking-[0.22em] text-teal-700">
              01 · The Problem
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-950">
              Crypto alpha runs on <br />
              <span className="text-teal-700 italic">
                deleted evidence.
              </span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600 font-normal">
              Wins get screenshotted and pinned. Losses get silently wiped. Without cryptographic commitments, track records are just selective marketing reels.
            </p>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start gap-3.5">
                <ShieldAlert size={20} className="mt-0.5 shrink-0 text-teal-700" />
                <div className="text-sm leading-relaxed text-slate-700">
                  <strong className="text-slate-950 font-bold">The Core Dilemma:</strong> Public calls leak your trade to copycats before you fill. Private calls can be silently deleted when wrong.
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 shadow-2xs">
                <div className="flex items-center gap-2.5 text-teal-800 font-bold text-base">
                  <TrendingUp size={18} /> Public Accountability
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Commitment hash and bond tier are permanently anchored on Starknet. No post-hoc edits are possible.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 shadow-2xs">
                <div className="flex items-center gap-2.5 text-indigo-700 font-bold text-base">
                  <EyeOff size={18} /> Zero Alpha Leak
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Your exact probability percentage and research thesis stay 100% encrypted until you reveal.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export function Forfeit() {
  return (
    <section id="forfeit" className="py-20 sm:py-28 border-t border-slate-200/80 bg-[#fafbfc]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <span className="font-mono text-[11.5px] font-bold uppercase tracking-[0.22em] text-teal-700">
            02 · Anti-Gaming Mechanism
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-950">
            Silence is scored as <br />
            <span className="text-rose-600">
              a maximum forfeit.
            </span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-600 font-normal">
            To prevent selective revealing (showing winners and quietly abandoning losers), any unrevealed forecast automatically scores the maximum Brier penalty (1.00) and slashes the bond.
          </p>

          <div className="mt-7 flex items-center gap-4 rounded-2xl border border-rose-200 bg-rose-50/70 p-5">
            <Ban size={22} className="shrink-0 text-rose-600" />
            <p className="text-sm font-medium text-slate-800">
              Being wrong out loud costs little. Going quiet destroys your on-chain reputation score permanently.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
