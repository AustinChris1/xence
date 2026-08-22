"use client";

import Image from "next/image";
import { motion } from "motion/react";
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
import chess from "../../../public/img/chess.jpg";
import lens from "../../../public/img/signal-lamp.jpg";

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
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <div className="relative">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-seal-600">
                01 — The problem
              </p>
            </Reveal>
            <h2 className="mt-6 font-display text-[clamp(2.2rem,4.6vw,3.7rem)] leading-[1.02] tracking-[-0.015em] text-teal-900">
              <RevealWords text="The alpha economy runs on" />{" "}
              <span className="italic text-seal-600">
                <RevealWords text="deleted evidence." delay={0.2} />
              </span>
            </h2>
            <Reveal delay={0.3}>
              <div className="mt-7 space-y-4 text-[16.5px] leading-relaxed text-[var(--text-dim)]">
                <p>
                  Every analyst, signal group and newsletter sells a track
                  record that cannot be checked. The wins get screenshotted. The
                  losses get quietly removed. What survives is not a record —
                  it is a highlight reel with the misses edited out.
                </p>
                <p className="text-teal-800">
                  Not because measuring is hard. Because nothing forces the
                  misses to stay on the record.
                </p>
              </div>
            </Reveal>

            {/* small chess plate, tucked like a printed figure */}
            <Reveal delay={0.4}>
              <figure className="mt-9 flex items-end gap-5">
                <div className="duo w-40 shrink-0 rotate-[-2deg] rounded-xl border border-[var(--edge)] shadow-[var(--shadow-card)] sm:w-48">
                  <Image
                    src={chess}
                    alt="Chess pieces with only the king in focus"
                    className="aspect-[4/3] object-cover"
                    sizes="200px"
                  />
                </div>
                <figcaption className="pb-1 font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.14em] text-[var(--text-faint)]">
                  fig. 01 — everyone
                  <br />
                  remembers their
                  <br />
                  winning moves
                </figcaption>
              </figure>
            </Reveal>
          </div>

          <Stagger className="grid gap-3 sm:grid-cols-2">
            {CLAIMS.map((c) => (
              <StaggerItem key={c.text}>
                <div
                  className={`h-full rounded-xl border p-4 shadow-[var(--shadow-card)] transition-transform duration-500 hover:-translate-y-0.5 ${
                    c.state === "deleted"
                      ? "border-seal-500/40 bg-cream-300/50"
                      : "border-[var(--edge)] bg-cream-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {c.state === "deleted" ? (
                      <Trash2 size={14} className="mt-0.5 shrink-0 text-seal-600" />
                    ) : (
                      <Megaphone size={14} className="mt-0.5 shrink-0 text-teal-700" />
                    )}
                    <p
                      className={`text-[13.5px] leading-snug ${
                        c.state === "deleted"
                          ? "text-[var(--text-faint)] line-through decoration-seal-500/60"
                          : "text-teal-900"
                      }`}
                    >
                      {c.text}
                    </p>
                  </div>
                  <p className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    {c.state === "deleted"
                      ? "removed · never counted"
                      : "still up · still quoted"}
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

export function Conflict() {
  return (
    <section className="on-teal grain relative overflow-hidden py-28 sm:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[75vh] w-[75vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-teal-700)_0%,transparent_65%)] opacity-60 animate-drift"
      />

      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal-300">
            02 — Why nobody has fixed it
          </p>
        </Reveal>

        <h2 className="mx-auto mt-6 max-w-3xl font-display text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-0.015em] text-cream-50">
          <RevealWords text="The obvious fix destroys the forecaster." />
        </h2>

        <Reveal delay={0.25}>
          <p className="mx-auto mt-6 max-w-2xl text-[16.5px] leading-relaxed text-[var(--text-dim)]">
            Just post your calls in advance, publicly, and let the record speak.
            Except a forecaster who broadcasts a real position in advance gets
            front-run before they can build it, and hands away the edge they
            were trying to sell.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-[var(--edge)] bg-teal-800/60 p-6 text-left">
              <TrendingUp size={18} className="text-cream-300" />
              <h3 className="mt-4 font-display text-xl text-cream-50">Be honest</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--text-faint)]">
                Publish the call before the outcome. Now it is checkable — and
                now everyone can see your position, copy it, and trade against
                it before you are done building it.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="h-full rounded-2xl border border-[var(--edge)] bg-teal-800/60 p-6 text-left">
              <EyeOff size={18} className="text-cream-300" />
              <h3 className="mt-4 font-display text-xl text-cream-50">Be private</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--text-faint)]">
                Keep the position to yourself. Now your edge survives — and your
                track record is once again just a story you tell about
                yourself.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <div className="relative mx-auto mt-10 max-w-2xl rounded-2xl border border-cream-300/40 bg-cream-200/[0.07] p-7">
            <p className="font-display text-[clamp(1.35rem,2.6vw,1.9rem)] leading-snug text-cream-100">
              A shielded pool dissolves the conflict. The{" "}
              <em className="text-cream-200">claim</em> can be public, binding
              and timestamped while the <em className="text-cream-200">position</em>{" "}
              stays completely invisible.
            </p>
            <p className="mt-4 text-[14.5px] leading-relaxed text-[var(--text-dim)]">
              The rare case where privacy makes someone{" "}
              <span className="text-cream-100">more</span> accountable, not less
              — which is why it could not be built on a transparent chain.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: FileLock2,
    n: "01",
    title: "Seal",
    lede: "Commit the hash, not the call.",
    body: "State a probability — “72% that BTC closes above $120k on 30 September” — and write your thesis. Xence hashes all of it with a random salt and puts only that hash on-chain. Nobody can read the number, the direction, or the reasoning. Not other traders, not us.",
  },
  {
    icon: Coins,
    n: "02",
    title: "Bond",
    lede: "Skin in the game, funded invisibly.",
    body: "The forecast is backed by a bond shielded inside the STRK20 pool. The public sees the conviction tier — Bronze, Silver or Gold — and nothing else. Not the wallet, not your balance, not the rest of your book. Tiers are fixed for everyone, so nobody buys a louder reputation.",
  },
  {
    icon: Gavel,
    n: "03",
    title: "Reveal",
    lede: "Open the seal once the answer exists.",
    body: "After the horizon you publish the salt and the probability. The chain recomputes the hash and checks it matches what you committed weeks ago. There is no editing a call after the fact, because the commitment predates the outcome.",
  },
  {
    icon: TrendingUp,
    n: "04",
    title: "Score",
    lede: "The oracle settles it. The maths is not negotiable.",
    body: "A Pragma price feed resolves the question on-chain. Your Brier score updates, your calibration curve moves, and the bond settles — returned with a bonus if you were well calibrated, partially slashed if you were confidently wrong.",
  },
];

export function Mechanism() {
  return (
    <section id="mechanism" className="relative border-t border-[var(--edge)] py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.62fr_1.38fr] lg:gap-16">
          {/* The instrument */}
          <div className="relative">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-seal-600">
                  03 — The mechanism
                </p>
              </Reveal>
              <h2 className="mt-6 font-display text-[clamp(2.2rem,4.6vw,3.7rem)] leading-[1.02] tracking-[-0.015em] text-teal-900">
                <RevealWords text="Four steps, none of them" />{" "}
                <span className="italic text-seal-600">
                  <RevealWords text="trust you." delay={0.15} />
                </span>
              </h2>
              <Reveal delay={0.3}>
                <figure className="mt-10">
                  <div className="duo arch aspect-[3/3.6] rounded-t-full border border-[var(--edge)] shadow-[var(--shadow-deep)]">
                    <Image
                      src={lens}
                      alt="Inside the first-order Fresnel lens of a lighthouse lamp"
                      className="h-full w-full object-cover"
                      sizes="(min-width: 1024px) 30vw, 80vw"
                    />
                  </div>
                  <figcaption className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--text-faint)]">
                    fig. 02 — the lamp works whether or not you believe in it
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </div>

          {/* The steps, as numbered entries in a ledger */}
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.06}>
                <div className="group relative overflow-hidden rounded-2xl border border-[var(--edge)] bg-cream-100 p-7 shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[var(--shadow-deep)] sm:p-9">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-3 -top-7 font-display text-[7rem] leading-none text-teal-700/[0.07] transition-colors duration-500 group-hover:text-teal-700/[0.12]"
                  >
                    {s.n}
                  </span>
                  <div className="relative flex items-start gap-5">
                    <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-700 text-cream-100 shadow-[var(--shadow-card)]">
                      <s.icon size={17} />
                    </div>
                    <div>
                      <h3 className="font-display text-[1.7rem] leading-none text-teal-900">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-[14px] font-medium text-seal-600">
                        {s.lede}
                      </p>
                      <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-[var(--text-dim)]">
                        {s.body}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Forfeit() {
  return (
    <section id="forfeit" className="on-teal grain relative overflow-hidden py-28 sm:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/4 h-[60vh] w-[60vh] translate-x-1/3 rounded-full bg-[radial-gradient(circle,var(--color-seal-600)_0%,transparent_65%)] opacity-25"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-20">
          <div>
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-seal-400">
                04 — The rule that makes it work
              </p>
            </Reveal>
            <h2 className="mt-6 font-display text-[clamp(2.2rem,4.6vw,3.7rem)] leading-[1.02] tracking-[-0.015em] text-cream-50">
              <RevealWords text="Silence is scored as" />{" "}
              <span className="italic text-seal-400">
                <RevealWords text="the worst possible call." delay={0.2} />
              </span>
            </h2>

            <Reveal delay={0.3}>
              <div className="mt-7 space-y-4 text-[16.5px] leading-relaxed text-[var(--text-dim)]">
                <p>
                  The obvious attack: seal a hundred forecasts, reveal the ones
                  that came good, quietly let the rest expire. That is the
                  deleted-tweet problem wearing a cryptographic hat.
                </p>
                <p className="text-cream-100">
                  So Xence does not ignore an unrevealed forecast. It scores it
                  at the maximum possible error — worse than any wrong answer
                  you could have given on purpose — and slashes the bond into
                  the research pool.
                </p>
                <p>
                  Refusing to open a call is the single most expensive thing a
                  forecaster can do here. Being wrong out loud is cheap.
                  Disappearing is not. That asymmetry is what turns a pile of
                  hashes into a record you can trust.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div className="rounded-2xl border border-[var(--edge-strong)] bg-teal-950/70 p-7 shadow-[var(--shadow-deep)]">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                Brier score · lower is better
              </p>
              <ul className="mt-6 space-y-5">
                {[
                  { l: "Called it, high confidence", v: "0.04", w: "4%", cls: "bg-teal-400" },
                  { l: "Honestly uncertain", v: "0.25", w: "25%", cls: "bg-cream-300" },
                  { l: "Confidently wrong", v: "0.81", w: "81%", cls: "bg-seal-500" },
                  { l: "Never revealed", v: "1.00", w: "100%", cls: "bg-seal-400" },
                ].map((row) => (
                  <li key={row.l}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span
                        className={`text-[13.5px] ${row.v === "1.00" ? "text-seal-300" : "text-cream-100"}`}
                      >
                        {row.l}
                      </span>
                      <span className="tnum font-mono text-[13px] text-[var(--text-dim)]">
                        {row.v}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-teal-800">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: row.w }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full ${row.cls}`}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex items-start gap-3 rounded-xl border border-seal-500/40 bg-seal-600/15 p-4">
                <Ban size={15} className="mt-0.5 shrink-0 text-seal-400" />
                <p className="text-[13px] leading-relaxed text-[var(--text-dim)]">
                  A forfeited forecast is permanent and public on your profile.
                  It is the only entry that says nothing about what you thought
                  — only that you would not say.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
