"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ArrowRight, Lock, ShieldCheck, Timer } from "lucide-react";
import { RevealWords, Reveal } from "@/components/ui/Reveal";
import { XenceMark } from "@/components/brand/XenceMark";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const artY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 130]);
  const artOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 60]);

  return (
    <section
      ref={ref}
      className="grain relative min-h-[100svh] overflow-hidden pt-32 pb-20 sm:pt-40"
    >
      {/* Ground: drifting teal light behind a plot grid. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 grid-plot opacity-[0.55]" />
        <div className="absolute -top-1/3 left-1/2 h-[130vh] w-[130vh] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--color-teal-700)_0%,transparent_62%)] opacity-40 animate-drift" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[80vh] w-[80vh] rounded-full bg-[radial-gradient(circle,var(--color-teal-600)_0%,transparent_65%)] opacity-25" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ink-900 to-transparent" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
        <motion.div style={{ y: textY }}>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--edge-strong)] bg-ink-950/40 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-cream-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-300" />
              </span>
              Live on Starknet mainnet
            </span>
          </Reveal>

          <h1 className="mt-7 font-display text-[clamp(2.7rem,7vw,5.1rem)] leading-[0.97] tracking-[-0.02em] text-cream-50">
            <RevealWords text="Proof you were right," />
            <br />
            <span className="italic text-cream-200">
              <RevealWords text="before it happened." delay={0.18} />
            </span>
          </h1>

          <Reveal delay={0.35}>
            <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-[var(--text-dim)]">
              Anyone can say they called it after the fact. Xence makes the claim
              checkable: seal a probabilistic forecast{" "}
              <em className="font-display not-italic text-cream-100">
                before the outcome exists
              </em>
              , bond it privately through the STRK20 pool, and let the chain score
              your calibration when the answer arrives.
            </p>
          </Reveal>

          <Reveal delay={0.45}>
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-cream-200">
              Your track record is public forever. Your wallet, your position size
              and your paying subscribers never are.
            </p>
          </Reveal>

          <Reveal delay={0.55}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/app"
                className="group inline-flex items-center gap-2 rounded-full bg-cream-200 px-6 py-3.5 font-medium text-ink-900 transition-all hover:bg-cream-100 hover:shadow-[0_0_40px_-8px] hover:shadow-cream-200/40"
              >
                Seal your first forecast
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="#mechanism"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--edge-strong)] px-6 py-3.5 text-cream-100 transition-colors hover:border-cream-300 hover:bg-ink-850"
              >
                See the mechanism
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.7}>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-xl border border-[var(--edge)] bg-[var(--edge)]">
              {[
                { icon: Lock, k: "Sealed", v: "Nothing readable until reveal" },
                { icon: ShieldCheck, k: "Bonded", v: "Skin in the game, amount hidden" },
                { icon: Timer, k: "Scored", v: "Silence counts as wrong" },
              ].map(({ icon: Icon, k, v }) => (
                <div key={k} className="bg-ink-900/80 p-4">
                  <Icon size={15} className="text-teal-300" />
                  <dt className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-cream-300">
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

        {/* The sealed forecast, as an object you can almost pick up. */}
        <motion.div
          style={{ y: artY, opacity: artOpacity }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <SealedCard />
        </motion.div>
      </div>
    </section>
  );
}

function SealedCard() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 40, rotateX: 12 }}
      animate={reduced ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative [perspective:1400px]"
    >
      {/* Stacked ghosts: other sealed calls, unreadable. */}
      <div className="absolute inset-x-6 -top-5 h-full rounded-2xl border border-[var(--edge)] bg-ink-850/50" />
      <div className="absolute inset-x-3 -top-2.5 h-full rounded-2xl border border-[var(--edge)] bg-ink-850/70" />

      <div className="relative overflow-hidden rounded-2xl border border-[var(--edge-strong)] bg-gradient-to-br from-ink-850 to-ink-900 p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] sm:p-7">
        {/* Scanning light */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-teal-300/10 to-transparent animate-scan"
        />

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream-300">
              Sealed forecast
            </p>
            <p className="mt-2 font-display text-2xl leading-tight text-cream-50">
              BTC above $120,000
            </p>
            <p className="mt-1 font-mono text-[11px] text-[var(--text-faint)]">
              resolves 30 Sep · Pragma BTC/USD
            </p>
          </div>
          <XenceMark size={34} accent="var(--color-cream-200)" alive />
        </div>

        <div className="my-6 rule" />

        {/* The redacted core — what a sealed call looks like from outside. */}
        <div className="space-y-3">
          <Field label="Probability">
            <Redacted width="w-16" />
          </Field>
          <Field label="Thesis">
            <Redacted width="w-40" />
          </Field>
          <Field label="Bond">
            <span className="rounded-full border border-cream-400/40 bg-cream-200/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-cream-200">
              Gold tier
            </span>
          </Field>
          <Field label="Forecaster">
            <span className="font-mono text-[12px] text-cream-100">7F2A·4E91</span>
          </Field>
        </div>

        <div className="my-6 rule" />

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
            Commitment
          </p>
          <p className="mt-1.5 break-all font-mono text-[11px] leading-relaxed text-teal-300">
            0x04f1c9a7e2b8d306fa5417ce9b2d84e07c3a1f6b09d5e8724ac31b06f9e2d5a83
          </p>
        </div>

        <p className="mt-5 flex items-center gap-2 text-[12px] text-[var(--text-faint)]">
          <Lock size={12} className="shrink-0 text-cream-300" />
          On-chain since 14 Aug. Unreadable — including by us — until the
          forecaster opens it.
        </p>
      </div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
        {label}
      </span>
      {children}
    </div>
  );
}

function Redacted({ width }: { width: string }) {
  return (
    <span
      className={`sealed-edge inline-block h-3.5 rounded-sm ${width} opacity-70`}
      aria-label="sealed"
    />
  );
}
