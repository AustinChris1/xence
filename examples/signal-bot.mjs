/**
 * A signal bot that seals what it was already going to post.
 *
 *   node examples/signal-bot.mjs
 *
 * The workflow Xence is for. Nobody opens a website and retypes a prediction
 * they already published, so the seal happens inside the thing that publishes.
 * The bot keeps its key, calls one endpoint, posts as normal, and now the call
 * is on the record before the outcome exists.
 *
 * Set XENCE_API to point at a deployment (default: the live one).
 */

const API = process.env.XENCE_API ?? "https://xence.vercel.app";

// The bot's identity. One scalar, generated once, never shared.
const AGENT_KEY =
  process.env.XENCE_AGENT_KEY ??
  "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd";

/** Whatever the bot decided to call, in its own terms. */
const call = {
  asset: "BTC/USD",
  comparator: "above",
  strikeUsd: 81_000,
  horizon: Math.floor(Date.now() / 1000) + 24 * 3600,
  probabilityBp: 7_200,
  rationale: "funding flipped negative while spot held the range low",
  tier: "bronze",
};

const res = await fetch(`${API}/api/seal`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ ...call, privateKey: AGENT_KEY }),
});

if (!res.ok) {
  console.error("seal failed:", (await res.json()).error);
  process.exit(1);
}

const sealed = await res.json();

// The salt is the only thing that can open this later, and an unopened
// forecast is scored as maximally wrong. Persist it with the post.
console.log("sealed");
console.log("  commitment :", sealed.commitment);
console.log("  identity   :", sealed.reputationKey);
console.log("  bond       :", sealed.bondStrk, "STRK");
console.log("  SAVE SALT  :", sealed.salt);

// What the bot posts is unchanged, except it can now point at the commitment.
console.log("\npost this as normal:");
console.log(
  `  BTC above $${call.strikeUsd.toLocaleString()} in 24h · ${call.probabilityBp / 100}% confidence.\n` +
    `  Sealed before the fact: ${API}/f/${sealed.reputationKey}`,
);

// Anyone can check the record without asking the bot for anything.
const record = await fetch(`${API}/api/record/${sealed.reputationKey}`).then((r) => r.json());
console.log("\npublic record right now:");
console.log("  resolved  :", record.resolved);
console.log("  forfeited :", record.forfeited);
console.log(
  "  vs coin flip:",
  record.tested ? `${(record.skillVsCoinFlip * 100).toFixed(1)}%` : "untested",
);

// Everything an operator needs to fund this claim, and nothing more. Paste it
// into /agent in a browser holding a privacy wallet: the vault authenticates
// the agent's signature, so the operator funds a claim they cannot alter.
console.log("\nhand this to your operator (xence.vercel.app/agent):\n");
console.log(
  JSON.stringify(
    {
      reputationKey: sealed.reputationKey,
      commitment: sealed.commitment,
      questionId: sealed.questionId,
      salt: sealed.salt,
      rationaleHash: sealed.rationaleHash,
      probabilityBp: call.probabilityBp,
      tier: sealed.tier,
      horizon: sealed.horizon,
      signature: sealed.signature,
      question: sealed.question,
    },
    null,
    2,
  ),
);
