"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bot, Check, Loader2, ShieldAlert } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/landing/Proof";
import { WalletBar } from "@/components/app/WalletBar";
import { useXence } from "@/components/app/useXence";
import { commitActions, dryRun, explainWalletError, submit } from "@/lib/strk20";
import { describeQuestion, saveForecast, type Question } from "@/lib/forecast";
import { TIERS, type Tier } from "@/lib/scoring";
import { txUrl } from "@/lib/config";
import { cn } from "@/lib/cn";

/** What an agent hands its operator. Exactly the seal endpoint's response. */
type AgentSeal = {
  reputationKey: string;
  commitment: string;
  questionId: string;
  salt: string;
  rationaleHash: string;
  tier: Tier;
  horizon: number;
  probabilityBp: number;
  signature: { r: string; s: string };
  question: Question;
};

type Phase =
  | { kind: "idle" }
  | { kind: "working"; message: string }
  | { kind: "done"; hash: string }
  | { kind: "error"; message: string };

export default function AgentPage() {
  const x = useXence();
  const [raw, setRaw] = useState("");
  const [seal, setSeal] = useState<AgentSeal | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });

  function parse(text: string) {
    setRaw(text);
    setPhase({ kind: "idle" });
    try {
      const d = JSON.parse(text) as AgentSeal;
      const complete =
        d.reputationKey && d.commitment && d.salt && d.signature?.r && d.question;
      setSeal(complete ? d : null);
    } catch {
      setSeal(null);
    }
  }

  async function fund() {
    if (!seal || x.wallet.status !== "connected") return;
    try {
      setPhase({ kind: "working", message: "Rebuilding the agent's actions…" });
      const actions = commitActions({
        sealed: {
          commitmentHash: seal.commitment,
          questionId: seal.questionId,
          salt: seal.salt,
          rationaleHash: seal.rationaleHash,
          probabilityBp: seal.probabilityBp,
        },
        question: seal.question,
        tier: seal.tier,
        reputationKey: seal.reputationKey,
        signature: seal.signature,
      });

      setPhase({ kind: "working", message: "Checking…" });
      const check = await dryRun(x.wallet.account, actions);
      if (!check.ok) {
        setPhase({ kind: "error", message: check.error ?? "Preflight failed" });
        return;
      }

      setPhase({ kind: "working", message: "Proving, about 30 seconds…" });
      const hash = await submit(x.wallet.account, actions);

      // Keep the salt locally so the agent's claim can be opened later.
      saveForecast({
        commitmentHash: seal.commitment,
        questionId: seal.questionId,
        salt: seal.salt,
        rationaleHash: seal.rationaleHash,
        probabilityBp: seal.probabilityBp,
        question: seal.question,
        tier: seal.tier,
        rationale: "",
        reputationKey: seal.reputationKey,
        committedAt: Math.floor(Date.now() / 1000),
        txHash: hash,
      });
      setPhase({ kind: "done", hash });
    } catch (e) {
      setPhase({ kind: "error", message: explainWalletError(e) });
    }
  }

  const bond = seal ? TIERS[seal.tier].bond : 0;

  return (
    <>
      <Nav right={<WalletBar x={x} />} />
      <main className="flex-1 bg-[#fbfaf7] pt-32 pb-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-teal-700">
            Operator desk
          </p>
          <h1 className="mt-3 text-[clamp(1.9rem,4vw,2.8rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-stone-950">
            Fund an agent&apos;s forecast.
          </h1>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-stone-600">
            An agent authors and signs its own claim, then hands the result to
            whoever holds the funds. The vault authenticates the agent&apos;s
            signature, not the sender, so the bot never needs STRK, a wallet or
            a viewing key. Paste what <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">signal-bot.mjs</code> printed.
          </p>

          <textarea
            value={raw}
            onChange={(e) => parse(e.target.value)}
            spellCheck={false}
            placeholder='{ "reputationKey": "0x…", "commitment": "0x…", "signature": { … } }'
            className="mt-8 h-44 w-full resize-none rounded-2xl border border-stone-200 bg-white p-4 font-mono text-[12px] text-stone-800 shadow-xs outline-none focus:border-teal-500"
          />

          {raw && !seal ? (
            <p className="mt-3 flex items-center gap-2 text-[13px] text-seal-600">
              <ShieldAlert size={14} /> That is not a complete agent seal. It needs
              the commitment, salt, signature and question.
            </p>
          ) : null}

          {seal ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
              <div className="flex items-center gap-2 border-b border-stone-200 px-5 py-3">
                <Bot size={15} className="text-teal-700" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">
                  Signed by the agent
                </span>
              </div>
              <dl className="divide-y divide-stone-100">
                {[
                  ["claim", describeQuestion(seal.question)],
                  ["agent", seal.reputationKey.slice(0, 22) + "…"],
                  ["commitment", seal.commitment.slice(0, 22) + "…"],
                  ["confidence", "sealed until reveal"],
                  ["you fund", `${bond} STRK bond + 6 STRK pool fee`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 px-5 py-3">
                    <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-stone-400">
                      {k}
                    </dt>
                    <dd className="text-right font-mono text-[12.5px] text-stone-800">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          <button
            onClick={fund}
            disabled={!seal || x.wallet.status !== "connected" || phase.kind === "working"}
            className={cn(
              "btn-spring btn-shine btn-lift mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 py-3.5 text-sm font-semibold text-white",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            {phase.kind === "working" ? (
              <>
                <Loader2 size={15} className="animate-spin" /> {phase.message}
              </>
            ) : x.wallet.status !== "connected" ? (
              "Connect a wallet to fund it"
            ) : (
              `Fund and seal for ${bond || 0} STRK`
            )}
          </button>

          {phase.kind === "done" ? (
            <div className="mt-5 rounded-2xl border border-teal-300 bg-teal-50 p-5">
              <p className="flex items-center gap-2 font-semibold text-teal-900">
                <Check size={16} /> The agent&apos;s claim is on Starknet.
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-[13px]">
                <a
                  href={txUrl(phase.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-teal-800 underline"
                >
                  transaction <ArrowUpRight size={12} />
                </a>
                {seal ? (
                  <Link
                    href={`/f/${seal.reputationKey}`}
                    className="inline-flex items-center gap-1 text-teal-800 underline"
                  >
                    the agent&apos;s public record <ArrowUpRight size={12} />
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}

          {phase.kind === "error" ? (
            <p className="mt-5 rounded-2xl border border-seal-300 bg-seal-50 p-5 text-[13.5px] leading-relaxed text-seal-700">
              {phase.message}
            </p>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
