/** SCORING Xence measures calibration, not luck. */

/** The score of always saying "50%". */
export const REFERENCE_BRIER = 0.25;

/** Basis-point scale used on-chain. */
export const BP = 10_000;

/** Brier score for a single forecast. */
export function brier(probability: number, outcome: 0 | 1): number {
  const p = clamp01(probability);
  return (p - outcome) ** 2;
}

/** Integer mirror of `brier`, in basis points. */
export function brierBp(probabilityBp: number, outcome: 0 | 1): number {
  const p = Math.max(0, Math.min(BP, Math.round(probabilityBp)));
  const diff = p - outcome * BP;
  return Math.round((diff * diff) / BP);
}

/** Brier Skill Score against the coin-flip baseline. */
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

/** The forfeit rule — the mechanism the whole protocol rests on. */
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

/** Calibration curve: bucket forecasts by stated probability, then compare what they. */
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
  // Full return at or below the coin-flip baseline, scaling down to a 60% loss at maximum.
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

/** Human phrasing for a probability. */
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
