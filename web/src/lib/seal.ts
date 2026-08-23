/**
 * The Xence sealing SDK: everything needed to author a forecast from a key.
 *
 * No browser, no wallet, no viewing key, no funded account — the vault
 * authenticates authorship by signature and the pool does the submitting, so a
 * bot that already publishes predictions can seal them where it stands.
 *
 * Pure functions only. Nothing here touches window, React, or storage, so it
 * runs in a route handler, a worker, or someone else's backend.
 */

import { ec, hash, shortString, num } from "starknet";

export const TAG_COMMIT = shortString.encodeShortString("XENCE_COMMIT_V1");
export const TAG_QUESTION = shortString.encodeShortString("XENCE_QUESTION_V2");
export const TAG_IDENTITY = shortString.encodeShortString("XENCE_IDENTITY_V1");

/** Wallet-API FELT shape: a bare 0x0, or a first digit that is not zero. */
export const felt = (v: string | bigint | number): string => num.toHex(BigInt(v));

export const PRICE_DECIMALS = 8;
export type Comparator = "above" | "below";

export type QuestionKind = "price" | "metric";

export type Question = {
  /** Pragma pair for prices; a human label for metrics. */
  asset: string;
  comparator: Comparator;
  /** Whole USD for prices; whole token units for metrics. */
  strikeUsd: number;
  /** Unix seconds at which the value is read and the question resolves. */
  horizon: number;
  kind?: QuestionKind;
  /** METRIC only: the ERC-20 whose balance is read. */
  subject?: string;
  /** METRIC only: the address whose balance settles the question. */
  holder?: string;
  /** METRIC only: token decimals for scaling the strike. */
  decimals?: number;
};

export function kindFelt(q: Question): string {
  return (q.kind ?? "price") === "metric" ? "0x1" : "0x0";
}

export function subjectFelt(q: Question): string {
  return (q.kind ?? "price") === "metric"
    ? felt(q.subject ?? "0")
    : shortString.encodeShortString(q.asset);
}

export function holderFelt(q: Question): string {
  return (q.kind ?? "price") === "metric" ? felt(q.holder ?? "0") : "0x0";
}

export type SealedForecast = {
  questionId: string;
  commitmentHash: string;
  probabilityBp: number;
  rationaleHash: string;
  salt: string;
};

export function comparatorFelt(c: Comparator): string {
  return c === "above" ? "0x1" : "0x0";
}

export function strikeScaled(q: Question): bigint {
  if ((q.kind ?? "price") === "metric") {
    return BigInt(Math.round(q.strikeUsd)) * 10n ** BigInt(q.decimals ?? 18);
  }
  return BigInt(Math.round(q.strikeUsd * 10 ** PRICE_DECIMALS));
}

/** Mirrors the vault's compute_question_id — recomputed and asserted on-chain. */
export function questionId(q: Question): string {
  return hash.computePoseidonHashOnElements([
    TAG_QUESTION,
    kindFelt(q),
    subjectFelt(q),
    holderFelt(q),
    felt(strikeScaled(q)),
    felt(q.horizon),
    comparatorFelt(q.comparator),
  ]);
}

/** Poseidon over the thesis. The text itself never goes on-chain. */
export function hashRationale(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "0x0";
  const bytes = new TextEncoder().encode(trimmed);
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += 31) {
    const slice = bytes.slice(i, i + 31);
    chunks.push(felt(BigInt("0x" + Buffer.from(slice).toString("hex"))));
  }
  return hash.computePoseidonHashOnElements(chunks);
}

export function randomSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(31));
  return felt(BigInt("0x" + Buffer.from(bytes).toString("hex")));
}

/**
 * Without the salt the probability field has 10_001 possible values, so anyone
 * could brute-force the commitment the moment it lands and the seal would be
 * decorative.
 */
export function sealForecast(
  q: Question,
  probabilityBp: number,
  rationale: string,
  salt: string = randomSalt(),
): SealedForecast {
  const qid = questionId(q);
  const rationaleHash = hashRationale(rationale);
  return {
    questionId: qid,
    probabilityBp,
    rationaleHash,
    salt,
    commitmentHash: hash.computePoseidonHashOnElements([
      TAG_COMMIT,
      qid,
      felt(Math.round(probabilityBp)),
      rationaleHash,
      salt,
    ]),
  };
}

/** Binds a commitment to its question, horizon and tier, so a signature cannot be replayed onto a cheaper call. */
export function authMessage(
  commitmentHash: string,
  qid: string,
  horizon: number,
  tierIndex: number,
): string {
  return hash.computePoseidonHashOnElements([
    TAG_IDENTITY,
    commitmentHash,
    qid,
    felt(horizon),
    felt(tierIndex),
  ]);
}

export function reputationKeyFor(privateKey: string): string {
  return felt(ec.starkCurve.getStarkKey(normaliseKey(privateKey)));
}

export function signForecast(
  privateKey: string,
  sealed: SealedForecast,
  horizon: number,
  tierIndex: number,
): { r: string; s: string } {
  const msg = authMessage(sealed.commitmentHash, sealed.questionId, horizon, tierIndex);
  const sig = ec.starkCurve.sign(msg, normaliseKey(privateKey));
  return { r: felt(sig.r), s: felt(sig.s) };
}

/**
 * Verify exactly what the vault will check, before anyone pays a fee.
 *
 * Cairo's `check_ecdsa_signature` takes the STARK key (the x-coordinate), but
 * starknet.js `verify` needs the full point — passing the former returns false
 * against a signature the chain accepts.
 */
export function verifyForecast(
  reputationKey: string,
  sealed: SealedForecast,
  horizon: number,
  tierIndex: number,
  signature: { r: string; s: string },
): boolean {
  const msg = authMessage(sealed.commitmentHash, sealed.questionId, horizon, tierIndex);
  return recoverPoint(reputationKey, msg, signature) !== null;
}

/**
 * The vault stores only the x-coordinate, so try both parities: whichever
 * verifies is the signer, and a key that did not sign matches neither.
 */
function recoverPoint(
  starkKey: string,
  msg: string,
  sig: { r: string; s: string },
): string | null {
  const s = { r: BigInt(sig.r), s: BigInt(sig.s) } as never;
  for (const parity of ["02", "03"]) {
    const point = parity + BigInt(starkKey).toString(16).padStart(64, "0");
    try {
      if (ec.starkCurve.verify(s, msg, point)) return point;
    } catch {
      /* wrong parity */
    }
  }
  return null;
}

export function normaliseKey(key: string): string {
  const k = key.trim();
  return k.startsWith("0x") ? k : `0x${k}`;
}
