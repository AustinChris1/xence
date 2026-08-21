//! Scoring.
//!
//! Xence measures calibration, not luck. A forecaster who says "70%" should be
//! right about 70% of the time — no more, no less.
//!
//! The Brier score is the standard proper scoring rule for this: it is
//! minimised only by reporting your true belief, so no hedging strategy beats
//! honesty. That property is the reason this protocol can work at all, and it
//! is why the maths lives on-chain rather than in a backend someone has to
//! trust.
//!
//! Everything is integer basis points because Cairo has no floats. This module
//! is the exact mirror of `web/src/lib/scoring.ts`; the two must agree or a
//! forecaster's score will differ between the preview and the settlement.

/// 10_000 bp = 1.0 = 100%.
pub const BP: u128 = 10000;

/// The score of always saying "50%". Any real forecaster must beat this.
pub const REFERENCE_BRIER_BP: u128 = 2500;

/// An unrevealed forecast is scored here: the worst value the rule can produce.
/// Worse than any wrong answer you could have given on purpose.
pub const FORFEIT_BRIER_BP: u128 = 10000;

/// How long after the horizon the forecaster keeps the exclusive right to
/// reveal. After this, anyone may forfeit the forecast on their behalf.
pub const REVEAL_WINDOW_SECONDS: u64 = 172800; // 48 hours

/// Brier score in basis points: `(p - outcome)^2`, lower is better.
///
/// - `0`     called it perfectly, with full confidence
/// - `2500`  the coin-flip baseline
/// - `10000` maximally, confidently wrong
pub fn brier_bp(probability_bp: u128, outcome: u128) -> u128 {
    assert(probability_bp <= BP, 'PROBABILITY_OUT_OF_RANGE');
    assert(outcome == 0 || outcome == 1, 'OUTCOME_NOT_BINARY');

    let target = outcome * BP;
    let diff = if probability_bp > target {
        probability_bp - target
    } else {
        target - probability_bp
    };
    (diff * diff) / BP
}

/// What fraction of the bond comes back, in basis points of the original bond.
///
/// At or below the coin-flip baseline the whole bond returns, plus a bonus of
/// up to 20% drawn from the research pool. Above it the return falls away to
/// 40% at maximum wrongness.
///
/// The shape is deliberate: being *uncertain* costs nothing, because a forecast
/// of 50% is an honest statement about a genuinely uncertain world and
/// punishing it would push people toward false confidence. Being *confidently
/// wrong* is what costs.
pub fn settlement_bp(brier: u128) -> u128 {
    if brier <= REFERENCE_BRIER_BP {
        let headroom = REFERENCE_BRIER_BP - brier;
        BP + (headroom * 2000) / REFERENCE_BRIER_BP
    } else {
        let excess = brier - REFERENCE_BRIER_BP;
        let span = BP - REFERENCE_BRIER_BP;
        BP - (excess * 6000) / span
    }
}

/// Reputation weight of a conviction tier. A Gold call moves a track record
/// eight times as much as a Bronze one, in both directions.
pub fn tier_weight(tier: u8) -> u64 {
    if tier == 0 {
        1
    } else if tier == 1 {
        3
    } else if tier == 2 {
        8
    } else {
        0
    }
}

pub fn is_valid_tier(tier: u8) -> bool {
    tier <= 2
}

/// Which decile bucket a stated probability falls into, for the calibration
/// curve. Five buckets: 0-20, 20-40, 40-60, 60-80, 80-100.
pub fn calibration_bin(probability_bp: u128) -> u8 {
    let bin = probability_bp / 2000;
    if bin > 4 {
        4
    } else {
        bin.try_into().unwrap()
    }
}

#[cfg(test)]
mod tests {
    use super::{BP, brier_bp, calibration_bin, settlement_bp, tier_weight};

    #[test]
    fn perfect_call_scores_zero() {
        assert(brier_bp(BP, 1) == 0, 'certain and right');
        assert(brier_bp(0, 0) == 0, 'certain and right, inverted');
    }

    #[test]
    fn coin_flip_scores_the_baseline() {
        assert(brier_bp(5000, 1) == 2500, 'coin flip up');
        assert(brier_bp(5000, 0) == 2500, 'coin flip down');
    }

    #[test]
    fn confident_and_wrong_is_the_worst() {
        assert(brier_bp(BP, 0) == BP, 'max wrong');
        assert(brier_bp(0, 1) == BP, 'max wrong, inverted');
    }

    #[test]
    fn seventy_percent_matches_the_reference() {
        // (0.7 - 1)^2 = 0.09 -> 900 bp
        assert(brier_bp(7000, 1) == 900, 'hit at 70');
        // (0.7 - 0)^2 = 0.49 -> 4900 bp
        assert(brier_bp(7000, 0) == 4900, 'miss at 70');
    }

    #[test]
    fn settlement_returns_everything_at_the_baseline() {
        assert(settlement_bp(2500) == BP, 'baseline returns bond');
    }

    #[test]
    fn settlement_caps_the_bonus_and_the_slash() {
        assert(settlement_bp(0) == 12000, 'perfect earns 20% bonus');
        assert(settlement_bp(BP) == 4000, 'max wrong loses 60%');
    }

    #[test]
    fn settlement_is_monotonic_across_the_baseline() {
        assert(settlement_bp(900) > settlement_bp(2500), 'better beats baseline');
        assert(settlement_bp(2500) > settlement_bp(4900), 'baseline beats worse');
    }

    #[test]
    fn tier_weights_are_ordered() {
        assert(tier_weight(0) == 1, 'bronze');
        assert(tier_weight(1) == 3, 'silver');
        assert(tier_weight(2) == 8, 'gold');
    }

    #[test]
    fn calibration_bins_cover_the_range() {
        assert(calibration_bin(0) == 0, 'low end');
        assert(calibration_bin(5000) == 2, 'middle');
        assert(calibration_bin(BP) == 4, 'high end clamps');
    }
}
