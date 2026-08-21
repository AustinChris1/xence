/**
 * Cross-language hash parity check.
 *
 * The commitment hash is computed in TypeScript when a forecast is sealed and
 * recomputed in Cairo when it is revealed. If those two ever disagree, every
 * commitment made by the frontend becomes permanently unrevealable — and an
 * unrevealable forecast is scored as maximally wrong and its bond is slashed.
 * That is the worst failure this codebase can have, so it gets its own test on
 * both sides of the boundary.
 *
 * Run:  node contracts/scripts/hash-parity.mjs
 *
 * Paste the printed values into the `parity` tests in src/vault.cairo.
 */

import { hash, shortString, num } from "../../web/node_modules/starknet/dist/index.mjs";

const TAG_COMMIT = shortString.encodeShortString("XENCE_COMMIT_V1");
const TAG_IDENTITY = shortString.encodeShortString("XENCE_IDENTITY_V1");
const TAG_QUESTION = shortString.encodeShortString("XENCE_QUESTION_V1");

// Fixed vector. Never change these numbers — change the code until it matches.
const asset = "BTC/USD";
const strikeUsd = 120_000;
const horizon = 1_759_190_400; // 2025-09-30T00:00:00Z
const comparator = "0x1"; // above
const probabilityBp = 7_200; // 72%
const salt = "0x1234567890abcdef";
const rationale = "Supply overhang clears after the September unlock.";

const strikeScaled = BigInt(Math.round(strikeUsd * 10 ** 8));

function hashRationale(text) {
  const bytes = new TextEncoder().encode(text.trim());
  const chunks = [];
  for (let i = 0; i < bytes.length; i += 31) {
    const slice = bytes.slice(i, i + 31);
    chunks.push(num.toHex(BigInt("0x" + Buffer.from(slice).toString("hex"))));
  }
  return hash.computePoseidonHashOnElements(chunks);
}

const questionId = hash.computePoseidonHashOnElements([
  TAG_QUESTION,
  shortString.encodeShortString(asset),
  num.toHex(strikeScaled),
  num.toHex(BigInt(horizon)),
  comparator,
]);

const rationaleHash = hashRationale(rationale);

const commitmentHash = hash.computePoseidonHashOnElements([
  TAG_COMMIT,
  questionId,
  num.toHex(BigInt(probabilityBp)),
  rationaleHash,
  salt,
]);

const authMessage = hash.computePoseidonHashOnElements([
  TAG_IDENTITY,
  commitmentHash,
  questionId,
  num.toHex(BigInt(horizon)),
  num.toHex(BigInt(2)), // gold
]);

console.log("TAG_COMMIT      ", TAG_COMMIT);
console.log("TAG_IDENTITY    ", TAG_IDENTITY);
console.log("TAG_QUESTION    ", TAG_QUESTION);
console.log("");
console.log("question_id     ", questionId);
console.log("rationale_hash  ", rationaleHash);
console.log("commitment_hash ", commitmentHash);
console.log("auth_message    ", authMessage);
