"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { XenceMark } from "@/components/brand/XenceMark";
import { StarknetLogo, StrkLogo, PragmaLogo, CairoLogo, EthLogo } from "@/components/brand/EcosystemLogos";
import { Reveal, RevealWords } from "@/components/ui/Reveal";

const ORBIT_ITEMS = [
  {
    name: "Cairo",
    label: "Provable Smart Contracts",
    icon: CairoLogo,
    angle: 30, // top-right
    color: "bg-orange-500/10 text-orange-600 border-orange-200/60",
    glow: "rgba(249, 115, 22, 0.15)",
  },
  {
    name: "STRK20",
    label: "ZK Privacy Pool",
    icon: StrkLogo,
    angle: 105, // bottom-right
    color: "bg-teal-700/10 text-teal-700 border-teal-200/60",
    glow: "rgba(3, 83, 82, 0.15)",
  },
  {
    name: "Starknet",
    label: "STARK Validity Rollup",
    icon: StarknetLogo,
    angle: 180, // bottom-left
    color: "bg-indigo-600/10 text-indigo-700 border-indigo-200/60",
    glow: "rgba(79, 70, 229, 0.15)",
  },
  {
    name: "Pragma",
    label: "Decentralized Oracles",
    icon: PragmaLogo,
    angle: 250, // top-left
    color: "bg-purple-600/10 text-purple-700 border-purple-200/60",
    glow: "rgba(147, 51, 234, 0.15)",
  },
  {
    name: "Ready & Argent",
    label: "Privacy Wallets",
    icon: EthLogo,
    angle: 330, // top
    color: "bg-blue-600/10 text-blue-700 border-blue-200/60",
    glow: "rgba(37, 99, 235, 0.15)",
  },
];

export function EcosystemOrbit() {
  return (
    <section id="ecosystem" className="relative overflow-hidden py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-block font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-700">
              Integrations &amp; Ecosystem
            </span>
          </Reveal>

          <h2 className="mt-3 font-display text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.04] text-teal-950">
            <RevealWords text="Built on the Starknet" />{" "}
            <span className="italic text-teal-700">
              <RevealWords text="frontier." delay={0.16} />
            </span>
          </h2>

          <Reveal delay={0.25}>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-dim)]">
              Seamlessly interoperable with native Cairo contracts, STRK20 tokens, and top Starknet wallets.
            </p>
          </Reveal>

          <Reveal delay={0.35}>
            <Link
              href="/docs"
              className="mt-4 inline-flex items-center gap-1.5 font-medium text-[14px] text-teal-700 transition-colors hover:text-teal-900"
            >
              See all ecosystem integrations <ArrowUpRight size={14} />
            </Link>
          </Reveal>
        </div>

        {/* Orbit Visualization */}
        <div className="relative mx-auto mt-14 flex h-[480px] w-full max-w-[620px] items-center justify-center sm:h-[540px]">
          {/* Subtle glowing halo rings */}
          <div className="absolute h-[340px] w-[340px] rounded-full border border-dashed border-teal-700/25 sm:h-[420px] sm:w-[420px]" />
          <div className="absolute h-[240px] w-[240px] rounded-full border border-teal-700/15 sm:h-[280px] sm:w-[280px]" />
          <div className="absolute h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-teal-500/10 via-cream-300/20 to-teal-400/10 blur-2xl" />

          {/* Central Xence Node */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl border border-teal-700/30 bg-cream-100 shadow-[0_12px_36px_-6px_rgba(3,83,82,0.25)] sm:h-28 sm:w-28"
          >
            <XenceMark size={52} accent="var(--color-teal-700)" alive />
          </motion.div>

          {/* Orbiting Satellite Cards */}
          {ORBIT_ITEMS.map((item, i) => {
            const rad = (item.angle * Math.PI) / 180;
            // Radius on mobile vs desktop
            const r = 160;
            const x = Math.cos(rad) * r;
            const y = Math.sin(rad) * r;

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                className="absolute z-20 flex items-center gap-2.5 rounded-2xl border border-[var(--edge)] bg-cream-100/95 px-3.5 py-2.5 shadow-[0_8px_24px_-4px_rgba(3,83,82,0.12)] backdrop-blur-md transition-all hover:scale-105 hover:shadow-[0_12px_32px_-6px_rgba(3,83,82,0.2)]"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${item.color}`}>
                  <item.icon size={18} />
                </div>
                <div className="text-left">
                  <p className="font-display text-[14px] font-semibold text-teal-950">
                    {item.name}
                  </p>
                  <p className="font-mono text-[9.5px] uppercase tracking-wider text-[var(--text-faint)]">
                    {item.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
