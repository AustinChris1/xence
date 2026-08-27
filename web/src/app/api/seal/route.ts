import { NextResponse } from "next/server";
import {
  felt,
  sealForecast,
  signForecast,
  strikeScaled,
  comparatorFelt,
  kindFelt,
  subjectFelt,
  holderFelt,
  verifyForecast,
  reputationKeyFor,
  type Comparator,
  type Question,
  type QuestionKind,
} from "@/lib/seal";
import { STRK_TOKEN, VAULT_ADDRESS, VAULT_V2 } from "@/lib/config";
import { TIERS, TIER_ORDER, type Tier } from "@/lib/scoring";

/**
 * Seal a forecast from wherever predictions already happen, so nobody has to
 * visit Xence. Stateless, never sees a wallet: send `privateKey` and it signs,
 * or send `reputationKey` with a `signature` and it only verifies.
 */

export const runtime = "nodejs";

type Body = {
  asset: string;
  comparator: Comparator;
  /** Whole USD for prices; whole token units for metrics. */
  strikeUsd: number;
  horizon: number;
  /** "price" (default), or "metric" for any ERC-20 balance read at the horizon. */
  kind?: QuestionKind;
  subject?: string;
  holder?: string;
  decimals?: number;
  probabilityBp: number;
  rationale?: string;
  tier?: Tier;
  privateKey?: string;
  reputationKey?: string;
  salt?: string;
  signature?: { r: string; s: string };
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }

  const problem = validate(body);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const tier: Tier = body.tier ?? "bronze";
  const tierIndex = TIER_ORDER.indexOf(tier);
  const question: Question = {
    asset: body.asset,
    comparator: body.comparator,
    strikeUsd: body.strikeUsd,
    horizon: body.horizon,
    kind: body.kind ?? "price",
    subject: body.subject,
    holder: body.holder,
    decimals: body.decimals,
  };

  const sealed = sealForecast(
    question,
    body.probabilityBp,
    body.rationale ?? "",
    body.salt,
  );

  let reputationKey: string;
  let signature: { r: string; s: string };

  if (body.privateKey) {
    reputationKey = reputationKeyFor(body.privateKey);
    signature = signForecast(body.privateKey, sealed, body.horizon, tierIndex);
  } else if (body.reputationKey && body.signature) {
    reputationKey = felt(body.reputationKey);
    signature = body.signature;
    // Reject here rather than let the chain reject it after a fee is paid.
    if (!verifyForecast(reputationKey, sealed, body.horizon, tierIndex, signature)) {
      return NextResponse.json(
        { error: "Signature does not match this forecast and key." },
        { status: 400 },
      );
    }
  } else {
    return NextResponse.json(
      { error: "Send either privateKey, or reputationKey with signature." },
      { status: 400 },
    );
  }

  const bond = BigInt(TIERS[tier].bond) * 10n ** 18n;

  return NextResponse.json({
    reputationKey,
    commitment: sealed.commitmentHash,
    questionId: sealed.questionId,
    /** Keep this. Without it the forecast can never be opened, and unopened means forfeited. */
    salt: sealed.salt,
    rationaleHash: sealed.rationaleHash,
    tier,
    bondStrk: TIERS[tier].bond,
    horizon: body.horizon,
    /** Ready to submit through the STRK20 pool as a withdraw + invoke pair. */
    pool: {
      vault: felt(VAULT_ADDRESS),
      token: felt(STRK_TOKEN),
      withdraw: { amount: felt(bond), recipient: felt(VAULT_ADDRESS) },
      calldata: [
        "0x0",
        sealed.commitmentHash,
        felt(STRK_TOKEN),
        felt(bond),
        reputationKey,
        signature.r,
        signature.s,
        sealed.questionId,
        ...(VAULT_V2 ? [kindFelt(question), subjectFelt(question), holderFelt(question)] : [subjectFelt(question)]),
        felt(strikeScaled(question)),
        felt(body.horizon),
        comparatorFelt(body.comparator),
        felt(tierIndex),
        "0x0",
        "0x0",
        "0x0",
        "0x0",
      ],
    },
  });
}

function validate(b: Body): string | null {
  if ((b.kind ?? "price") === "metric" && !VAULT_V2)
    return "metric questions need the v2 vault, which is not deployed yet.";
  if ((b.kind ?? "price") === "metric") {
    if (!/^0x[0-9a-fA-F]+$/.test(b.subject ?? ""))
      return "metric questions need subject: the ERC-20 whose balance is read.";
    if (!/^0x[0-9a-fA-F]+$/.test(b.holder ?? ""))
      return "metric questions need holder: the address whose balance settles it.";
    if (!Number.isInteger(b.decimals) || (b.decimals ?? -1) < 0 || (b.decimals ?? 99) > 36)
      return "metric questions need decimals for the strike scale.";
  } else if (!b.asset || !b.asset.includes("/")) {
    return "asset must be a pair like BTC/USD.";
  }
  if (b.comparator !== "above" && b.comparator !== "below")
    return "comparator must be above or below.";
  if (!Number.isFinite(b.strikeUsd) || b.strikeUsd <= 0)
    return "strikeUsd must be a positive number.";
  if (!Number.isInteger(b.horizon)) return "horizon must be a unix timestamp in seconds.";
  if (b.horizon <= Math.floor(Date.now() / 1000))
    return "horizon must be in the future; a forecast about the past is not one.";
  if (!Number.isInteger(b.probabilityBp) || b.probabilityBp < 100 || b.probabilityBp > 9900)
    return "probabilityBp must be between 100 and 9900; 0 or 100% claims infinite certainty.";
  if (b.tier && !TIER_ORDER.includes(b.tier)) return `tier must be one of ${TIER_ORDER.join(", ")}.`;
  return null;
}
