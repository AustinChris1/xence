//! XenceVault: the anonymizer. DRAFT - not audited, not reviewed by StarkWare.
//! It custodies user funds across transactions.

use starknet::ContractAddress;
use xence::objects::{ForecastOperation, OpenNoteDeposit};

/// A sealed forecast, as stored.
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct Forecast {
    pub reputation_key: felt252,
    pub question_id: felt252,
    pub kind: u8,
    /// PRICE: the Pragma pair id. METRIC: the ERC-20 whose balance is read.
    pub subject: felt252,
    /// METRIC only: the address whose balance settles the question.
    pub holder: ContractAddress,
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
        kind: u8,
        subject: felt252,
        holder: ContractAddress,
        strike: u128,
        horizon: u64,
        comparator: u8,
        tier: u8,
        probability_bp: u128,
        rationale_hash: felt252,
        salt: felt252,
        note_id: felt252,
    ) -> Span<OpenNoteDeposit>;

    /// Permissionless.
    fn forfeit(ref self: T, commitment_hash: felt252);

    fn get_forecast(self: @T, commitment_hash: felt252) -> Forecast;
    fn research_pool(self: @T, token: ContractAddress) -> u128;
    fn locked(self: @T, token: ContractAddress) -> u128;
    fn privacy_contract(self: @T) -> ContractAddress;
}

/// Domain separation.
pub const TAG_COMMIT: felt252 = 'XENCE_COMMIT_V1';
pub const TAG_IDENTITY: felt252 = 'XENCE_IDENTITY_V1';
pub const TAG_QUESTION: felt252 = 'XENCE_QUESTION_V2';

/// Cut of a forfeited bond paid to whoever calls `forfeit`.
pub const KEEPER_REWARD_BP: u128 = 500; // 5%

pub mod errors {
    pub const CALLER_NOT_PRIVACY: felt252 = 'CALLER_NOT_PRIVACY';
    pub const BAD_KIND: felt252 = 'BAD_KIND';
    pub const QUESTION_MISMATCH: felt252 = 'QUESTION_MISMATCH';
    pub const VALUE_OVERFLOW: felt252 = 'VALUE_OVERFLOW';
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
pub fn compute_commitment(
    question_id: felt252, probability_bp: u128, rationale_hash: felt252, salt: felt252,
) -> felt252 {
    core::poseidon::poseidon_hash_span(
        [TAG_COMMIT, question_id, probability_bp.into(), rationale_hash, salt].span(),
    )
}

/// The question, as a hash of every field that decides its outcome.
///
/// Recomputed and asserted on commit. The signature covers question_id, so this
/// is what stops an untrusted relayer from resubmitting a signed forecast with
/// a different strike, subject or comparator: any edit changes the id, the id
/// no longer matches the signature, and the commit reverts.
pub fn compute_question_id(
    kind: u8, subject: felt252, holder: felt252, strike: u128, horizon: u64, comparator: u8,
) -> felt252 {
    core::poseidon::poseidon_hash_span(
        [
            TAG_QUESTION,
            kind.into(),
            subject,
            holder,
            strike.into(),
            horizon.into(),
            comparator.into(),
        ]
            .span(),
    )
}

/// The message a forecaster signs to bind a commitment to their reputation key.
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
        comparator as cmp, question_kind as qk, state,
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
        compute_question_id, errors,
    };

    #[storage]
    struct Storage {
        /// The STRK20 privacy pool.
        privacy_contract: ContractAddress,
        registry: ContractAddress,
        oracle: ContractAddress,
        forecasts: Map<felt252, Forecast>,
        /// Bonds owed back to sealed forecasts, per token.
        locked: Map<ContractAddress, u128>,
        /// Slashed bonds, per token.
        research: Map<ContractAddress, u128>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        Sealed: Sealed,
        Settled: Settled,
        Forfeited: Forfeited,
    }

    /// Deliberately thin.
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
        pub observed: u128,
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
            kind: u8,
            subject: felt252,
            holder: ContractAddress,
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
                            kind,
                            subject,
                            holder,
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

            // Pay the keeper who bothered to enforce the deadline, park the rest.
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
            kind: u8,
            subject: felt252,
            holder: ContractAddress,
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
            assert(subject.is_non_zero(), errors::ZERO_TOKEN);
            if kind == qk::PRICE {
                // Canonical form: one id per question, so a holder on a price
                // question cannot mint a second identity for the same bet.
                assert(holder.is_zero(), errors::QUESTION_MISMATCH);
            } else if kind == qk::METRIC {
                assert(holder.is_non_zero(), errors::ZERO_ADDRESS);
            } else {
                assert(false, errors::BAD_KIND);
            }

            // The signature covers question_id; this covers everything else.
            // Without it a relayer could keep the signed id and swap the strike.
            let derived = compute_question_id(
                kind, subject, holder.into(), strike, horizon, comparator,
            );
            assert(derived == question_id, errors::QUESTION_MISMATCH);

            let existing = self.forecasts.read(commitment_hash);
            assert(existing.state == state::NONE, errors::COMMITMENT_EXISTS);

            // You cannot seal a forecast about something that has already happened.
            assert(horizon > get_block_timestamp(), errors::HORIZON_IN_PAST);

            // Authenticate the pseudonym.
            let message = compute_auth_message(commitment_hash, question_id, horizon, tier);
            assert(
                check_ecdsa_signature(message, reputation_key, sig_r, sig_s),
                errors::BAD_SIGNATURE,
            );

            // Trust, then verify.
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
                        kind,
                        subject,
                        holder,
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

            // Nothing to credit.
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

            // Open the seal.
            let recomputed = compute_commitment(
                f.question_id, probability_bp, rationale_hash, salt,
            );
            assert(recomputed == commitment_hash, errors::REVEAL_MISMATCH);
            assert(probability_bp <= BP, errors::REVEAL_MISMATCH);

            // Settle: read the one number the question is about.
            let observed: u128 = if f.kind == qk::PRICE {
                let response = IPragmaOracleDispatcher {
                    contract_address: self.oracle.read(),
                }
                    .get_data_median(DataType::SpotEntry(f.subject));
                assert(response.num_sources_aggregated > 0, errors::STALE_ORACLE);
                normalise_price(response.price, response.decimals)
            } else {
                // Any ERC-20 balance on Starknet, at the horizon. No oracle,
                // no committee: the chain is the source.
                let balance = IERC20Dispatcher {
                    contract_address: f.subject.try_into().unwrap(),
                }
                    .balance_of(f.holder);
                balance.try_into().expect(errors::VALUE_OVERFLOW)
            };

            let outcome: u128 = if f.comparator == cmp::ABOVE {
                if observed >= f.strike {
                    1
                } else {
                    0
                }
            } else {
                if observed < f.strike {
                    1
                } else {
                    0
                }
            };

            let brier = brier_bp(probability_bp, outcome);
            let settle = settlement_bp(brier);

            let payout = if settle >= BP {
                // Bonus is paid out of slashed bonds, and only as far as they stretch.
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

            // Approve, don't transfer: the pool executes the pull itself when it applies the deposit.
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
                        observed,
                        brier_bp: brier,
                        payout,
                    },
                );

            [OpenNoteDeposit { note_id, token: f.token, amount: payout }].span()
        }
    }
}

/// # Cross-language parity The commitment is built in TypeScript when a forecast is sealed.
#[cfg(test)]
mod parity_tests {
    use super::{
        TAG_COMMIT, TAG_IDENTITY, TAG_QUESTION, compute_auth_message, compute_commitment,
        compute_question_id,
    };

    // Vectors from scripts/hash-parity.mjs — the same starknet.js the browser
    // and API use. If one fails, find out which side moved; never edit the
    // expectation.
    const PRICE_QID: felt252 =
        0x1a1a138fddb723d2f501375e10eafb803dbf50daacebf9e8b1c42764d43390f;
    const METRIC_QID: felt252 =
        0x3398200664d0567c4ced6372f3d55f22356602b7ea9b1b6342b3e90fab49a45;
    const RATIONALE_HASH: felt252 =
        0x5853105beec4febe464b8c74f04a2600ef2ee9a74d02b51079c058f76d44ad2;
    const SALT: felt252 = 0x1234567890abcdef;
    const PROBABILITY_BP: u128 = 7200;
    const HORIZON: u64 = 1759190400;
    const TIER_GOLD: u8 = 2;

    const STRK: felt252 = 0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d;
    const POOL: felt252 = 0x40337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a;

    const EXPECTED_COMMITMENT: felt252 =
        0x2b4c92fdd5b44e4505cd14b2a9f00058afca444371f51e3168a20950d8b5e8a;
    const EXPECTED_AUTH: felt252 =
        0x75b401f21cb318f589cbedf568ae419b171d68b9db325069ec28cdfee9895bf;

    #[test]
    fn domain_tags_match_the_frontend() {
        assert(TAG_COMMIT == 0x58454e43455f434f4d4d49545f5631, 'commit tag');
        assert(TAG_IDENTITY == 0x58454e43455f4944454e544954595f5631, 'identity tag');
        assert(TAG_QUESTION == 0x58454e43455f5155455354494f4e5f5632, 'question tag v2');
    }

    #[test]
    fn price_question_id_matches_typescript() {
        let got = compute_question_id(0, 'BTC/USD', 0, 12000000000000, HORIZON, 1);
        assert(got == PRICE_QID, 'price qid parity');
    }

    #[test]
    fn metric_question_id_matches_typescript() {
        let got = compute_question_id(
            1, STRK, POOL, 3000000000000000000000000, HORIZON, 1,
        );
        assert(got == METRIC_QID, 'metric qid parity');
    }

    #[test]
    fn commitment_matches_typescript() {
        let got = compute_commitment(PRICE_QID, PROBABILITY_BP, RATIONALE_HASH, SALT);
        assert(got == EXPECTED_COMMITMENT, 'commitment parity');
    }

    #[test]
    fn auth_message_matches_typescript() {
        let got = compute_auth_message(EXPECTED_COMMITMENT, PRICE_QID, HORIZON, TIER_GOLD);
        assert(got == EXPECTED_AUTH, 'auth parity');
    }

    // Any single-field edit must change the id — this is the property that
    // makes the on-chain recompute a defence against relayer tampering.
    #[test]
    fn every_question_field_is_bound() {
        let base = compute_question_id(0, 'BTC/USD', 0, 12000000000000, HORIZON, 1);
        assert(
            compute_question_id(1, 'BTC/USD', 0, 12000000000000, HORIZON, 1) != base,
            'kind is bound',
        );
        assert(
            compute_question_id(0, 'ETH/USD', 0, 12000000000000, HORIZON, 1) != base,
            'subject is bound',
        );
        assert(
            compute_question_id(0, 'BTC/USD', 1, 12000000000000, HORIZON, 1) != base,
            'holder is bound',
        );
        assert(
            compute_question_id(0, 'BTC/USD', 0, 12000000000001, HORIZON, 1) != base,
            'strike is bound',
        );
        assert(
            compute_question_id(0, 'BTC/USD', 0, 12000000000000, HORIZON + 1, 1) != base,
            'horizon is bound',
        );
        assert(
            compute_question_id(0, 'BTC/USD', 0, 12000000000000, HORIZON, 0) != base,
            'comparator is bound',
        );
    }

    #[test]
    fn every_commitment_field_is_bound() {
        let base = compute_commitment(PRICE_QID, PROBABILITY_BP, RATIONALE_HASH, SALT);
        assert(
            compute_commitment(PRICE_QID + 1, PROBABILITY_BP, RATIONALE_HASH, SALT) != base,
            'question is bound',
        );
        assert(
            compute_commitment(PRICE_QID, PROBABILITY_BP + 1, RATIONALE_HASH, SALT) != base,
            'probability is bound',
        );
        assert(
            compute_commitment(PRICE_QID, PROBABILITY_BP, RATIONALE_HASH + 1, SALT) != base,
            'rationale is bound',
        );
        assert(
            compute_commitment(PRICE_QID, PROBABILITY_BP, RATIONALE_HASH, SALT + 1) != base,
            'salt is bound',
        );
    }
}
