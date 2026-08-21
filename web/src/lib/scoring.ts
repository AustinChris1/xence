/**
 * SCORING
 *
 * Xence measures calibration, not luck. A forecaster who says "70%" should be
 * right about 70% of the time — no more, no less. Saying "99%" and being right
 * is only impressive if you are never wrong when you say it.
 *
 * The Brier score is the standard proper scoring rule for this: it is minimised
 * only by reporting your true belief, so there is no strategy that beats
 * honesty. That property is the entire reason this protocol can work.
 *
 * All on-chain values are integers in basis points (0..10_000) because Cairo has
 * no floats. These helpers are the JS mirror of `contracts/src/scoring.cairo`
 * and the two must agree exactly — see the parity test in that file's comments.
 */

/** The score of always saying "50%". Any real forecaster must beat this. */
export const REFERENCE_BRIER = 0.25;

/** Basis-point scale used on-chain. 10_000 bp = 1.0 = 100%. */
export const BP = 10_000;

/**
 * Brier score for a single forecast. Lower is better.
 *   0.00 — called it perfectly with full confidence
 *   0.25 — the coin-flip baseline
 *   1.00 — maximally, confidently wrong
 */
export function brier(probability: number, outcome: 0 | 1): number {
  const p = clamp01(probability);
  return (p - outcome) ** 2;
}

/** Integer mirror of `brier`, in basis points. Matches the Cairo implementation. */
export function brierBp(probabilityBp: number, outcome: 0 | 1): number {
  const p = Math.max(0, Math.min(BP, Math.round(probabilityBp)));
  const diff = p - outcome * BP;
  return Math.round((diff * diff) / BP);
}

/**
 * Brier Skill Score against the coin-flip baseline.
 *   > 0  better than guessing
 *   = 0  indistinguishable from guessing
 *   < 0  actively worse than guessing (this happens more than people admit)
 *
 * This is the headline number on a profile, because "0.19 Brier" means nothing
 * to a reader while "+24% better than a coin flip" does.
 */
export function skillScore(meanBrier: number): number {
  return 1 - meanBrier / REFERENCE_BRIER;
}

/**
 * Conviction tiers. The exact bond and the wallet that funded it stay private
 * inside the pool; only the band is public. This is the deliberate compromise
 * that keeps a whale from simply buying a louder reputation — the ceiling is
 * fixed for everyone, so conviction is capped and comparable.
 *
 * Bonds are denominated in STRK and sized ABOVE the pool's flat per-operation
 * fee (4 STRK on mainnet). A bond smaller than the fee to place it is not a
 * commitment, it is a rounding error, and it would make the cheapest tier
 * meaningless as a signal.
 */
export type Tier = "bronze" | "silver" | "gold";

export const TIERS: Record<
  Tier,
  { label: string; bond: number; weight: number; blurb: string }
> = {
  bronze: {
    label: "Bronze",
    bond: 5,
    weight: 1,
    blurb: "A routine call. Cheap to make, cheap to be wrong about.",
  },
  silver: {
    label: "Silver",
    bond: 25,
    weight: 3,
    blurb: "A call you would defend in public.",
  },
  gold: {
    label: "Gold",
    bond: 100,
    weight: 8,
    blurb: "A call you are willing to be remembered for.",
  },
};

export const TIER_ORDER: Tier[] = ["bronze", "silver", "gold"];

/**
 * The forfeit rule — the mechanism the whole protocol rests on.
 *
 * If a forecast is never revealed after its horizon passes, it is NOT quietly
 * dropped. It is scored as the worst possible forecast (Brier 1.0) and the bond
 * is slashed to the research pool.
 *
 * This is the part that makes a Xence track record mean something. Every
 * "I called it" thread on the internet is survivorship bias: the misses are
 * deleted. Here, deleting a miss is the single most expensive thing you can do,
 * because silence scores worse than being wrong out loud.
 */
export const FORFEIT_BRIER = 1.0;

/** Grace period after horizon in which only the forecaster may reveal. */
export const REVEAL_WINDOW_SECONDS = 48 * 60 * 60;

export type ResolvedForecast = {
  probabilityBp: number;
  outcome: 0 | 1;
  tier: Tier;
  /** True when the horizon passed with no reveal — scored at the maximum. */
  forfeited?: boolean;
};

/** Weighted mean Brier across a forecaster's resolved history. */
export function meanBrier(forecasts: ResolvedForecast[]): number {
  if (forecasts.length === 0) return REFERENCE_BRIER;
  let weighted = 0;
  let totalWeight = 0;
  for (const f of forecasts) {
    const w = TIERS[f.tier].weight;
    const score = f.forfeited
      ? FORFEIT_BRIER
      : brier(f.probabilityBp / BP, f.outcome);
    weighted += score * w;
    totalWeight += w;
  }
  return weighted / totalWeight;
}

/**
 * Calibration curve: bucket forecasts by stated probability, then compare what
 * they claimed against what actually happened. A perfectly calibrated
 * forecaster's points sit on the 45° line — the diagonal in our logo.
 */
export type CalibrationBin = {
  bucket: number; // bin centre, 0..1
  claimed: number; // mean stated probability in this bin
  observed: number; // fraction that actually resolved true
  count: number;
};

export function calibrationCurve(
  forecasts: ResolvedForecast[],
  bins = 5,
): CalibrationBin[] {
  const buckets: { sum: number; hits: number; n: number }[] = Array.from(
    { length: bins },
    () => ({ sum: 0, hits: 0, n: 0 }),
  );

  for (const f of forecasts) {
    if (f.forfeited) continue; // no stated probability to bucket against
    const p = clamp01(f.probabilityBp / BP);
    const idx = Math.min(bins - 1, Math.floor(p * bins));
    buckets[idx].sum += p;
    buckets[idx].hits += f.outcome;
    buckets[idx].n += 1;
  }

  return buckets.map((b, i) => ({
    bucket: (i + 0.5) / bins,
    claimed: b.n ? b.sum / b.n : (i + 0.5) / bins,
    observed: b.n ? b.hits / b.n : 0,
    count: b.n,
  }));
}

/**
 * Bond settlement. Calibrated forecasters recover their bond and take a cut of
 * the research pool; badly-wrong high-conviction calls lose part of the bond
 * into it. Returned in basis points of the original bond.
 */
export function settlementBp(brierScore: number): number {
  // Full return at or below the coin-flip baseline, scaling down to a 60% loss
  // at maximum wrongness. Being merely uncertain costs nothing; being
  // confidently wrong is what costs.
  if (brierScore <= REFERENCE_BRIER) {
    const bonus = ((REFERENCE_BRIER - brierScore) / REFERENCE_BRIER) * 0.2;
    return Math.round((1 + bonus) * BP);
  }
  const excess = (brierScore - REFERENCE_BRIER) / (1 - REFERENCE_BRIER);
  return Math.round((1 - excess * 0.6) * BP);
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/** Human phrasing for a probability. Used in receipts and cards. */
export function describeConfidence(p: number): string {
  if (p >= 0.95) return "near-certain";
  if (p >= 0.8) return "confident";
  if (p >= 0.65) return "leaning";
  if (p >= 0.55) return "slight edge";
  if (p > 0.45) return "a coin flip";
  if (p > 0.35) return "leaning against";
  if (p > 0.2) return "doubtful";
  return "near-certain against";
}
