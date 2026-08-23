/** FORECASTS: identity, questions, and the commitment scheme. */

import { ec, hash, shortString, num } from "starknet";
import { BP, type Tier } from "./scoring";
import * as store from "./localStore";

/* Domain separation tags. */

export const TAG_COMMIT = shortString.encodeShortString("XENCE_COMMIT_V1");
export const TAG_QUESTION = shortString.encodeShortString("XENCE_QUESTION_V2");
export const TAG_IDENTITY = shortString.encodeShortString("XENCE_IDENTITY_V1");

/* Identity A forecaster is a STARK-curve public key, not a wallet address. */

export type Identity = {
  /** Hex private key. */
  privateKey: string;
  /** The public reputation key. */
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

/** A short, human-sayable handle for a reputation key. */
export function handleFor(reputationKey: string): string {
  const h = BigInt(reputationKey).toString(16).padStart(64, "0");
  return `${h.slice(0, 4)}·${h.slice(-4)}`.toUpperCase();
}

/* Questions MVP questions are deterministically settleable from a Pragma price feed at a. */

export type Asset = string;

/** Pragma reports USD pairs with 8 decimals. */
export const PRICE_DECIMALS = 8;

export type Comparator = "above" | "below";

export type QuestionKind = "price" | "metric";

export type Question = {
  /** Pragma pair for prices; a human label for metrics. */
  asset: Asset;
  comparator: Comparator;
  /** Whole USD for prices; whole token units for metrics. */
  strikeUsd: number;
  /** Unix seconds at which the value is read and the question resolves. */
  horizon: number;
  /** Defaults to "price". */
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
    ? num.toHex(BigInt(q.subject ?? "0"))
    : shortString.encodeShortString(q.asset);
}

export function holderFelt(q: Question): string {
  return (q.kind ?? "price") === "metric" ? num.toHex(BigInt(q.holder ?? "0")) : "0x0";
}

export function comparatorFelt(c: Comparator): string {
  return c === "above" ? "0x1" : "0x0";
}

export function strikeScaled(q: Question): bigint {
  if ((q.kind ?? "price") === "metric") {
    // Whole-unit strikes scaled in bigint space — 3M STRK is 3e24 raw, far
    // past what a float can hold exactly.
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
    num.toHex(strikeScaled(q)),
    num.toHex(BigInt(q.horizon)),
    comparatorFelt(q.comparator),
  ]);
}

export function describeQuestion(q: Question): string {
  if ((q.kind ?? "price") === "metric") {
    return `${q.asset} ${q.comparator} ${q.strikeUsd.toLocaleString()}`;
  }
  const strike = q.strikeUsd.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: q.strikeUsd < 10 ? 2 : 0,
  });
  const base = q.asset.split("/")[0];
  return `${base} ${q.comparator} ${strike}`;
}

/* The commitment A sealed forecast is `poseidon(TAG, question_id, probability_bp. */

export type SealedForecast = {
  questionId: string;
  probabilityBp: number;
  /** Poseidon hash of the written thesis. */
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

/** Signature authorising this commitment under a reputation key. */
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

/* Local vault of secrets. */

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
