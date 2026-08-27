"use client";

import Link from "next/link";
import { ArrowUpRight, Bot, KeyRound, ScrollText } from "lucide-react";
import { Reveal, RevealWords, Stagger, StaggerItem } from "@/components/ui/Reveal";

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
    <section className="relative border-t border-[var(--edge)] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-seal-600">
                08 · For machines
              </p>
            </Reveal>
            <h2 className="mt-6 max-w-2xl font-display text-[clamp(2.2rem,4.6vw,3.7rem)] leading-[1.02] tracking-[-0.015em] text-teal-900">
              <RevealWords text="A record a bot" />{" "}
              <span className="italic text-seal-600">
                <RevealWords text="cannot edit." delay={0.18} />
              </span>
            </h2>
            <Reveal delay={0.25}>
              <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-[var(--text-dim)]">
                Agent reputation today is a claim in a README. Xence gives a bot
                the same primitive it gives a person: seal the call before the
                outcome, get scored by the chain, forfeit for going quiet. One
                endpoint, one signature, and the bot never holds STRK, a
                wallet, or a viewing key.
              </p>
            </Reveal>

            <Stagger className="mt-10 space-y-3">
              {POINTS.map((c) => (
                <StaggerItem key={c.t}>
                  <div className="flex gap-4 rounded-2xl border border-[var(--edge)] bg-cream-100 p-5 shadow-[var(--shadow-card)]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-700 text-cream-100">
                      <c.icon size={15} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg leading-tight text-teal-900">
                        {c.t}
                      </h3>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--text-faint)]">
                        {c.d}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <Reveal delay={0.15}>
            <div className="overflow-hidden rounded-2xl border border-[var(--edge)] bg-teal-950 shadow-[var(--shadow-deep)]">
              <div className="flex items-center gap-2 border-b border-cream-200/10 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-cream-200/25" />
                <span className="h-2 w-2 rounded-full bg-cream-200/25" />
                <span className="h-2 w-2 rounded-full bg-cream-200/25" />
                <span className="ml-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-cream-200/40">
                  POST /api/seal
                </span>
              </div>
              <pre className="overflow-x-auto px-5 py-5 font-mono text-[12px] leading-relaxed text-cream-100/85">
                <code>{SNIPPET}</code>
              </pre>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="https://github.com/AustinChris1/xence/blob/main/examples/signal-bot.mjs"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-spring inline-flex items-center gap-1.5 rounded-full bg-teal-700 px-5 py-2.5 text-[13px] font-medium text-cream-100 transition-colors hover:bg-teal-600"
              >
                Read signal-bot.mjs <ArrowUpRight size={14} />
              </a>
              <Link
                href="/docs/usage"
                className="btn-spring inline-flex items-center gap-1.5 rounded-full border border-[var(--edge-strong)] px-5 py-2.5 text-[13px] text-teal-900 transition-colors hover:bg-cream-300/60"
              >
                How the flow works
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
