"use client";

import Link from "next/link";
import { ArrowUpRight, Bot, KeyRound, ScrollText } from "lucide-react";

const SNIPPET = `// the agent signs locally
const sealed = sealForecast(question, 7200, thesis);
const signature = signForecast(AGENT_KEY, sealed, horizon, 0);

await fetch("https://xence.vercel.app/api/seal", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    ...question,
    probabilityBp: 7200,
    tier: "bronze",
    reputationKey,
    signature,
  }),
});

// returns a public receipt for the sealed call`;

const POINTS = [
  {
    icon: Bot,
    t: "Works where the call is made",
    d: "A bot can seal a forecast as part of the same flow that publishes it.",
  },
  {
    icon: KeyRound,
    t: "Keys stay local",
    d: "The server verifies the signature, but it cannot make a forecast in the agent's name.",
  },
  {
    icon: ScrollText,
    t: "Profiles beat screenshots",
    d: "Every opened call lands on a public record, including the ones that missed.",
  },
];

export function AgentRail() {
  return (
    <section className="relative border-t border-white/10 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-400">
              08 · Agents
            </p>
            <h2 className="mt-4 max-w-2xl text-[clamp(2.2rem,4.6vw,3.7rem)] font-bold leading-[1.02] tracking-tight text-white">
              Give agents a record
              <span className="block bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                they cannot rewrite.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-slate-300">
              If an agent makes calls, Xence can timestamp them before the
              result is known and score them later. The output becomes a track
              record, not a highlight reel.
            </p>

            <div className="mt-10 space-y-3.5">
              {POINTS.map((c) => (
                <div key={c.t} className="flex gap-4.5 rounded-2xl border border-white/10 bg-slate-900/55 p-5 shadow-[0_12px_28px_rgba(0,0,0,0.42)] backdrop-blur-xl">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal-500/25 bg-teal-500/15 text-teal-300">
                    <c.icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-tight text-white">
                      {c.t}
                    </h3>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-slate-400">
                      {c.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#030712] shadow-[0_18px_44px_rgba(0,0,0,0.62)]">
              <div className="flex items-center gap-2 border-b border-white/10 bg-slate-900/50 px-5 py-3.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-400">
                  POST /api/seal
                </span>
              </div>
              <pre className="overflow-x-auto px-6 py-6 font-mono text-[12.5px] leading-relaxed text-slate-200">
                <code>{SNIPPET}</code>
              </pre>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/AustinChris1/xence/blob/main/examples/signal-bot.mjs"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-spring inline-flex items-center gap-1.5 rounded-xl border border-teal-500/35 bg-teal-500/[0.18] px-5 py-2.5 text-[13px] font-semibold text-teal-300 transition-colors hover:bg-teal-500/25"
              >
                Read signal-bot.mjs <ArrowUpRight size={14} />
              </a>
              <Link
                href="/docs"
                className="btn-spring inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/55 px-5 py-2.5 text-[13px] font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                Agent documentation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
