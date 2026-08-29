"use client";

import { useState } from "react";
import { FileLock2, Coins, Gavel, TrendingUp, Terminal, Copy, Check } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: FileLock2,
    title: "Seal",
    tag: "Poseidon Hash Commit",
    desc: "Your prediction probability and thesis are hashed locally in your browser with a 256-bit random salt. Only the Poseidon digest reaches Starknet.",
    rows: [
      { k: "Commitment Hash", v: "0x2b4c92fd041a80c" },
      { k: "Target Question", v: "BTC above $120,000" },
      { k: "Resolution Date", v: "30 Sep · 14:00 UTC" },
      { k: "Probability Call", v: "72% (Encrypted / Dark)" },
    ],
    calldata: `let commitment = poseidon_hash_span([
    question_id,
    probability_bp, // 7200
    salt            // 0x7f31a04c...
]);
XenceVault.seal_commitment(commitment, horizon, tier_bronze);`,
  },
  {
    num: "02",
    icon: Coins,
    title: "Bond",
    tag: "STRK20 Privacy Pool",
    desc: "The forecast stake is funded directly from inside the STRK20 shielded pool. Your wallet address is never published or associated with the commitment.",
    rows: [
      { k: "Funding Source", v: "STRK20 Shielded Note" },
      { k: "Contract Target", v: "XenceVault::v2" },
      { k: "Stake Amount", v: "2.00 STRK (Bronze Tier)" },
      { k: "Depositor Wallet", v: "Shielded (Zero Alpha Leak)" },
    ],
    calldata: `let invoke_params = strk20_invoke_transaction({
    note_commitment: note_hash,
    nullifier: note_nullifier,
    target: XENCE_VAULT_ADDRESS,
    amount: 2_000000000000000000 // 2 STRK
});`,
  },
  {
    num: "03",
    icon: Gavel,
    title: "Reveal",
    tag: "STARK Preimage Verification",
    desc: "Once the resolution horizon passes, publish your secret salt. The Cairo contract recomputes the Poseidon hash to prove zero tampering.",
    rows: [
      { k: "Revealed Salt", v: "0x7f31a04c92b8d14" },
      { k: "Verified Hash", v: "0x2b4c92fd041a80c ✓" },
      { k: "Opened Probability", v: "72.0% Call" },
      { k: "Vault State", v: "SEALED → REVEALED" },
    ],
    calldata: `fn reveal_forecast(ref self: ContractState, salt: felt252, p_bp: u16) {
    let recomputed = poseidon_hash_span([self.question_id, p_bp, salt]);
    assert(recomputed == self.stored_commitment, 'INVALID_PREIMAGE');
    self.state = State::Revealed;
}`,
  },
  {
    num: "04",
    icon: TrendingUp,
    title: "Settle",
    tag: "Pragma Oracle & Brier Audit",
    desc: "Pragma oracles feed the multi-source median price settlement. Cairo evaluates your Brier calibration score and updates your permanent track record.",
    rows: [
      { k: "Oracle Median", v: "$121,430 (11 sources)" },
      { k: "True Outcome", v: "1 (Happened)" },
      { k: "Calculated Brier", v: "0.078 (High Accuracy)" },
      { k: "Settlement Return", v: "+16.0% → 2.32 STRK" },
    ],
    calldata: `let price = IPragmaOracle.get_data_median(KEY_BTC_USD);
let outcome = if price >= STRIKE { 10000 } else { 0 };
let brier = calculate_brier_bp(p_bp, outcome);
Registry.update_forecaster_record(reputation_key, brier);`,
  },
];

export function Pipeline() {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const step = STEPS[active];

  return (
    <section id="mechanism" className="py-20 sm:py-28 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-700">
            03 · Architecture
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
            Four simple steps, <br />
            <span className="text-teal-700 italic">
              enforced by Cairo.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Autonomous Starknet execution with zero off-chain reliance or custodial intermediaries.
          </p>
        </div>

        {/* Step Tabs */}
        <div className="mt-12 flex flex-wrap justify-center gap-2 sm:gap-3">
          {STEPS.map((s, i) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setActive(i)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                i === active
                  ? "bg-slate-900 text-white shadow-md font-bold"
                  : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <s.icon size={15} />
              <span className="font-mono text-xs opacity-75">{s.num}</span>
              <span>{s.title}</span>
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="mt-8 max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left: Step Explainer */}
            <div className="p-8 lg:col-span-6 flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-xs font-mono font-bold uppercase tracking-wider">
                  {step.tag}
                </span>
                <h3 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-950">
                  Step {step.num}: {step.title}
                </h3>
                <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100">
                <dl className="space-y-2.5">
                  {step.rows.map((r) => (
                    <div key={r.k} className="flex justify-between text-xs sm:text-sm">
                      <dt className="text-slate-500">{r.k}</dt>
                      <dd className="font-mono font-bold text-teal-800">{r.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Right: Cairo Code Terminal */}
            <div className="p-6 sm:p-8 bg-slate-950 text-white lg:col-span-6 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-teal-400" />
                    <span className="text-xs font-mono font-bold uppercase text-slate-300">
                      Cairo Smart Contract
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(step.calldata);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="text-slate-400 hover:text-white transition-colors"
                    title="Copy Cairo code"
                  >
                    {copied ? <Check size={14} className="text-teal-400" /> : <Copy size={14} />}
                  </button>
                </div>

                <pre className="mt-4 overflow-x-auto text-xs font-mono leading-relaxed text-teal-300 p-3.5 rounded-xl bg-black/60 border border-slate-800">
                  <code>{step.calldata}</code>
                </pre>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Verification: STARK Validity Proof</span>
                <span className="text-teal-400 font-bold">Mainnet Ready</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
