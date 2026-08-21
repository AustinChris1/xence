/**
 * FORECASTS: identity, questions, and the commitment scheme.
 *
 * The three hashes in this file are the load-bearing part of the protocol and
 * each has an exact mirror in `contracts/src/`. If you change a domain tag here
 * you must change it there, or every commitment made by this frontend becomes
 * unrevealable.
 */

import { ec, hash, shortString, num } from "starknet";
import { BP, type Tier } from "./scoring";
import * as store from "./localStore";

/* ---------------------------------------------------------------------------
 * Domain separation tags. Cairo short strings, ≤ 31 chars.
 * ------------------------------------------------------------------------- */

export const TAG_COMMIT = shortString.encodeShortString("XENCE_COMMIT_V1");
export const TAG_QUESTION = shortString.encodeShortString("XENCE_QUESTION_V1");
export const TAG_IDENTITY = shortString.encodeShortString("XENCE_IDENTITY_V1");

/* ---------------------------------------------------------------------------
 * Identity
 *
 * A forecaster is a STARK-curve public key, not a wallet address. The key is
 * generated in the browser, never leaves it, and is the only thing a track
 * record is attached to.
 *
 * Why a signature rather than simply naming the key in calldata: invoke
 * calldata is public. If the vault trusted a bare `reputation_key` argument,
 * anyone could commit deliberately terrible forecasts under a rival's key and
 * tank a reputation they do not own. Requiring a signature over the commitment
 * means only the key holder can add to that key's history — while the calldata
 * still reveals nothing about who they are.
 * ------------------------------------------------------------------------- */

export type Identity = {
  /** Hex private key. Stays client-side. Losing it means losing the pseudonym. */
  privateKey: string;
  /** The public reputation key. This is the forecaster's permanent name. */
  reputationKey: string;
};

export function createIdentity(): Identity {
  const privateKey = num.toHex(
    BigInt("0x" + Buffer.from(ec.starkCurve.utils.randomPrivateKey()).toString("hex")),
  );
  return { privateKey, reputationKey: reputationKeyFor(privateKey) };
}

export function reputationKeyFor(privateKey: string): string {
  return num.toHex(BigInt(ec.starkCurve.getStarkKey(privateKey)));
}

/**
 * A short, human-sayable handle for a reputation key. Deterministic, so the
 * same pseudonym always renders the same way across the leaderboard, profiles
 * and receipts.
 */
export function handleFor(reputationKey: string): string {
  const h = BigInt(reputationKey).toString(16).padStart(64, "0");
  return `${h.slice(0, 4)}·${h.slice(-4)}`.toUpperCase();
}

/* ---------------------------------------------------------------------------
 * Questions
 *
 * MVP questions are deterministically settleable from a Pragma price feed at a
 * fixed timestamp — no committee, no dispute window, no oracle governance. If
 * a question cannot be resolved by a number on-chain, it does not belong in
 * v1, however interesting it is.
 * ------------------------------------------------------------------------- */

export const ASSETS = ["BTC/USD", "ETH/USD", "STRK/USD"] as const;
export type Asset = (typeof ASSETS)[number];

/** Pragma reports USD pairs with 8 decimals. */
export const PRICE_DECIMALS = 8;

export type Comparator = "above" | "below";

export type Question = {
  asset: Asset;
  comparator: Comparator;
  /** Strike in whole USD, e.g. 120_000. */
  strikeUsd: number;
  /** Unix seconds at which the price is read and the question resolves. */
  horizon: number;
};

export function comparatorFelt(c: Comparator): string {
  return c === "above" ? "0x1" : "0x0";
}

export function strikeScaled(strikeUsd: number): bigint {
  return BigInt(Math.round(strikeUsd * 10 ** PRICE_DECIMALS));
}

/** `poseidon(TAG_QUESTION, pair_id, strike, horizon, comparator)` */
export function questionId(q: Question): string {
  return hash.computePoseidonHashOnElements([
    TAG_QUESTION,
    shortString.encodeShortString(q.asset),
    num.toHex(strikeScaled(q.strikeUsd)),
    num.toHex(BigInt(q.horizon)),
    comparatorFelt(q.comparator),
  ]);
}

export function describeQuestion(q: Question): string {
  const strike = q.strikeUsd.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: q.strikeUsd < 10 ? 2 : 0,
  });
  const base = q.asset.split("/")[0];
  return `${base} ${q.comparator} ${strike}`;
}

/* ---------------------------------------------------------------------------
 * The commitment
 *
 * A sealed forecast is `poseidon(TAG, question_id, probability_bp,
 * rationale_hash, salt)`. Nothing about the call is on-chain until reveal —
 * not the probability, not the thesis, not even which direction it leans.
 *
 * The salt matters more than it looks. Without it, the probability field has
 * only 10_001 possible values, so anyone could brute-force the commitment
 * immediately and the seal would be decorative.
 * ------------------------------------------------------------------------- */

export type SealedForecast = {
  questionId: string;
  probabilityBp: number;
  /** Poseidon hash of the written thesis. The text itself lives off-chain. */
  rationaleHash: string;
  salt: string;
  commitmentHash: string;
};

export function randomSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(31));
  return num.toHex(BigInt("0x" + Buffer.from(bytes).toString("hex")));
}

export function hashRationale(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "0x0";
  // Chunk into Cairo-safe felts (31 bytes each) and Poseidon the span.
  const bytes = new TextEncoder().encode(trimmed);
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += 31) {
    const slice = bytes.slice(i, i + 31);
    chunks.push(num.toHex(BigInt("0x" + Buffer.from(slice).toString("hex"))));
  }
  return hash.computePoseidonHashOnElements(chunks);
}

export function sealForecast(
  q: Question,
  probabilityBp: number,
  rationale: string,
  salt = randomSalt(),
): SealedForecast {
  const qid = questionId(q);
  const rationaleHash = hashRationale(rationale);
  const commitmentHash = hash.computePoseidonHashOnElements([
    TAG_COMMIT,
    qid,
    num.toHex(BigInt(Math.round(probabilityBp))),
    rationaleHash,
    salt,
  ]);
  return { questionId: qid, probabilityBp, rationaleHash, salt, commitmentHash };
}

/**
 * Signature authorising this commitment under a reputation key.
 * Signed over `poseidon(TAG_IDENTITY, commitment_hash, question_id, horizon, tier)`
 * so a signature cannot be lifted onto a different question or a cheaper tier.
 */
export function authMessageHash(
  commitmentHash: string,
  qid: string,
  horizon: number,
  tierIndex: number,
): string {
  return hash.computePoseidonHashOnElements([
    TAG_IDENTITY,
    commitmentHash,
    qid,
    num.toHex(BigInt(horizon)),
    num.toHex(BigInt(tierIndex)),
  ]);
}

export function signCommitment(
  identity: Identity,
  commitmentHash: string,
  qid: string,
  horizon: number,
  tierIndex: number,
): { r: string; s: string } {
  const msgHash = authMessageHash(commitmentHash, qid, horizon, tierIndex);
  const sig = ec.starkCurve.sign(msgHash, identity.privateKey);
  return { r: num.toHex(sig.r), s: num.toHex(sig.s) };
}

export const TIER_INDEX: Record<Tier, number> = {
  bronze: 0,
  silver: 1,
  gold: 2,
};

/* ---------------------------------------------------------------------------
 * Local vault of secrets.
 *
 * The salt and thesis are the only things that can open a commitment. They are
 * deliberately NOT on-chain, which means losing them makes a forecast
 * unrevealable — and an unrevealed forecast is scored as maximally wrong. The
 * UI has to be loud about this, and the export flow is not optional polish.
 * ------------------------------------------------------------------------- */

export type StoredForecast = SealedForecast & {
  question: Question;
  tier: Tier;
  rationale: string;
  reputationKey: string;
  committedAt: number;
  txHash?: string;
  revealedAt?: number;
  revealTxHash?: string;
};

export function loadIdentity(): Identity | null {
  if (typeof window === "undefined") return null;
  return store.identitySnapshot();
}

export function saveIdentity(identity: Identity) {
  store.write(store.ID_KEY, JSON.stringify(identity));
}

export function loadForecasts(): StoredForecast[] {
  if (typeof window === "undefined") return [];
  return store.forecastsSnapshot();
}

export function saveForecast(f: StoredForecast) {
  const all = loadForecasts();
  const next = [f, ...all.filter((x) => x.commitmentHash !== f.commitmentHash)];
  store.write(store.STORE_KEY, JSON.stringify(next));
}

export function probabilityLabel(bp: number): string {
  return `${(bp / BP * 100).toFixed(0)}%`;
}
