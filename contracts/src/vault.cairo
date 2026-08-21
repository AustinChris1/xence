//! # XenceVault — the anonymizer
//!
//! ## ⚠ DRAFT. Not audited, not reviewed by StarkWare.
//!
//! This contract custodies user bonds across transactions. It is written
//! against the documented `privacy_invoke` pattern and the escrow example's
//! stateful shape, but an anonymizer is the app team's code to review and
//! audit, and this has had neither. Do not trust it with size.
//!
//! ## What it does
//!
//! Two legs, driven by the pool through `privacy_invoke`:
//!
//! **Commit.** The pool withdraws the bond to this contract, then calls us. We
//! record a commitment hash and return an **empty span** — the protocol's own
//! idiom for "credit nothing yet". The bond is parked. Nothing about the
//! forecast is legible: the calldata carries a hash, a question id, a horizon
//! and a tier, and that is all. Not the probability, not the thesis, not even
//! which direction it leans.
//!
//! **Settle.** After the horizon the forecaster reveals the preimage. We
//! recompute the hash, read a Pragma median price, score the call, approve the
//! pool to pull the settled amount, and return an `OpenNoteDeposit` crediting
//! their open note. The payout has to land in an *open* note precisely because
//! its amount cannot be known at proof time — the oracle has not been read yet.
//!
//! And one leg that runs outside the pool entirely:
//!
//! **Forfeit.** If the horizon passes and nobody reveals, anyone may forfeit
//! the forecast. The bond is slashed to the research pool and the registry
//! records the maximum possible error. This is the mechanism the whole protocol
//! rests on: without it, a forecaster seals a hundred calls, reveals the
//! winners, and lets the rest quietly expire — the deleted-tweet problem with
//! extra steps.
//!
//! ## What an observer learns
//!
//! That the pool paid this contract, and that a hash was written. The link back
//! to the forecaster is broken by the pool, not by us.

use starknet::ContractAddress;
use xence::objects::{ForecastOperation, OpenNoteDeposit};

/// A sealed forecast, as stored. Note what is absent: no probability, no
/// rationale, no salt. Those exist only in the forecaster's own hands until
/// they choose to reveal, and the contract cannot open a seal on their behalf.
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct Forecast {
    pub reputation_key: felt252,
    pub question_id: felt252,
    pub pair_id: felt252,
    pub strike: u128,
    pub horizon: u64,
    pub comparator: u8,
    pub tier: u8,
    pub token: ContractAddress,
    pub bond: u128,
    pub state: u8,
}

#[starknet::interface]
pub trait IXenceVault<T> {
    /// Called by the privacy pool via `INVOKE_SELECTOR`.
    ///
    /// Calldata after the selector deserializes straight into these parameters,
    /// so the order here is a wire format shared with `web/src/lib/strk20.ts`.
    /// Fields not used by a given operation are ignored and should be sent as
    /// zero.
    ///
    /// **Commit** — `commitment_hash`, `token`, `amount`, `reputation_key`,
    /// `sig_r`, `sig_s`, `question_id`, `pair_id`, `strike`, `horizon`,
    /// `comparator`, `tier`. Returns an empty span.
    ///
    /// **Settle** — `commitment_hash`, `token`, `question_id`,
    /// `probability_bp`, `rationale_hash`, `salt`, `note_id`. Returns one
    /// deposit instruction.
    fn privacy_invoke(
        ref self: T,
        operation: ForecastOperation,
        commitment_hash: felt252,
        token: ContractAddress,
        amount: u128,
        reputation_key: felt252,
        sig_r: felt252,
        sig_s: felt252,
        question_id: felt252,
        pair_id: felt252,
        strike: u128,
        horizon: u64,
        comparator: u8,
        tier: u8,
        probability_bp: u128,
        rationale_hash: felt252,
        salt: felt252,
        note_id: felt252,
    ) -> Span<OpenNoteDeposit>;

    /// Permissionless. Slash a forecast whose reveal window has closed.
    fn forfeit(ref self: T, commitment_hash: felt252);

    fn get_forecast(self: @T, commitment_hash: felt252) -> Forecast;
    fn research_pool(self: @T, token: ContractAddress) -> u128;
    fn locked(self: @T, token: ContractAddress) -> u128;
    fn privacy_contract(self: @T) -> ContractAddress;
}

/// Domain separation. These MUST match `web/src/lib/forecast.ts` exactly or
/// every commitment this contract accepts becomes unrevealable.
pub const TAG_COMMIT: felt252 = 'XENCE_COMMIT_V1';
pub const TAG_IDENTITY: felt252 = 'XENCE_IDENTITY_V1';

/// Cut of a forfeited bond paid to whoever calls `forfeit`. Without a reward
/// nobody spends gas enforcing the deadline, and an unenforced forfeit rule is
/// the same as no forfeit rule at all.
pub const KEEPER_REWARD_BP: u128 = 500; // 5%

pub mod errors {
    pub const CALLER_NOT_PRIVACY: felt252 = 'CALLER_NOT_PRIVACY';
    pub const ZERO_COMMITMENT: felt252 = 'ZERO_COMMITMENT';
    pub const ZERO_TOKEN: felt252 = 'ZERO_TOKEN';
    pub const ZERO_AMOUNT: felt252 = 'ZERO_AMOUNT';
    pub const ZERO_NOTE_ID: felt252 = 'ZERO_NOTE_ID';
    pub const COMMITMENT_EXISTS: felt252 = 'COMMITMENT_EXISTS';
    pub const NOT_SEALED: felt252 = 'NOT_SEALED';
    pub const BAD_TIER: felt252 = 'BAD_TIER';
    pub const BAD_COMPARATOR: felt252 = 'BAD_COMPARATOR';
    pub const HORIZON_IN_PAST: felt252 = 'HORIZON_IN_PAST';
    pub const TOO_EARLY: felt252 = 'TOO_EARLY';
    pub const WINDOW_OPEN: felt252 = 'WINDOW_STILL_OPEN';
    pub const BAD_SIGNATURE: felt252 = 'BAD_SIGNATURE';
    pub const REVEAL_MISMATCH: felt252 = 'REVEAL_MISMATCH';
    pub const BOND_NOT_RECEIVED: felt252 = 'BOND_NOT_RECEIVED';
    pub const TOKEN_MISMATCH: felt252 = 'TOKEN_MISMATCH';
    pub const ZERO_PAYOUT: felt252 = 'ZERO_PAYOUT';
    pub const STALE_ORACLE: felt252 = 'STALE_ORACLE';
    pub const ZERO_ADDRESS: felt252 = 'ZERO_ADDRESS';
}

/// `poseidon(TAG_COMMIT, question_id, probability_bp, rationale_hash, salt)`.
///
/// The salt is not decoration. Without it the probability field has only 10_001
/// possible values and anyone could brute-force the commitment the moment it
/// lands, which would make the seal purely theatrical.
pub fn compute_commitment(
    question_id: felt252, probability_bp: u128, rationale_hash: felt252, salt: felt252,
) -> felt252 {
    core::poseidon::poseidon_hash_span(
        [TAG_COMMIT, question_id, probability_bp.into(), rationale_hash, salt].span(),
    )
}

/// The message a forecaster signs to bind a commitment to their reputation key.
///
/// It covers the question, horizon and tier as well as the commitment, so a
/// signature cannot be lifted onto a different question or replayed at a
/// cheaper tier.
pub fn compute_auth_message(
    commitment_hash: felt252, question_id: felt252, horizon: u64, tier: u8,
) -> felt252 {
    core::poseidon::poseidon_hash_span(
        [TAG_IDENTITY, commitment_hash, question_id, horizon.into(), tier.into()].span(),
    )
}

#[starknet::contract]
pub mod XenceVault {
    use core::ecdsa::check_ecdsa_signature;
    use core::num::traits::Zero;
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
        StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address,
        get_contract_address};
    use xence::objects::{
        ForecastOperation, IERC20Dispatcher, IERC20DispatcherTrait, OpenNoteDeposit,
        comparator as cmp, state,
    };
    use xence::pragma::{
        DataType, IPragmaOracleDispatcher, IPragmaOracleDispatcherTrait, normalise_price,
    };
    use xence::registry::{IXenceRegistryDispatcher, IXenceRegistryDispatcherTrait};
    use xence::scoring::{
        BP, REVEAL_WINDOW_SECONDS, brier_bp, is_valid_tier, settlement_bp,
    };
    use super::{
        Forecast, IXenceVault, KEEPER_REWARD_BP, compute_auth_message, compute_commitment,
        errors,
    };

    #[storage]
    struct Storage {
        /// The STRK20 privacy pool. Pinned at deployment: this contract holds
        /// funds across transactions, so `privacy_invoke` must not be callable
        /// by anyone else.
        privacy_contract: ContractAddress,
        registry: ContractAddress,
        oracle: ContractAddress,
        forecasts: Map<felt252, Forecast>,
        /// Bonds owed back to sealed forecasts, per token.
        locked: Map<ContractAddress, u128>,
        /// Slashed bonds, per token. Funds the calibration bonus.
        research: Map<ContractAddress, u128>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        Sealed: Sealed,
        Settled: Settled,
        Forfeited: Forfeited,
    }

    /// Deliberately thin. A richer event here would leak exactly what the seal
    /// is meant to hide.
    #[derive(Drop, starknet::Event)]
    pub struct Sealed {
        #[key]
        pub commitment_hash: felt252,
        #[key]
        pub reputation_key: felt252,
        pub question_id: felt252,
        pub horizon: u64,
        pub tier: u8,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Settled {
        #[key]
        pub commitment_hash: felt252,
        #[key]
        pub reputation_key: felt252,
        pub probability_bp: u128,
        pub outcome: u8,
        pub price: u128,
        pub brier_bp: u128,
        pub payout: u128,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Forfeited {
        #[key]
        pub commitment_hash: felt252,
        #[key]
        pub reputation_key: felt252,
        pub slashed: u128,
        pub keeper: ContractAddress,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        privacy_contract: ContractAddress,
        registry: ContractAddress,
        oracle: ContractAddress,
    ) {
        assert(privacy_contract.is_non_zero(), errors::ZERO_ADDRESS);
        assert(registry.is_non_zero(), errors::ZERO_ADDRESS);
        assert(oracle.is_non_zero(), errors::ZERO_ADDRESS);
        self.privacy_contract.write(privacy_contract);
        self.registry.write(registry);
        self.oracle.write(oracle);
    }

    #[abi(embed_v0)]
    pub impl XenceVaultImpl of IXenceVault<ContractState> {
        fn privacy_invoke(
            ref self: ContractState,
            operation: ForecastOperation,
            commitment_hash: felt252,
            token: ContractAddress,
            amount: u128,
            reputation_key: felt252,
            sig_r: felt252,
            sig_s: felt252,
            question_id: felt252,
            pair_id: felt252,
            strike: u128,
            horizon: u64,
            comparator: u8,
            tier: u8,
            probability_bp: u128,
            rationale_hash: felt252,
            salt: felt252,
            note_id: felt252,
        ) -> Span<OpenNoteDeposit> {
            let pool = self.privacy_contract.read();
            assert(get_caller_address() == pool, errors::CALLER_NOT_PRIVACY);

            match operation {
                ForecastOperation::Commit => {
                    self
                        .do_commit(
                            commitment_hash,
                            token,
                            amount,
                            reputation_key,
                            sig_r,
                            sig_s,
                            question_id,
                            pair_id,
                            strike,
                            horizon,
                            comparator,
                            tier,
                        )
                },
                ForecastOperation::Settle => {
                    self
                        .do_settle(
                            pool,
                            commitment_hash,
                            probability_bp,
                            rationale_hash,
                            salt,
                            note_id,
                        )
                },
            }
        }

        fn forfeit(ref self: ContractState, commitment_hash: felt252) {
            let f = self.forecasts.read(commitment_hash);
            assert(f.state == state::SEALED, errors::NOT_SEALED);
            assert(
                get_block_timestamp() > f.horizon + REVEAL_WINDOW_SECONDS,
                errors::WINDOW_OPEN,
            );

            self.forecasts.write(commitment_hash, Forecast { state: state::FORFEITED, ..f });
            self.locked.write(f.token, self.locked.read(f.token) - f.bond);

            // Pay the keeper who bothered to enforce the deadline, park the
            // rest. This is a public ERC-20 transfer to whoever called, which
            // reveals nothing about the forecaster.
            let reward = (f.bond * KEEPER_REWARD_BP) / BP;
            let keeper = get_caller_address();
            if reward > 0 {
                IERC20Dispatcher { contract_address: f.token }
                    .transfer(recipient: keeper, amount: reward.into());
            }
            self.research.write(f.token, self.research.read(f.token) + (f.bond - reward));

            IXenceRegistryDispatcher { contract_address: self.registry.read() }
                .record_forfeit(f.reputation_key, f.tier);

            self
                .emit(
                    Forfeited {
                        commitment_hash,
                        reputation_key: f.reputation_key,
                        slashed: f.bond - reward,
                        keeper,
                    },
                );
        }

        fn get_forecast(self: @ContractState, commitment_hash: felt252) -> Forecast {
            self.forecasts.read(commitment_hash)
        }

        fn research_pool(self: @ContractState, token: ContractAddress) -> u128 {
            self.research.read(token)
        }

        fn locked(self: @ContractState, token: ContractAddress) -> u128 {
            self.locked.read(token)
        }

        fn privacy_contract(self: @ContractState) -> ContractAddress {
            self.privacy_contract.read()
        }
    }

    #[generate_trait]
    impl Internal of InternalTrait {
        fn do_commit(
            ref self: ContractState,
            commitment_hash: felt252,
            token: ContractAddress,
            amount: u128,
            reputation_key: felt252,
            sig_r: felt252,
            sig_s: felt252,
            question_id: felt252,
            pair_id: felt252,
            strike: u128,
            horizon: u64,
            comparator: u8,
            tier: u8,
        ) -> Span<OpenNoteDeposit> {
            assert(commitment_hash.is_non_zero(), errors::ZERO_COMMITMENT);
            assert(token.is_non_zero(), errors::ZERO_TOKEN);
            assert(amount > 0, errors::ZERO_AMOUNT);
            assert(is_valid_tier(tier), errors::BAD_TIER);
            assert(
                comparator == cmp::ABOVE || comparator == cmp::BELOW,
                errors::BAD_COMPARATOR,
            );
            assert(reputation_key.is_non_zero(), errors::ZERO_COMMITMENT);

            let existing = self.forecasts.read(commitment_hash);
            assert(existing.state == state::NONE, errors::COMMITMENT_EXISTS);

            // You cannot seal a forecast about something that has already
            // happened. Without this the whole protocol is theatre.
            assert(horizon > get_block_timestamp(), errors::HORIZON_IN_PAST);

            // Authenticate the pseudonym. The invoke calldata is public, so we
            // cannot take a secret here — we take a signature instead. Without
            // this, anyone could commit deliberately terrible forecasts under a
            // rival's reputation key and destroy a record they do not own.
            let message = compute_auth_message(commitment_hash, question_id, horizon, tier);
            assert(
                check_ecdsa_signature(message, reputation_key, sig_r, sig_s),
                errors::BAD_SIGNATURE,
            );

            // Trust, then verify. The pool is supposed to have withdrawn the
            // bond to us in the same transaction, but "supposed to" is not a
            // security property: check that our balance actually covers every
            // obligation we would now be carrying.
            let new_locked = self.locked.read(token) + amount;
            let held = IERC20Dispatcher { contract_address: token }
                .balance_of(get_contract_address());
            let obligations: u256 = (new_locked + self.research.read(token)).into();
            assert(held >= obligations, errors::BOND_NOT_RECEIVED);

            self.locked.write(token, new_locked);
            self
                .forecasts
                .write(
                    commitment_hash,
                    Forecast {
                        reputation_key,
                        question_id,
                        pair_id,
                        strike,
                        horizon,
                        comparator,
                        tier,
                        token,
                        bond: amount,
                        state: state::SEALED,
                    },
                );

            IXenceRegistryDispatcher { contract_address: self.registry.read() }
                .record_seal(reputation_key);

            self
                .emit(
                    Sealed { commitment_hash, reputation_key, question_id, horizon, tier },
                );

            // Nothing to credit. The bond stays parked until settlement.
            [].span()
        }

        fn do_settle(
            ref self: ContractState,
            pool: ContractAddress,
            commitment_hash: felt252,
            probability_bp: u128,
            rationale_hash: felt252,
            salt: felt252,
            note_id: felt252,
        ) -> Span<OpenNoteDeposit> {
            let f = self.forecasts.read(commitment_hash);
            assert(f.state == state::SEALED, errors::NOT_SEALED);
            assert(note_id.is_non_zero(), errors::ZERO_NOTE_ID);
            assert(get_block_timestamp() >= f.horizon, errors::TOO_EARLY);

            // Open the seal. This is the only check that matters: the preimage
            // either reproduces the hash committed before the outcome existed,
            // or it does not.
            let recomputed = compute_commitment(
                f.question_id, probability_bp, rationale_hash, salt,
            );
            assert(recomputed == commitment_hash, errors::REVEAL_MISMATCH);
            assert(probability_bp <= BP, errors::REVEAL_MISMATCH);

            // Settle against the oracle.
            let response = IPragmaOracleDispatcher { contract_address: self.oracle.read() }
                .get_data_median(DataType::SpotEntry(f.pair_id));
            assert(response.num_sources_aggregated > 0, errors::STALE_ORACLE);
            let price = normalise_price(response.price, response.decimals);

            let outcome: u128 = if f.comparator == cmp::ABOVE {
                if price >= f.strike {
                    1
                } else {
                    0
                }
            } else {
                if price < f.strike {
                    1
                } else {
                    0
                }
            };

            let brier = brier_bp(probability_bp, outcome);
            let settle = settlement_bp(brier);

            let payout = if settle >= BP {
                // Bonus is paid out of slashed bonds, and only as far as they
                // stretch. The vault never promises money it does not hold.
                let wanted = (f.bond * (settle - BP)) / BP;
                let available = self.research.read(f.token);
                let bonus = if wanted <= available { wanted } else { available };
                self.research.write(f.token, available - bonus);
                f.bond + bonus
            } else {
                let slash = (f.bond * (BP - settle)) / BP;
                self.research.write(f.token, self.research.read(f.token) + slash);
                f.bond - slash
            };

            assert(payout > 0, errors::ZERO_PAYOUT);

            self.locked.write(f.token, self.locked.read(f.token) - f.bond);
            self.forecasts.write(commitment_hash, Forecast { state: state::SETTLED, ..f });

            // Approve, don't transfer: the pool executes the pull itself when
            // it applies the deposit.
            IERC20Dispatcher { contract_address: f.token }
                .approve(spender: pool, amount: payout.into());

            IXenceRegistryDispatcher { contract_address: self.registry.read() }
                .record_settle(
                    f.reputation_key,
                    f.tier,
                    brier,
                    probability_bp,
                    outcome.try_into().unwrap(),
                );

            self
                .emit(
                    Settled {
                        commitment_hash,
                        reputation_key: f.reputation_key,
                        probability_bp,
                        outcome: outcome.try_into().unwrap(),
                        price,
                        brier_bp: brier,
                        payout,
                    },
                );

            [OpenNoteDeposit { note_id, token: f.token, amount: payout }].span()
        }
    }
}

/// # Cross-language parity
///
/// The commitment is built in TypeScript when a forecast is sealed and rebuilt
/// here when it is revealed. If the two ever disagree, every commitment the
/// frontend has made becomes permanently unrevealable — and an unrevealable
/// forecast is scored as maximally wrong and its bond is slashed. That is the
/// worst thing this codebase could do to a user, so the boundary gets a fixed
/// test vector on both sides.
///
/// The expected values below are produced by `scripts/hash-parity.mjs`, which
/// uses the same starknet.js the browser does. If one of these fails, do not
/// edit the expectation — find out which side moved.
#[cfg(test)]
mod parity_tests {
    use super::{TAG_COMMIT, TAG_IDENTITY, compute_auth_message, compute_commitment};

    const QUESTION_ID: felt252 =
        0x5a15642deb156bef243731363523445f42bb2dab7bd68b34c32cc3772f61191;
    const RATIONALE_HASH: felt252 =
        0x5853105beec4febe464b8c74f04a2600ef2ee9a74d02b51079c058f76d44ad2;
    const SALT: felt252 = 0x1234567890abcdef;
    const PROBABILITY_BP: u128 = 7200;
    const HORIZON: u64 = 1759190400;
    const TIER_GOLD: u8 = 2;

    const EXPECTED_COMMITMENT: felt252 =
        0x3dcab7dedd5af6aba281de103b8e9e81c2b9ed4f4d72702643503fee6f1c31c;
    const EXPECTED_AUTH: felt252 =
        0x74598f9eb0c7756a6fe29fcb3896bc73a1dc239071c7142d64b2f4686a3eaa9;

    #[test]
    fn domain_tags_match_the_frontend() {
        assert(TAG_COMMIT == 0x58454e43455f434f4d4d49545f5631, 'commit tag');
        assert(TAG_IDENTITY == 0x58454e43455f4944454e544954595f5631, 'identity tag');
    }

    #[test]
    fn commitment_matches_typescript() {
        let got = compute_commitment(QUESTION_ID, PROBABILITY_BP, RATIONALE_HASH, SALT);
        assert(got == EXPECTED_COMMITMENT, 'commitment parity');
    }

    #[test]
    fn auth_message_matches_typescript() {
        let got = compute_auth_message(
            EXPECTED_COMMITMENT, QUESTION_ID, HORIZON, TIER_GOLD,
        );
        assert(got == EXPECTED_AUTH, 'auth parity');
    }

    /// Changing any single field must change the commitment. Otherwise a
    /// forecaster could reveal a different probability than the one they sealed.
    #[test]
    fn every_field_is_bound_into_the_commitment() {
        let base = compute_commitment(QUESTION_ID, PROBABILITY_BP, RATIONALE_HASH, SALT);
        assert(
            compute_commitment(QUESTION_ID + 1, PROBABILITY_BP, RATIONALE_HASH, SALT) != base,
            'question is bound',
        );
        assert(
            compute_commitment(QUESTION_ID, PROBABILITY_BP + 1, RATIONALE_HASH, SALT) != base,
            'probability is bound',
        );
        assert(
            compute_commitment(QUESTION_ID, PROBABILITY_BP, RATIONALE_HASH + 1, SALT) != base,
            'rationale is bound',
        );
        assert(
            compute_commitment(QUESTION_ID, PROBABILITY_BP, RATIONALE_HASH, SALT + 1) != base,
            'salt is bound',
        );
    }
}
