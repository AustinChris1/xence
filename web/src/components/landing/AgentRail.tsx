"use client";

import Link from "next/link";
import { ArrowUpRight, Bot, KeyRound, ScrollText } from "lucide-react";

const SNIPPET = `// the agent signs with its own key; the server never sees it
const sealed    = sealForecast(question, 7200, thesis);
const signature = signForecast(AGENT_KEY, sealed, horizon, 0);

await fetch("https://xence.vercel.app/api/seal", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ ...question, probabilityBp: 7200,
                         tier: "bronze", reputationKey, signature }),
});

// -> commitment, questionId, salt, and the exact pool calldata`;

const POINTS = [
  {
    icon: Bot,
    t: "Post what it was posting anyway",
    d: "The seal happens inside the thing that publishes. examples/signal-bot.mjs is the entire integration, in about sixty lines.",
  },
  {
    icon: KeyRound,
    t: "Keys never leave the agent",
    d: "It signs locally and sends the signature. The server verifies, learns nothing, and cannot forge a call in its name.",
  },
  {
    icon: ScrollText,
    t: "A link, not a screenshot",
    d: "Every sealed call lands on a public profile any client can rebuild straight from the chain, including the ones it got wrong.",
  },
];

export function AgentRail() {
  return (
    <section className="relative border-t border-white/10 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-400">
              08 · Autonomous Agents
            </p>
            <h2 className="mt-4 max-w-2xl text-[clamp(2.2rem,4.6vw,3.7rem)] font-bold leading-[1.02] tracking-tight text-white">
              A record an agent{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                cannot edit.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-slate-300">
              Agent reputation today is a claim in a README. Xence gives a bot
              the same primitive it gives a person: seal the call before the
              outcome, get scored by the chain, forfeit for going quiet. One
              endpoint, one signature — and the bot never holds STRK, a
              wallet, or a viewing key.
            </p>

            <div className="mt-10 space-y-3.5">
              {POINTS.map((c) => (
                <div key={c.t} className="flex gap-4.5 rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
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
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#030712] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3.5 bg-slate-900/50">
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
                className="btn-spring inline-flex items-center gap-1.5 rounded-xl bg-teal-500/20 border border-teal-500/40 px-5 py-2.5 text-[13px] font-semibold text-teal-300 transition-colors hover:bg-teal-500/30"
              >
                Read signal-bot.mjs <ArrowUpRight size={14} />
              </a>
              <Link
                href="/docs"
                className="btn-spring inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/60 px-5 py-2.5 text-[13px] font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
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
