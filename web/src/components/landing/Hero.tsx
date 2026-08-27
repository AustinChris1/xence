"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ArrowRight, Lock, ShieldCheck, Timer, Layers } from "lucide-react";
import { RevealWords, Reveal } from "@/components/ui/Reveal";
import { XenceMark } from "@/components/brand/XenceMark";
import { StarknetLogo, StrkLogo, PragmaLogo, CairoLogo } from "@/components/brand/EcosystemLogos";
import lighthouse from "../../../public/img/hero-lighthouse.jpg";

/** The hero. */
export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const plateY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 90]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 45]);

  return (
    <section
      ref={ref}
      className="grain relative overflow-hidden pt-32 pb-16 sm:pt-36 lg:min-h-[92svh]"
    >
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-8">
        <motion.div style={{ y: textY }}>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--edge-strong)] bg-cream-100/80 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-teal-700 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-600 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-600" />
              </span>
              Starknet Mainnet · STRK20 Privacy Pool
            </span>
          </Reveal>

          <h1 className="mt-7 font-display text-[clamp(2.9rem,7.2vw,5.4rem)] leading-[0.96] tracking-[-0.02em] text-teal-900">
            <RevealWords text="Proof you were right," />
            <br />
            <span className="italic text-seal-600">
              <RevealWords text="before it happened." delay={0.16} />
            </span>
          </h1>

          <Reveal delay={0.3}>
            <p className="mt-6 max-w-xl text-[18px] leading-relaxed font-normal text-[var(--text-dim)]">
              Seal probabilistic forecasts into zero-knowledge vaults before the outcome exists.
              Bond STRK privately, settle automatically via Pragma oracles, and build an unforgeable reputation.
            </p>
          </Reveal>

          <Reveal delay={0.45}>
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href="/app"
                className="btn-spring group inline-flex items-center gap-2 rounded-full bg-teal-700 px-6 py-3.5 font-medium text-cream-100 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-[var(--shadow-deep)]"
              >
                Launch App
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/leaderboard"
                className="btn-spring inline-flex items-center gap-2 rounded-full border border-[var(--edge-strong)] bg-cream-100/50 px-6 py-3.5 font-medium text-teal-900 transition-all hover:border-teal-700 hover:bg-cream-100"
              >
                Leaderboard
              </Link>
            </div>
          </Reveal>

          {/* Ecosystem badgestrip */}
          <Reveal delay={0.6}>
            <div className="mt-10 border-t border-[var(--edge)] pt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                Powered by native Starknet infrastructure
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-5 text-teal-900/80">
                <div className="flex items-center gap-1.5 font-mono text-[11.5px]">
                  <StarknetLogo size={16} className="text-teal-700" /> Starknet
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11.5px]">
                  <StrkLogo size={16} className="text-teal-700" /> STRK20 Pool
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11.5px]">
                  <PragmaLogo size={16} className="text-teal-700" /> Pragma Oracle
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11.5px]">
                  <CairoLogo size={16} className="text-teal-700" /> Cairo VM
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.7}>
            <dl className="mt-8 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--edge)] shadow-[var(--shadow-card)]">
              {[
                { icon: Lock, k: "Poseidon Hash", v: "Zero reveal before horizon" },
                {
                  icon: ShieldCheck,
                  k: "STRK20 Bond",
                  v: "Shielded skin-in-the-game",
                },
                { icon: Timer, k: "Brier Scored", v: "Strict mathematical audit" },
              ].map(({ icon: Icon, k, v }) => (
                <div key={k} className="card-hover bg-cream-100 p-3.5">
                  <Icon size={15} className="text-seal-600" />
                  <dt className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-teal-800">
                    {k}
                  </dt>
                  <dd className="mt-0.5 text-[11.5px] leading-tight text-[var(--text-faint)]">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </motion.div>

        {/* The plate. */}
        <motion.div
          style={{ y: plateY }}
          className="relative mx-auto w-full max-w-[420px] lg:max-w-[460px]"
        >
          <Reveal delay={0.25} y={36}>
            <figure className="relative">
              {/* deckled backing sheets */}
              <div
                aria-hidden
                className="arch absolute -inset-x-3 -top-3 bottom-3 rotate-[-2.2deg] border border-[var(--edge)] bg-cream-100 transition-transform duration-700 hover:rotate-[-3deg]"
              />
              <div
                aria-hidden
                className="arch absolute -inset-x-1.5 -top-1.5 bottom-1.5 rotate-[1.4deg] border border-[var(--edge)] bg-cream-300/70 transition-transform duration-700 hover:rotate-[2.2deg]"
              />

              <div className="duo arch relative aspect-[4/5.1] shadow-[var(--shadow-deep)] transition-transform duration-500 hover:scale-[1.01]">
                <Image
                  src={lighthouse}
                  alt="A lighthouse standing above a storm surge burying the sea wall around it"
                  fill
                  preload
                  sizes="(min-width: 1024px) 460px, 90vw"
                  className="object-cover"
                />
              </div>

              {/* the sealed-forecast label, pinned to the plate */}
              <motion.div
                initial={reduced ? undefined : { opacity: 0, y: 24, scale: 0.96 }}
                animate={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                whileHover={reduced ? undefined : { y: -4, transition: { duration: 0.25 } }}
                className="on-teal absolute -bottom-8 -left-4 w-[240px] rounded-2xl border border-[var(--edge)] p-4 shadow-[var(--shadow-deep)] backdrop-blur-lg transition-all sm:-left-10 sm:w-[260px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
                      Sealed forecast
                    </p>
                    <p className="mt-1.5 font-display text-[17px] leading-tight text-cream-100">
                      BTC above $120,000
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-[var(--text-faint)]">
                      resolves 30 Sep · Pragma
                    </p>
                  </div>
                  <XenceMark size={26} accent="var(--color-cream-200)" alive />
                </div>
                <div className="my-3 rule" />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    Probability
                  </span>
                  <span className="sealed-edge relative inline-block h-3.5 w-16 overflow-hidden rounded-sm bg-teal-950/80 opacity-90">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-cream-100/20 to-transparent animate-shimmer" />
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    Bond
                  </span>
                  <span className="badge-glow rounded-full border border-cream-400/40 bg-cream-200/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-cream-200 shadow-[0_0_8px_rgba(243,232,188,0.2)]">
                    Gold
                  </span>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[10.5px] leading-snug text-[var(--text-faint)]">
                  <Lock size={10} className="shrink-0 text-cream-200/70" />
                  Unreadable until the forecaster opens it.
                </p>
              </motion.div>

              <figcaption className="sr-only">
                Storm surge at Newhaven Lighthouse · the seal holds before the
                outcome is known.
              </figcaption>
            </figure>
          </Reveal>
        </motion.div>
      </div>
    </section>
  );
}
