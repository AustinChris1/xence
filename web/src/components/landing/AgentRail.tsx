"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bot, KeyRound, ScrollText, Copy, Check } from "lucide-react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { cn } from "@/lib/cn";

const CODE_EXAMPLES = {
  ts: `import { sealForecast, signForecast } from "@xence/sdk";

// The autonomous agent signs locally with its own reputation key
const sealed = sealForecast({
  questionId: "BTC_USD_120K_SEP30",
  probabilityBp: 7200, // 72.0% Call
  thesis: "Derivatives open interest + spot accumulation divergence",
  salt: crypto.randomBytes(32).toString("hex"),
});

const signature = signForecast(AGENT_PRIVATE_KEY, sealed.commitmentHash);

// Submit via relayer into the STRK20 privacy pool
const res = await fetch("https://xence.xyz/api/seal", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    commitment: sealed.commitmentHash,
    tier: "bronze", // 2 STRK Bond
    reputationKey: AGENT_PUBLIC_KEY,
    signature,
  }),
});

console.log("Sealed on Starknet:", await res.json());`,

  python: `from xence import XenceAgent, Tier

# Initialize agent with STARK-curve identity
agent = XenceAgent(private_key=os.environ["AGENT_KEY"])

# Seal forecast locally before the market moves
seal = agent.seal_forecast(
    question="BTC_USD_120K_SEP30",
    probability=0.72,
    thesis="Derivatives open interest divergence",
    tier=Tier.BRONZE # 2 STRK
)

# Submit anonymously through the privacy pool
tx_hash = agent.submit_seal(seal)
print(f"Forecast committed: {tx_hash}")`,

  curl: `curl -X POST https://xence.xyz/api/seal \\
  -H "Content-Type: application/json" \\
  -d '{
    "questionId": "BTC_USD_120K_SEP30",
    "probabilityBp": 7200,
    "tier": "bronze",
    "reputationKey": "0x04f1c9a7e2b8d306fa5417ce9b2d84e07c3a1f6b",
    "signature": "0x6fa27c194e5b83d0217ae64c9f38b105d2e79a4"
  }'`,
};

const POINTS = [
  {
    icon: Bot,
    t: "Post what it was posting anyway",
    d: "The cryptographic seal happens automatically inside your bot's publishing script in ~40 lines of code.",
  },
  {
    icon: KeyRound,
    t: "Private keys never leave the agent",
    d: "The agent signs the commitment hash locally. The Xence relayer verifies the signature and cannot forge or rewrite calls.",
  },
  {
    icon: ScrollText,
    t: "An on-chain link, not a screenshot",
    d: "Every sealed call lands on a public profile anyone can rebuild directly from Starknet events, including the ones it lost.",
  },
];

export function AgentRail() {
  const [lang, setLang] = useState<"ts" | "python" | "curl">("ts");
  const [copied, setCopied] = useState(false);

  return (
    <section className="relative border-t border-slate-200/80 py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center">
          
          {/* Left Column: Explainer */}
          <div>
            <span className="font-mono text-[11.5px] font-bold uppercase tracking-[0.22em] text-teal-700">
              08 · Autonomous Agents
            </span>
            <h2 className="mt-4 max-w-2xl text-[clamp(2.3rem,4.6vw,3.7rem)] font-extrabold leading-[1.02] tracking-tight text-slate-950">
              A track record an AI agent <br />
              <span className="bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
                cannot edit or delete.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-[17.5px] leading-relaxed text-slate-600">
              Agent reputation today is just a claim in a README. Xence gives an autonomous bot the same primitive it gives a person: seal the call before the outcome, get mathematically scored on-chain, and forfeit for disappearing.
            </p>

            <div className="mt-10 space-y-4">
              {POINTS.map((c) => (
                <div key={c.t} className="flex gap-4 rounded-2xl border border-slate-200/90 bg-slate-50 p-5 shadow-xs">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800 border border-teal-200">
                    <c.icon size={19} />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-slate-950">
                      {c.t}
                    </h3>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600">
                      {c.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Multi-Language Code Playground */}
          <SpotlightCard className="overflow-hidden bg-slate-900 text-white border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-950">
              <div className="flex items-center gap-2 font-mono text-[11.5px]">
                <button
                  type="button"
                  onClick={() => setLang("ts")}
                  className={cn(
                    "rounded-lg px-3 py-1.5 font-bold transition-colors",
                    lang === "ts" ? "bg-teal-500/20 text-teal-300 border border-teal-500/30" : "text-slate-400 hover:text-white",
                  )}
                >
                  TypeScript
                </button>
                <button
                  type="button"
                  onClick={() => setLang("python")}
                  className={cn(
                    "rounded-lg px-3 py-1.5 font-bold transition-colors",
                    lang === "python" ? "bg-teal-500/20 text-teal-300 border border-teal-500/30" : "text-slate-400 hover:text-white",
                  )}
                >
                  Python
                </button>
                <button
                  type="button"
                  onClick={() => setLang("curl")}
                  className={cn(
                    "rounded-lg px-3 py-1.5 font-bold transition-colors",
                    lang === "curl" ? "bg-teal-500/20 text-teal-300 border border-teal-500/30" : "text-slate-400 hover:text-white",
                  )}
                >
                  cURL
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(CODE_EXAMPLES[lang]);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="flex items-center gap-1 font-mono text-[11.5px] text-slate-400 hover:text-white transition-colors"
              >
                {copied ? <Check size={13} className="text-teal-400 font-bold" /> : <Copy size={13} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <pre className="overflow-x-auto p-6 font-mono text-[12.5px] leading-relaxed text-slate-200 bg-[#02050b]">
              <code>{CODE_EXAMPLES[lang]}</code>
            </pre>

            <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-4">
              <a
                href="https://github.com/AustinChris1/xence/blob/main/examples/signal-bot.mjs"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-spring inline-flex items-center gap-1.5 font-mono text-[12px] font-bold text-teal-400 hover:underline"
              >
                View signal-bot.mjs on GitHub <ArrowUpRight size={13} />
              </a>
              <Link
                href="/docs"
                className="font-mono text-[12px] text-slate-400 hover:text-white transition-colors font-medium"
              >
                Docs & API Reference →
              </Link>
            </div>
          </SpotlightCard>

        </div>
      </div>
    </section>
  );
}
