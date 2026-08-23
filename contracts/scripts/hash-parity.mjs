/**
 * Cross-language hash parity vectors.
 *
 *   node contracts/scripts/hash-parity.mjs
 *
 * The commitment is built in TypeScript when sealing and rebuilt in Cairo on
 * reveal; the question id is built in TypeScript and re-derived on-chain at
 * commit. If either pair ever disagrees, forecasts become unrevealable or
 * unsealable — so both sides pin the same fixed vectors. Never change the
 * inputs here; change the code until it reproduces them.
 */

import { hash, shortString, num } from "../../web/node_modules/starknet/dist/index.mjs";

const TAG_COMMIT = shortString.encodeShortString("XENCE_COMMIT_V1");
const TAG_IDENTITY = shortString.encodeShortString("XENCE_IDENTITY_V1");
const TAG_QUESTION = shortString.encodeShortString("XENCE_QUESTION_V2");
const felt = (v) => num.toHex(BigInt(v));

// Fixed vector — a price question.
const price = {
  kind: 0,
  subject: shortString.encodeShortString("BTC/USD"),
  holder: "0x0",
  strike: 120_000 * 1e8,
  horizon: 1_759_190_400,
  comparator: 1,
};

// Fixed vector — a metric question: STRK held by the STRK20 pool.
const metric = {
  kind: 1,
  subject: "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  holder: "0x40337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a",
  strike: 3_000_000n * 10n ** 18n, // 3M STRK — u128-range raw units
  horizon: 1_759_190_400,
  comparator: 1,
};

const qid = (q) =>
  hash.computePoseidonHashOnElements([
    TAG_QUESTION,
    felt(q.kind),
    q.subject,
    q.holder,
    felt(q.strike),
    felt(q.horizon),
    felt(q.comparator),
  ]);

const priceQid = qid(price);
const metricQid = qid(metric);

const probabilityBp = 7200;
const salt = "0x1234567890abcdef";
const rationaleHash = hashText("Supply overhang clears after the September unlock.");

const commitment = hash.computePoseidonHashOnElements([
  TAG_COMMIT,
  priceQid,
  felt(probabilityBp),
  rationaleHash,
  salt,
]);

const auth = hash.computePoseidonHashOnElements([
  TAG_IDENTITY,
  commitment,
  priceQid,
  felt(price.horizon),
  felt(2), // gold
]);

console.log("TAG_QUESTION (v2):", TAG_QUESTION);
console.log("");
console.log("price question_id :", priceQid);
console.log("metric question_id:", metricQid);
console.log("rationale_hash    :", rationaleHash);
console.log("commitment        :", commitment);
console.log("auth_message      :", auth);

function hashText(text) {
  const bytes = new TextEncoder().encode(text.trim());
  const chunks = [];
  for (let i = 0; i < bytes.length; i += 31) {
    chunks.push(felt(BigInt("0x" + Buffer.from(bytes.slice(i, i + 31)).toString("hex"))));
  }
  return hash.computePoseidonHashOnElements(chunks);
}
