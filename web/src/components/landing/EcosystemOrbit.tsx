"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { XenceMark } from "@/components/brand/XenceMark";
import { StarknetLogo, StrkLogo, PragmaLogo, CairoLogo, EthLogo } from "@/components/brand/EcosystemLogos";

const ORBIT_ITEMS = [
  {
    name: "Cairo",
    label: "Provable Smart Contracts",
    icon: CairoLogo,
    angle: 30,
    color: "bg-orange-50 text-orange-600 border-orange-200",
  },
  {
    name: "STRK20",
    label: "ZK Privacy Pool",
    icon: StrkLogo,
    angle: 105,
    color: "bg-teal-50 text-teal-700 border-teal-200",
  },
  {
    name: "Starknet",
    label: "STARK Rollup",
    icon: StarknetLogo,
    angle: 180,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    name: "Pragma",
    label: "Decentralized Oracles",
    icon: PragmaLogo,
    angle: 250,
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    name: "Argent & Braavos",
    label: "Privacy Wallets",
    icon: EthLogo,
    angle: 330,
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
];

export function EcosystemOrbit() {
  return (
    <section id="ecosystem" className="page section-tight text-center">
      <div>
        <span className="eyebrow">Integrations &amp; Ecosystem</span>
        <h2 className="head max-w-xl mx-auto">
          Built on the Starknet <em>frontier.</em>
        </h2>
        <p className="lede max-w-xl mx-auto mt-3">
          Seamlessly interoperable with native Cairo contracts, STRK20 tokens, and top Starknet wallets.
        </p>
        <Link
          href="/docs"
          className="mt-4 inline-flex items-center gap-1.5 font-semibold text-[13.5px] text-[var(--accent)] hover:underline"
        >
          <span>See all ecosystem integrations</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* Orbit Visualization */}
      <div className="relative mx-auto mt-12 flex h-[460px] w-full max-w-[580px] items-center justify-center">
        {/* Subtle glowing halo rings */}
        <div className="absolute h-[340px] w-[340px] rounded-full border border-dashed border-teal-700/20 sm:h-[380px] sm:w-[380px]" />
        <div className="absolute h-[220px] w-[220px] rounded-full border border-teal-700/10 sm:h-[260px] sm:w-[260px]" />
        <div className="absolute h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-teal-100/50 via-emerald-50/40 to-cyan-100/40 blur-2xl pointer-events-none" />

        {/* Central Xence Node */}
        <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl border border-teal-200 bg-white shadow-xl sm:h-28 sm:w-28">
          <XenceMark size={50} accent="#9a5b09" alive />
        </div>

        {/* Orbiting Satellite Cards */}
        {ORBIT_ITEMS.map((item) => {
          const rad = (item.angle * Math.PI) / 180;
          const r = 150;
          const x = Math.cos(rad) * r;
          const y = Math.sin(rad) * r;

          return (
            <div
              key={item.name}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
              className="absolute z-20 flex items-center gap-2.5 rounded-2xl border border-[var(--hairline)] bg-white/95 px-3.5 py-2.5 shadow-md backdrop-blur-md transition-all hover:scale-105"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl border ${item.color}`}>
                <item.icon size={16} />
              </div>
              <div className="text-left">
                <p className="text-[13.5px] font-bold text-slate-900 leading-tight">
                  {item.name}
                </p>
                <p className="font-mono text-[9.5px] uppercase tracking-wider text-slate-400">
                  {item.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
