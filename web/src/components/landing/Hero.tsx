"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ArrowRight, Lock, ShieldCheck, Timer } from "lucide-react";
import { RevealWords, Reveal } from "@/components/ui/Reveal";
import { XenceMark } from "@/components/brand/XenceMark";
import lighthouse from "../../../public/img/hero-lighthouse.jpg";

/**
 * The hero. Paper ground, teal ink, and one photograph: a lighthouse standing
 * in a storm surge — the thing that was put there before the storm arrived.
 * The plate is arched like a lighthouse window, and the sealed-forecast chip
 * sits on the photo like a label on a specimen jar.
 */
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
      className="grain relative overflow-hidden pt-32 pb-16 sm:pt-36 lg:min-h-[100svh]"
    >
      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-8">
        <motion.div style={{ y: textY }}>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--edge-strong)] bg-cream-100/70 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-teal-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-600 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-600" />
              </span>
              Live on Starknet mainnet
            </span>
          </Reveal>

          <h1 className="mt-8 font-display text-[clamp(2.9rem,7.5vw,5.6rem)] leading-[0.96] tracking-[-0.02em] text-teal-900">
            <RevealWords text="Proof you were right," />
            <br />
            <span className="italic text-seal-600">
              <RevealWords text="before it happened." delay={0.18} />
            </span>
          </h1>

          <Reveal delay={0.35}>
            <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-[var(--text-dim)]">
              Anyone can say they called it after the fact. Xence makes the
              claim checkable: seal a probabilistic forecast{" "}
              <em className="font-display text-teal-700">
                before the outcome exists
              </em>
              , bond it privately through the STRK20 pool, and let the chain
              score your calibration when the answer arrives.
            </p>
          </Reveal>

          <Reveal delay={0.45}>
            <p className="mt-4 max-w-xl text-[17px] font-medium leading-relaxed text-teal-800">
              Your track record is public forever. Your wallet, your position
              size and your subscribers never are.
            </p>
          </Reveal>

          <Reveal delay={0.55}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/app"
                className="group inline-flex items-center gap-2 rounded-full bg-teal-700 px-6 py-3.5 font-medium text-cream-100 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-[var(--shadow-deep)]"
              >
                Seal your first forecast
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="#mechanism"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--edge-strong)] px-6 py-3.5 text-teal-800 transition-colors hover:border-teal-700 hover:bg-cream-100"
              >
                See the mechanism
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.7}>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--edge)] shadow-[var(--shadow-card)]">
              {[
                { icon: Lock, k: "Sealed", v: "Nothing readable until reveal" },
                {
                  icon: ShieldCheck,
                  k: "Bonded",
                  v: "Skin in the game, amount hidden",
                },
                { icon: Timer, k: "Scored", v: "Silence counts as wrong" },
              ].map(({ icon: Icon, k, v }) => (
                <div key={k} className="bg-cream-100 p-4">
                  <Icon size={15} className="text-seal-600" />
                  <dt className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-teal-700">
                    {k}
                  </dt>
                  <dd className="mt-1 text-[12.5px] leading-snug text-[var(--text-faint)]">
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
                className="arch absolute -inset-x-3 -top-3 bottom-3 rotate-[-2.2deg] border border-[var(--edge)] bg-cream-100"
              />
              <div
                aria-hidden
                className="arch absolute -inset-x-1.5 -top-1.5 bottom-1.5 rotate-[1.4deg] border border-[var(--edge)] bg-cream-300/70"
              />

              <div className="duo arch relative aspect-[4/5.1] shadow-[var(--shadow-deep)]">
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
                initial={reduced ? undefined : { opacity: 0, y: 24 }}
                animate={reduced ? undefined : { opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="on-teal absolute -bottom-8 -left-4 w-[240px] rounded-2xl border border-[var(--edge)] p-4 shadow-[var(--shadow-deep)] sm:-left-10 sm:w-[260px]"
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
                  <span className="sealed-edge inline-block h-3 w-14 rounded-sm opacity-80" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    Bond
                  </span>
                  <span className="rounded-full border border-cream-400/40 bg-cream-200/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-cream-200">
                    Gold
                  </span>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[10.5px] leading-snug text-[var(--text-faint)]">
                  <Lock size={10} className="shrink-0" />
                  Unreadable until the forecaster opens it.
                </p>
              </motion.div>

              <figcaption className="sr-only">
                Storm surge at Newhaven Lighthouse — the seal holds before the
                outcome is known.
              </figcaption>
            </figure>
          </Reveal>
        </motion.div>
      </div>
    </section>
  );
}
