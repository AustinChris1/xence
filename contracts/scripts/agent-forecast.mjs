/**
 * Author a forecast as an autonomous agent — no wallet, no browser.
 *
 *   node contracts/scripts/agent-forecast.mjs
 *
 * XenceVault authenticates AUTHORSHIP with a STARK-curve signature over the
 * commitment, while SUBMISSION is done by the privacy pool. Those are separate
 * concerns, so whoever pays and submits is irrelevant to whose record it is.
 *
 * That is what makes Xence usable by software. An agent needs a key it can
 * sign with — not a viewing key, not a browser extension, not a funded account.
 * It signs offline; any operator relays the result; the score accrues to the
 * agent's key.
 */

import { ec, hash, shortString, num } from "../../web/node_modules/starknet/dist/index.mjs";

const TAG_COMMIT = shortString.encodeShortString("XENCE_COMMIT_V1");
const TAG_QUESTION = shortString.encodeShortString("XENCE_QUESTION_V1");
const TAG_IDENTITY = shortString.encodeShortString("XENCE_IDENTITY_V1");
const felt = (v) => num.toHex(BigInt(v));

/** A forecast an agent wants on the record. */
const forecast = {
  asset: "BTC/USD",
  comparator: 1, // 1 = above, 0 = below
  strikeUsd: 79_000,
  horizon: Math.floor(Date.now() / 1000) + 3600,
  probabilityBp: 7_200, // 72%
  rationale: "funding flipped negative while spot held the range low",
  tier: 0, // bronze
};

// An agent's identity is one scalar. It never leaves the agent.
const privateKey =
  process.env.XENCE_AGENT_KEY ??
  num.toHex(
    BigInt("0x" + Buffer.from(ec.starkCurve.utils.randomPrivateKey()).toString("hex")),
  );
// The reputation key is the STARK key (the point's x-coordinate) — that is
// what Cairo's check_ecdsa_signature takes, and what goes on-chain.
const reputationKey = num.toHex(BigInt(ec.starkCurve.getStarkKey(privateKey)));
// Local verification needs the full point instead; passing the x-coordinate
// here returns false against a signature the chain accepts.
const fullPublicKey = ec.starkCurve.getPublicKey(privateKey);

const questionId = hash.computePoseidonHashOnElements([
  TAG_QUESTION,
  shortString.encodeShortString(forecast.asset),
  felt(BigInt(Math.round(forecast.strikeUsd * 1e8))),
  felt(forecast.horizon),
  felt(forecast.comparator),
]);

const rationaleHash = hashText(forecast.rationale);
const salt = num.toHex(
  BigInt("0x" + Buffer.from(crypto.getRandomValues(new Uint8Array(31))).toString("hex")),
);

const commitmentHash = hash.computePoseidonHashOnElements([
  TAG_COMMIT,
  questionId,
  felt(forecast.probabilityBp),
  rationaleHash,
  salt,
]);

// The message the vault reconstructs. It binds the commitment to a question,
// a horizon and a tier, so a signature cannot be lifted onto a cheaper call.
const authMessage = hash.computePoseidonHashOnElements([
  TAG_IDENTITY,
  commitmentHash,
  questionId,
  felt(forecast.horizon),
  felt(forecast.tier),
]);

const sig = ec.starkCurve.sign(authMessage, privateKey);

// Verify exactly as `check_ecdsa_signature` does on-chain, before spending gas.
const valid = ec.starkCurve.verify(sig, authMessage, fullPublicKey);

console.log("agent identity");
console.log("  reputation key :", reputationKey);
console.log("  wallet needed  : none");
console.log("");
console.log("sealed forecast");
console.log("  question       :", `${forecast.asset} above $${forecast.strikeUsd.toLocaleString()}`);
console.log("  probability    :", `${forecast.probabilityBp / 100}%  (hidden until reveal)`);
console.log("  commitment     :", commitmentHash);
console.log("  question id    :", questionId);
console.log("");
console.log("signature verifies against the on-chain rule:", valid ? "YES" : "NO");
console.log("");
console.log("calldata for any operator to submit through the pool:");
console.log(
  JSON.stringify(
    [
      "0x0", // Commit
      commitmentHash,
      "<STRK token>",
      "<bond amount>",
      reputationKey,
      num.toHex(sig.r),
      num.toHex(sig.s),
      questionId,
      shortString.encodeShortString(forecast.asset),
      felt(BigInt(Math.round(forecast.strikeUsd * 1e8))),
      felt(forecast.horizon),
      felt(forecast.comparator),
      felt(forecast.tier),
      "0x0",
      "0x0",
      "0x0",
      "0x0",
    ],
    null,
    2,
  ),
);
console.log("");
console.log("keep to reveal later (losing these forfeits the bond):");
console.log("  salt          :", salt);
console.log("  probabilityBp :", forecast.probabilityBp);
console.log("  rationaleHash :", rationaleHash);

function hashText(text) {
  const bytes = new TextEncoder().encode(text.trim());
  const chunks = [];
  for (let i = 0; i < bytes.length; i += 31) {
    chunks.push(felt(BigInt("0x" + Buffer.from(bytes.slice(i, i + 31)).toString("hex"))));
  }
  return hash.computePoseidonHashOnElements(chunks);
}
