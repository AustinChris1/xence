"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { XenceMark } from "@/components/brand/XenceMark";

const EASE = [0.16, 1, 0.3, 1] as const;

const STACK = [
  {
    logo: "/img/logos/starknet.svg",
    name: "Starknet",
    role: "The chain",
    line: "Every commitment, score and forfeit is written here. No database sits between a forecaster and their record.",
  },
  {
    logo: null,
    name: "STRK20 Pool",
    role: "The privacy",
    line: "Bonds are funded from inside the shielded pool, so a claim can carry weight without carrying a wallet.",
  },
  {
    logo: "/img/logos/pragma.png",
    name: "Pragma",
    role: "The referee",
    line: "Price questions settle on a median across many publishers, so no single party decides who was right.",
  },
  {
    logo: "/img/logos/cairo.svg",
    name: "Cairo",
    role: "The rules",
    line: "Scoring, slashing and the forfeit rule are contract code. The maths does the enforcing, not a moderator.",
  },
];

export function BuiltOn() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-y border-stone-200 bg-white py-20 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/60 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 18 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="max-w-2xl"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-teal-700">
            Built for Starknet forecasters
          </p>
          <h2 className="mt-4 text-[clamp(1.9rem,3.6vw,2.9rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-stone-950">
            Four pieces, and not one of them
            <span className="italic font-medium text-teal-700"> asks you to trust us.</span>
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STACK.map((s, i) => (
            <motion.div
              key={s.name}
              initial={reduced ? undefined : { opacity: 0, y: 26 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12%" }}
              transition={{ duration: 0.7, delay: i * 0.09, ease: EASE }}
              whileHover={reduced ? undefined : { y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-[#fbfaf7] p-6 transition-colors hover:border-teal-300"
            >
              {/* a gold wash that sweeps in from the corner on hover */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-teal-300/0 blur-2xl transition-all duration-500 group-hover:bg-teal-300/40"
              />

              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
                {s.logo ? (
                  <Image
                    src={s.logo}
                    alt={`${s.name} logo`}
                    width={22}
                    height={22}
                    className="h-[22px] w-[22px] object-contain"
                  />
                ) : (
                  // STRK20 has no published mark, so the seal stands in for it.
                  <XenceMark size={20} accent="#9a5b09" />
                )}
              </div>

              <p className="relative mt-5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-stone-400">
                {s.role}
              </p>
              <h3 className="relative mt-1 text-[17px] font-bold tracking-[-0.01em] text-stone-950">
                {s.name}
              </h3>
              <p className="relative mt-2.5 text-[13.5px] leading-relaxed text-stone-600">
                {s.line}
              </p>

              <div
                aria-hidden
                className="relative mt-5 h-px w-full origin-left scale-x-0 bg-teal-500 transition-transform duration-500 ease-out group-hover:scale-x-100"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
