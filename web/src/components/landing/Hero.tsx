"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Lock } from "lucide-react";
import { XenceMark } from "@/components/brand/XenceMark";
import lighthouse from "../../../public/img/hero-lighthouse.jpg";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduced = useReducedMotion();
  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: EASE },
        };

  return (
    <section className="relative overflow-hidden bg-[#fbfaf7] pt-28 pb-20 sm:pt-32 sm:pb-28">
      {/* a warm bloom behind the plate, so the right side has weight */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-24 h-[46rem] w-[46rem] rounded-full bg-[radial-gradient(circle,rgba(245,179,35,0.16)_0%,transparent_62%)]"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
        <div>
          <motion.p
            {...rise(0)}
            className="font-mono text-[11px] uppercase tracking-[0.3em] text-teal-700"
          >
            The private signal economy
          </motion.p>

          <motion.h1
            {...rise(0.08)}
            className="mt-5 text-[clamp(2.6rem,6vw,4.4rem)] font-extrabold leading-[0.98] tracking-[-0.03em] text-stone-950"
          >
            Proof you were right,
            <span className="mt-1 block italic font-medium text-teal-700">
              before it happened.
            </span>
          </motion.h1>

          <motion.p
            {...rise(0.16)}
            className="mt-7 max-w-lg text-[17px] leading-relaxed text-stone-600"
          >
            Seal a forecast before the outcome exists. Bond it from inside a
            privacy pool, so the claim is public and permanent while your
            wallet, your size and your reasoning stay dark until you open it.
          </motion.p>

          <motion.div {...rise(0.24)} className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/app"
              className="btn-spring group inline-flex items-center gap-2 rounded-full bg-stone-950 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-stone-950/10 transition-colors hover:bg-stone-800"
            >
              Seal a forecast
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/leaderboard"
              className="btn-spring inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3.5 text-sm font-semibold text-stone-800 transition-colors hover:border-stone-400"
            >
              See the record
            </Link>
          </motion.div>

          {/* the one number that is real, straight off mainnet */}
          <motion.div
            {...rise(0.32)}
            className="mt-12 flex items-center gap-6 border-t border-stone-200 pt-6"
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">
                Live on mainnet
              </p>
              <p className="mt-1.5 text-[13.5px] text-stone-600">
                Sealed, revealed and scored on Starknet. Nothing here is a mockup.
              </p>
            </div>
          </motion.div>
        </div>

        {/* the plate: image, with the sealed and settled states overlapping it */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0, scale: 0.94, rotate: -1.5 }}
          animate={reduced ? undefined : { opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.1, delay: 0.12, ease: EASE }}
          className="relative mx-auto w-full max-w-[430px] lg:mr-0 lg:max-w-[480px]"
        >
          <div
            aria-hidden
            className="absolute -inset-3 -rotate-2 rounded-[2rem] border border-stone-200 bg-white/70"
          />

          <figure className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-stone-950 shadow-2xl shadow-stone-900/20">
              <Image
                src={lighthouse}
                alt="A lighthouse standing above a storm surge burying the sea wall around it"
                fill
                priority
                sizes="(min-width: 1024px) 480px, 90vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
              <figcaption className="absolute bottom-4 left-5 right-5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">
                the lamp works whether or not you believe in it
              </figcaption>
            </div>

            {/* sealed */}
            <motion.div
              initial={reduced ? undefined : { opacity: 0, y: 18 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
              className="absolute -left-5 bottom-16 w-[248px] rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:-left-10"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-teal-700">
                    Sealed
                  </p>
                  <p className="mt-1.5 text-[15px] font-bold leading-tight text-stone-900">
                    BTC above $120,000
                  </p>
                </div>
                <XenceMark size={22} accent="#9a5b09" alive />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                  Probability
                </span>
                <span className="relative inline-block h-3.5 w-16 overflow-hidden rounded-sm border border-teal-200 bg-teal-100">
                  <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-teal-300/70 to-transparent" />
                </span>
              </div>
              <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-stone-500">
                <Lock size={11} className="shrink-0 text-teal-700" />
                Unreadable until the forecaster opens it.
              </p>
            </motion.div>

            {/* settled: the same claim, weeks later */}
            <motion.div
              initial={reduced ? undefined : { opacity: 0, y: -14 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.72, ease: EASE }}
              className="absolute -right-4 top-10 w-[186px] rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:-right-8"
            >
              <p className="flex items-center gap-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-teal-700">
                <Check size={11} /> Settled
              </p>
              <p className="mt-2 font-mono text-[26px] font-bold leading-none text-stone-900">
                0.01
              </p>
              <p className="mt-1 text-[11px] text-stone-500">
                Brier score. Said 90%, and it happened.
              </p>
            </motion.div>
          </figure>
        </motion.div>
      </div>
    </section>
  );
}
