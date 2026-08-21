"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  EyeOff,
  FileLock2,
  Gavel,
  Coins,
  Trash2,
  Megaphone,
  TrendingUp,
  Ban,
} from "lucide-react";
import { Reveal, RevealWords, Stagger, StaggerItem } from "@/components/ui/Reveal";

/* ===========================================================================
   THE PROBLEM
   =========================================================================== */

const CLAIMS = [
  { text: "Called ETH at $1,800. Told you.", state: "kept" },
  { text: "SOL to $400 by June, screenshot this", state: "deleted" },
  { text: "I said rotate out three weeks ago", state: "kept" },
  { text: "This is the bottom. Loading up.", state: "deleted" },
  { text: "Been bullish since the start, check my TL", state: "kept" },
  { text: "Shorting here, easy money", state: "deleted" },
];

export function Problem() {
  return (
    <section className="relative border-t border-[var(--edge)] py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal-300">
                01 — The problem
              </p>
            </Reveal>
            <h2 className="mt-6 font-display text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.04] tracking-[-0.015em] text-cream-50">
              <RevealWords text="The alpha economy runs on" />{" "}
              <span className="italic text-cream-200">
                <RevealWords text="deleted evidence." delay={0.2} />
              </span>
            </h2>
            <Reveal delay={0.3}>
              <div className="mt-7 space-y-4 text-[16.5px] leading-relaxed text-[var(--text-dim)]">
                <p>
                  Every analyst, signal group and newsletter on the internet sells
                  a track record that cannot be checked. The wins get screenshotted.
                  The losses get quietly removed. What survives is not a record —
                  it is a highlight reel with the misses edited out.
                </p>
                <p>
                  It is survivorship bias sold as expertise, and it is a genuinely
                  large market: people pay real money, every month, for signals
                  from strangers whose actual hit rate nobody has ever measured.
                </p>
                <p className="text-cream-200">
                  Not because measuring is hard. Because nothing forces the misses
                  to stay on the record.
                </p>
              </div>
            </Reveal>
          </div>

          <Stagger className="grid gap-3 sm:grid-cols-2">
            {CLAIMS.map((c) => (
              <StaggerItem key={c.text}>
                <div
                  className={`group relative h-full overflow-hidden rounded-xl border p-4 transition-all duration-500 ${
                    c.state === "deleted"
                      ? "border-seal-500/25 bg-seal-500/[0.04]"
                      : "border-[var(--edge)] bg-ink-850/60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {c.state === "deleted" ? (
                      <Trash2 size={14} className="mt-0.5 shrink-0 text-seal-400" />
                    ) : (
                      <Megaphone size={14} className="mt-0.5 shrink-0 text-cream-300" />
                    )}
                    <p
                      className={`text-[13.5px] leading-snug ${
                        c.state === "deleted"
                          ? "text-[var(--text-faint)] line-through decoration-seal-400/50"
                          : "text-cream-100"
                      }`}
                    >
                      {c.text}
                    </p>
                  </div>
                  <p className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    {c.state === "deleted" ? "removed · never counted" : "still up · still quoted"}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

/* ===========================================================================
   THE CONFLICT — the insight the whole product turns on
   =========================================================================== */

export function Conflict() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const split = useTransform(scrollYProgress, [0.15, 0.5], [0, 1]);
  const leftX = useTransform(split, [0, 1], [0, -26]);
  const rightX = useTransform(split, [0, 1], [0, 26]);

  return (
    <section
      ref={ref}
      className="grain relative overflow-hidden border-t border-[var(--edge)] bg-ink-950/60 py-28 sm:py-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-teal-700)_0%,transparent_65%)] opacity-30"
      />

      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal-300">
            02 — Why nobody has fixed it
          </p>
        </Reveal>

        <h2 className="mx-auto mt-6 max-w-3xl font-display text-[clamp(2rem,4.2vw,3.3rem)] leading-[1.06] tracking-[-0.015em] text-cream-50">
          <RevealWords text="The obvious fix destroys the forecaster." />
        </h2>

        <Reveal delay={0.25}>
          <p className="mx-auto mt-6 max-w-2xl text-[16.5px] leading-relaxed text-[var(--text-dim)]">
            Just post your calls in advance, publicly, and let the record speak.
            Except a forecaster who broadcasts a real position in advance gets
            front-run before they can build it, and hands away the edge they were
            trying to sell.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          <motion.div style={{ x: leftX }}>
            <Reveal>
              <div className="h-full rounded-2xl border border-[var(--edge)] bg-ink-900/80 p-6 text-left">
                <TrendingUp size={18} className="text-cream-300" />
                <h3 className="mt-4 font-display text-xl text-cream-50">
                  Be honest
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--text-faint)]">
                  Publish the call before the outcome. Now it is checkable — and
                  now everyone can see your position, copy it, and trade against
                  it before you are done.
                </p>
              </div>
            </Reveal>
          </motion.div>

          <motion.div style={{ x: rightX }}>
            <Reveal delay={0.08}>
              <div className="h-full rounded-2xl border border-[var(--edge)] bg-ink-900/80 p-6 text-left">
                <EyeOff size={18} className="text-cream-300" />
                <h3 className="mt-4 font-display text-xl text-cream-50">
                  Be private
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--text-faint)]">
                  Keep the position to yourself. Now your edge survives — and your
                  track record is once again just a story you tell about yourself.
                </p>
              </div>
            </Reveal>
          </motion.div>
        </div>

        <Reveal delay={0.2}>
          <div className="relative mx-auto mt-10 max-w-2xl rounded-2xl border border-cream-400/30 bg-cream-200/[0.06] p-7">
            <p className="font-display text-[clamp(1.35rem,2.6vw,1.85rem)] leading-snug text-cream-100">
              A shielded pool dissolves the conflict. The{" "}
              <em className="text-cream-200">claim</em> can be public, binding and
              timestamped while the <em className="text-cream-200">position</em>{" "}
              stays completely invisible.
            </p>
            <p className="mt-4 text-[14.5px] leading-relaxed text-[var(--text-dim)]">
              This is the rare case where privacy makes someone{" "}
              <span className="text-cream-100">more</span> accountable rather than
              less — which is exactly why it has to be built here, and could not be
              built on a transparent chain.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ===========================================================================
   THE MECHANISM
   =========================================================================== */

const STEPS = [
  {
    icon: FileLock2,
    n: "01",
    title: "Seal",
    lede: "Commit the hash, not the call.",
    body:
      "You state a probability — “72% that BTC closes above $120k on 30 September” — and write your thesis. Xence hashes all of it with a random salt and puts only that hash on-chain. Nobody can read the number, the direction, or the reasoning. Not other traders, not us.",
    tint: "text-teal-300",
  },
  {
    icon: Coins,
    n: "02",
    title: "Bond",
    lede: "Skin in the game, funded invisibly.",
    body:
      "The forecast is backed by a bond shielded inside the STRK20 pool. The public sees the conviction tier — Bronze, Silver or Gold — and nothing else. Not the wallet that funded it, not your balance, not the rest of your book. Tiers are fixed for everyone, so nobody buys a louder reputation.",
    tint: "text-cream-200",
  },
  {
    icon: Gavel,
    n: "03",
    title: "Reveal",
    lede: "Open the seal once the answer exists.",
    body:
      "After the horizon passes you publish the salt and the probability. The chain recomputes the hash and checks it matches what you committed weeks ago. There is no way to edit the call after the fact, because the commitment was made before the outcome existed.",
    tint: "text-teal-300",
  },
  {
    icon: TrendingUp,
    n: "04",
    title: "Score",
    lede: "The oracle settles it. The maths is not negotiable.",
    body:
      "A Pragma price feed resolves the question on-chain. Your Brier score updates, your calibration curve moves, and the bond settles — returned with a share of the research pool if you were well calibrated, partially slashed if you were confidently wrong.",
    tint: "text-cream-200",
  },
];

export function Mechanism() {
  return (
    <section
      id="mechanism"
      className="relative border-t border-[var(--edge)] py-28 sm:py-36"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal-300">
              03 — The mechanism
            </p>
          </Reveal>
          <h2 className="mt-6 font-display text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.04] tracking-[-0.015em] text-cream-50">
            <RevealWords text="Four steps, and none of them" />{" "}
            <span className="italic text-cream-200">
              <RevealWords text="require trusting you." delay={0.2} />
            </span>
          </h2>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--edge)] md:grid-cols-2">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.07}>
              <div className="group relative h-full bg-ink-900 p-7 transition-colors duration-500 hover:bg-ink-850 sm:p-9">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--text-faint)]">
                    {s.n}
                  </span>
                  <s.icon
                    size={18}
                    className={`${s.tint} transition-transform duration-500 group-hover:-translate-y-0.5`}
                  />
                </div>
                <h3 className="mt-6 font-display text-[1.9rem] leading-none text-cream-50">
                  {s.title}
                </h3>
                <p className="mt-2.5 text-[14px] text-cream-200">{s.lede}</p>
                <p className="mt-4 text-[14.5px] leading-relaxed text-[var(--text-faint)]">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===========================================================================
   THE FORFEIT RULE — the load-bearing mechanism
   =========================================================================== */

export function Forfeit() {
  return (
    <section
      id="forfeit"
      className="grain relative overflow-hidden border-t border-[var(--edge)] py-28 sm:py-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/4 h-[60vh] w-[60vh] translate-x-1/3 rounded-full bg-[radial-gradient(circle,var(--color-seal-600)_0%,transparent_65%)] opacity-[0.18]"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-20">
          <div>
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-seal-400">
                04 — The rule that makes it work
              </p>
            </Reveal>
            <h2 className="mt-6 font-display text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.04] tracking-[-0.015em] text-cream-50">
              <RevealWords text="Silence is scored as" />{" "}
              <span className="italic text-seal-300">
                <RevealWords text="the worst possible call." delay={0.2} />
              </span>
            </h2>

            <Reveal delay={0.3}>
              <div className="mt-7 space-y-4 text-[16.5px] leading-relaxed text-[var(--text-dim)]">
                <p>
                  Here is the obvious attack: seal a hundred forecasts, reveal the
                  ones that came good, and quietly let the rest expire. That is
                  exactly the deleted-tweet problem, wearing a cryptographic hat.
                </p>
                <p className="text-cream-100">
                  So Xence does not ignore an unrevealed forecast. It scores it at
                  the maximum possible error — worse than any wrong answer you
                  could have given on purpose — and slashes the bond into the
                  research pool.
                </p>
                <p>
                  Refusing to open a call is therefore the single most expensive
                  thing a forecaster can do. Being wrong out loud is cheap.
                  Disappearing is not. That asymmetry is what converts a pile of
                  hashes into a track record you can actually trust.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div className="rounded-2xl border border-[var(--edge-strong)] bg-ink-950/70 p-7">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                Brier score · lower is better
              </p>
              <ul className="mt-6 space-y-5">
                {[
                  { l: "Called it, high confidence", v: "0.04", w: "4%", tone: "teal" },
                  { l: "Honestly uncertain", v: "0.25", w: "25%", tone: "cream" },
                  { l: "Confidently wrong", v: "0.81", w: "81%", tone: "seal" },
                  { l: "Never revealed", v: "1.00", w: "100%", tone: "seal-max" },
                ].map((row) => (
                  <li key={row.l}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span
                        className={`text-[13.5px] ${
                          row.tone === "seal-max" ? "text-seal-300" : "text-cream-100"
                        }`}
                      >
                        {row.l}
                      </span>
                      <span className="tnum font-mono text-[13px] text-[var(--text-dim)]">
                        {row.v}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-800">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: row.w }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full ${
                          row.tone === "teal"
                            ? "bg-teal-400"
                            : row.tone === "cream"
                              ? "bg-cream-300"
                              : row.tone === "seal"
                                ? "bg-seal-500"
                                : "bg-seal-400"
                        }`}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex items-start gap-3 rounded-xl border border-seal-500/30 bg-seal-500/[0.06] p-4">
                <Ban size={15} className="mt-0.5 shrink-0 text-seal-400" />
                <p className="text-[13px] leading-relaxed text-[var(--text-dim)]">
                  A forfeited forecast is permanent and public on your profile. It
                  is the only entry that says nothing about what you thought — only
                  that you would not say.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
