"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Coins, FileLock2, Gavel, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;
const DWELL = 5200;

type Row = { k: string; v: string; tone?: "sealed" | "good" | "dim" };

const STEPS = [
  {
    icon: FileLock2,
    n: "01",
    title: "Seal",
    tag: "Poseidon hash",
    lede: "Your answer is hashed with a random salt in the browser. Only the hash reaches Starknet.",
    caption: "Written on-chain. Nothing here can be edited later.",
    rows: [
      { k: "commitment", v: "0x2b4c…92fd" },
      { k: "question", v: "BTC above $120,000" },
      { k: "horizon", v: "30 Sep · 14:00 UTC" },
      { k: "probability", v: "sealed", tone: "sealed" },
      { k: "thesis", v: "sealed", tone: "sealed" },
    ] as Row[],
  },
  {
    icon: Coins,
    n: "02",
    title: "Bond",
    tag: "STRK20 pool",
    lede: "The stake is funded from inside the privacy pool, so the claim carries weight without carrying your identity.",
    caption: "The vault sees a bond. It never sees a wallet.",
    rows: [
      { k: "from", v: "shielded note · pool" },
      { k: "to", v: "XenceVault" },
      { k: "amount", v: "2 STRK · Bronze", tone: "good" },
      { k: "your wallet", v: "not revealed", tone: "sealed" },
      { k: "submitted by", v: "relayer, not you", tone: "dim" },
    ] as Row[],
  },
  {
    icon: Gavel,
    n: "03",
    title: "Reveal",
    tag: "STARK curve",
    lede: "After the horizon you publish the salt. The contract recomputes the hash and refuses anything that does not match.",
    caption: "Same hash, weeks later. There is no rewriting the call.",
    rows: [
      { k: "salt", v: "0x7f31…a04c" },
      { k: "recomputed", v: "0x2b4c…92fd ✓", tone: "good" },
      { k: "probability", v: "72%", tone: "good" },
      { k: "thesis", v: "funding flipped negative" },
      { k: "state", v: "open → revealed", tone: "dim" },
    ] as Row[],
  },
  {
    icon: TrendingUp,
    n: "04",
    title: "Score",
    tag: "Pragma · or the chain",
    lede: "The oracle median settles it, or an ERC-20 balance for ecosystem questions. Calibration, not luck, moves the record.",
    caption: "Bond returns to the pool, adjusted by how honest the number was.",
    rows: [
      { k: "observed", v: "$121,430 · 11 sources" },
      { k: "outcome", v: "happened", tone: "good" },
      { k: "brier", v: "0.078", tone: "good" },
      { k: "settlement", v: "+16% → 2.32 STRK", tone: "good" },
      { k: "record", v: "updated on-chain", tone: "dim" },
    ] as Row[],
  },
];

export function Pipeline() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const reduced = useReducedMotion();
  const step = STEPS[active];

  // Runs itself like a demo until you take the wheel, then stays put.
  useEffect(() => {
    if (held || reduced) return;
    const id = setTimeout(() => setActive((i) => (i + 1) % STEPS.length), DWELL);
    return () => clearTimeout(id);
  }, [active, held, reduced]);

  return (
    <div
      className="mt-12"
      onPointerDown={() => setHeld(true)}
      onMouseEnter={() => setHeld(true)}
    >
      <div className="flex flex-wrap justify-center gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.n}
            onClick={() => setActive(i)}
            className={cn(
              "btn-spring relative overflow-hidden rounded-full border px-4 py-2.5 text-[13px] transition-colors",
              i === active
                ? "border-transparent text-cream-100"
                : "border-[var(--edge)] text-[var(--text-dim)] hover:border-[var(--edge-strong)] hover:text-teal-800",
            )}
          >
            {i === active ? (
              <motion.span
                layoutId="pipeline-pill"
                className="absolute inset-0 rounded-full bg-teal-700"
                transition={{ duration: 0.45, ease: EASE }}
              />
            ) : null}
            <span className="relative z-10 inline-flex items-center gap-2">
              <s.icon size={14} />
              <span className="font-mono text-[10.5px] opacity-60">{s.n}</span>
              {s.title}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-7 grid overflow-hidden rounded-3xl border border-[var(--edge)] bg-cream-100 shadow-[var(--shadow-card)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative flex flex-col justify-center overflow-hidden p-7 sm:p-9">
          <AnimatePresence mode="wait">
            <motion.span
              key={step.n}
              aria-hidden
              initial={reduced ? undefined : { opacity: 0, y: 20 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="pointer-events-none absolute -bottom-5 right-6 select-none font-display text-[6.5rem] leading-none text-teal-800/[0.07]"
            >
              {step.n}
            </motion.span>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div
              key={step.n}
              initial={reduced ? undefined : { opacity: 0, y: 14 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <span className="inline-block rounded-md bg-teal-700/10 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-teal-800">
                {step.tag}
              </span>
              <h3 className="mt-3 font-display text-[1.9rem] leading-none text-teal-900">
                {step.title}
              </h3>
              <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-[var(--text-dim)]">
                {step.lede}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* how long this panel holds before the next one */}
          <div className="mt-6 h-px w-full max-w-[180px] bg-[var(--edge)]">
            {held || reduced ? null : (
              <motion.div
                key={active}
                className="h-px bg-teal-600"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: DWELL / 1000, ease: "linear" }}
              />
            )}
          </div>
        </div>

        <div className="border-t border-[var(--edge)] bg-teal-950 p-6 sm:p-7 lg:border-l lg:border-t-0">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-cream-200/40">
            what Starknet sees
          </p>

          <AnimatePresence mode="wait">
            <motion.dl key={step.n} className="mt-4 space-y-2.5">
              {step.rows.map((r, i) => (
                <motion.div
                  key={r.k}
                  className="flex items-baseline justify-between gap-4 border-b border-cream-200/[0.07] pb-2.5 last:border-b-0"
                  initial={reduced ? undefined : { opacity: 0, x: 10 }}
                  animate={reduced ? undefined : { opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07, ease: EASE }}
                >
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-cream-200/35">
                    {r.k}
                  </dt>
                  <dd
                    className={cn(
                      "text-right font-mono text-[12.5px]",
                      r.tone === "good"
                        ? "text-teal-300"
                        : r.tone === "dim"
                          ? "text-cream-200/45"
                          : "text-cream-100/90",
                    )}
                  >
                    {r.tone === "sealed" ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-16 rounded-sm bg-cream-200/15 blur-[2px]" />
                        <span className="text-cream-200/40">{r.v}</span>
                      </span>
                    ) : (
                      r.v
                    )}
                  </dd>
                </motion.div>
              ))}
            </motion.dl>
          </AnimatePresence>

          <p className="mt-5 text-[12px] leading-relaxed text-cream-200/45">
            {step.caption}
          </p>
        </div>
      </div>
    </div>
  );
}
