//! # XenceRegistry — the public half Everything a stranger needs to judge a forecaster.

use starknet::ContractAddress;

/// A forecaster's whole public history, in five numbers.
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct Record {
    /// Forecasts sealed but not yet resolved.
    pub open: u32,
    /// Forecasts revealed and settled against the oracle.
    pub resolved: u32,
    /// Forecasts that expired unrevealed.
    pub forfeited: u32,
    /// Sum of `brier_bp * tier_weight` across everything resolved OR forfeited.
    pub weighted_brier: u64,
    /// Sum of `tier_weight`, the denominator for the mean.
    pub weight_total: u64,
}

/// One bucket of the calibration curve: what they claimed against what happened.
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct CalibrationBin {
    pub count: u32,
    pub hits: u32,
    /// Sum of stated probabilities in bp, so the mean claim can be recovered.
    pub claimed_sum: u64,
}

#[starknet::interface]
pub trait IXenceRegistry<T> {
    fn get_record(self: @T, reputation_key: felt252) -> Record;
    fn get_bin(self: @T, reputation_key: felt252, bin: u8) -> CalibrationBin;
    /// Weighted mean Brier score in bp.
    fn mean_brier_bp(self: @T, reputation_key: felt252) -> u128;
    fn total_forecasters(self: @T) -> u64;
    fn vault(self: @T) -> ContractAddress;

    // --- vault-only writes ---
    fn record_seal(ref self: T, reputation_key: felt252);
    fn record_settle(
        ref self: T,
        reputation_key: felt252,
        tier: u8,
        brier_bp: u128,
        probability_bp: u128,
        outcome: u8,
    );
    fn record_forfeit(ref self: T, reputation_key: felt252, tier: u8);

    // --- the backing rail ---
    /// Where private support for a forecaster should be sent. Zero until set.
    fn payout_of(self: @T, reputation_key: felt252) -> ContractAddress;
    fn payout_nonce(self: @T, reputation_key: felt252) -> u64;
    /// Permissionless relay: only the signature decides. The forecaster signs
    /// (payout, nonce) with their reputation key; anyone may submit, so the
    /// wallet that pays gas is never linked to the key.
    fn set_payout(
        ref self: T,
        reputation_key: felt252,
        payout: ContractAddress,
        sig_r: felt252,
        sig_s: felt252,
    );
}

/// Signed payout announcements. The nonce is part of the message, so a
/// captured signature cannot later re-point payouts at a stale address.
pub const TAG_PAYOUT: felt252 = 'XENCE_PAYOUT_V1';

pub fn compute_payout_message(payout: felt252, nonce: u64) -> felt252 {
    core::poseidon::poseidon_hash_span([TAG_PAYOUT, payout, nonce.into()].span())
}

pub mod errors {
    pub const CALLER_NOT_VAULT: felt252 = 'CALLER_NOT_VAULT';
    pub const BAD_SIGNATURE: felt252 = 'BAD_SIGNATURE';
    pub const VAULT_ALREADY_SET: felt252 = 'VAULT_ALREADY_SET';
    pub const NOT_DEPLOYER: felt252 = 'NOT_DEPLOYER';
    pub const ZERO_ADDRESS: felt252 = 'ZERO_ADDRESS';
    pub const BAD_BIN: felt252 = 'BAD_BIN';
}

#[starknet::contract]
pub mod XenceRegistry {
    use core::ecdsa::check_ecdsa_signature;
    use core::num::traits::Zero;
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
        StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_caller_address};
    use xence::scoring::{REFERENCE_BRIER_BP, calibration_bin, tier_weight};
    use super::{
        CalibrationBin, IXenceRegistry, Record, compute_payout_message, errors,
    };

    #[storage]
    struct Storage {
        deployer: ContractAddress,
        vault: ContractAddress,
        records: Map<felt252, Record>,
        bins: Map<(felt252, u8), CalibrationBin>,
        seen: Map<felt252, bool>,
        forecaster_count: u64,
        payouts: Map<felt252, ContractAddress>,
        payout_nonces: Map<felt252, u64>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        Sealed: Sealed,
        Settled: Settled,
        Forfeited: Forfeited,
        PayoutSet: PayoutSet,
    }

    #[derive(Drop, starknet::Event)]
    pub struct PayoutSet {
        #[key]
        pub reputation_key: felt252,
        pub payout: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Sealed {
        #[key]
        pub reputation_key: felt252,
        pub open: u32,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Settled {
        #[key]
        pub reputation_key: felt252,
        pub tier: u8,
        pub probability_bp: u128,
        pub outcome: u8,
        pub brier_bp: u128,
        pub mean_brier_bp: u128,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Forfeited {
        #[key]
        pub reputation_key: felt252,
        pub tier: u8,
    }

    #[constructor]
    fn constructor(ref self: ContractState, deployer: ContractAddress) {
        assert(deployer.is_non_zero(), errors::ZERO_ADDRESS);
        self.deployer.write(deployer);
    }

    #[abi(embed_v0)]
    pub impl XenceRegistryImpl of IXenceRegistry<ContractState> {
        fn get_record(self: @ContractState, reputation_key: felt252) -> Record {
            self.records.read(reputation_key)
        }

        fn get_bin(
            self: @ContractState, reputation_key: felt252, bin: u8,
        ) -> CalibrationBin {
            assert(bin <= 4, errors::BAD_BIN);
            self.bins.read((reputation_key, bin))
        }

        fn mean_brier_bp(self: @ContractState, reputation_key: felt252) -> u128 {
            let r = self.records.read(reputation_key);
            if r.weight_total == 0 {
                return REFERENCE_BRIER_BP;
            }
            r.weighted_brier.into() / r.weight_total.into()
        }

        fn total_forecasters(self: @ContractState) -> u64 {
            self.forecaster_count.read()
        }

        fn vault(self: @ContractState) -> ContractAddress {
            self.vault.read()
        }

        fn record_seal(ref self: ContractState, reputation_key: felt252) {
            self.assert_vault();

            if !self.seen.read(reputation_key) {
                self.seen.write(reputation_key, true);
                self.forecaster_count.write(self.forecaster_count.read() + 1);
            }

            let r = self.records.read(reputation_key);
            let updated = Record { open: r.open + 1, ..r };
            self.records.write(reputation_key, updated);
            self.emit(Sealed { reputation_key, open: updated.open });
        }

        fn record_settle(
            ref self: ContractState,
            reputation_key: felt252,
            tier: u8,
            brier_bp: u128,
            probability_bp: u128,
            outcome: u8,
        ) {
            self.assert_vault();
            let weight = tier_weight(tier);
            let r = self.records.read(reputation_key);

            let updated = Record {
                open: if r.open == 0 { 0 } else { r.open - 1 },
                resolved: r.resolved + 1,
                forfeited: r.forfeited,
                weighted_brier: r.weighted_brier
                    + (brier_bp.try_into().unwrap() * weight),
                weight_total: r.weight_total + weight,
            };
            self.records.write(reputation_key, updated);

            // Calibration curve: claimed against observed, bucketed.
            let bin = calibration_bin(probability_bp);
            let b = self.bins.read((reputation_key, bin));
            self
                .bins
                .write(
                    (reputation_key, bin),
                    CalibrationBin {
                        count: b.count + 1,
                        hits: b.hits + outcome.into(),
                        claimed_sum: b.claimed_sum
                            + probability_bp.try_into().unwrap(),
                    },
                );

            let mean = if updated.weight_total == 0 {
                REFERENCE_BRIER_BP
            } else {
                updated.weighted_brier.into() / updated.weight_total.into()
            };

            self
                .emit(
                    Settled {
                        reputation_key,
                        tier,
                        probability_bp,
                        outcome,
                        brier_bp,
                        mean_brier_bp: mean,
                    },
                );
        }

        fn record_forfeit(ref self: ContractState, reputation_key: felt252, tier: u8) {
            self.assert_vault();
            let weight = tier_weight(tier);
            let r = self.records.read(reputation_key);

            // A forfeited forecast carries the maximum error into the mean.
            let updated = Record {
                open: if r.open == 0 { 0 } else { r.open - 1 },
                resolved: r.resolved,
                forfeited: r.forfeited + 1,
                weighted_brier: r.weighted_brier + (10000_u64 * weight),
                weight_total: r.weight_total + weight,
            };
            self.records.write(reputation_key, updated);
            self.emit(Forfeited { reputation_key, tier });
        }

        fn payout_of(self: @ContractState, reputation_key: felt252) -> ContractAddress {
            self.payouts.read(reputation_key)
        }

        fn payout_nonce(self: @ContractState, reputation_key: felt252) -> u64 {
            self.payout_nonces.read(reputation_key)
        }

        fn set_payout(
            ref self: ContractState,
            reputation_key: felt252,
            payout: ContractAddress,
            sig_r: felt252,
            sig_s: felt252,
        ) {
            assert(reputation_key.is_non_zero(), errors::ZERO_ADDRESS);
            assert(payout.is_non_zero(), errors::ZERO_ADDRESS);
            let nonce = self.payout_nonces.read(reputation_key);
            let message = compute_payout_message(payout.into(), nonce);
            assert(
                check_ecdsa_signature(message, reputation_key, sig_r, sig_s),
                errors::BAD_SIGNATURE,
            );
            self.payout_nonces.write(reputation_key, nonce + 1);
            self.payouts.write(reputation_key, payout);
            self.emit(PayoutSet { reputation_key, payout });
        }
    }

    /// One-shot wiring.
    #[external(v0)]
    fn set_vault(ref self: ContractState, vault: ContractAddress) {
        assert(get_caller_address() == self.deployer.read(), errors::NOT_DEPLOYER);
        assert(self.vault.read().is_zero(), errors::VAULT_ALREADY_SET);
        assert(vault.is_non_zero(), errors::ZERO_ADDRESS);
        self.vault.write(vault);
    }

    #[generate_trait]
    impl Internal of InternalTrait {
        fn assert_vault(self: @ContractState) {
            assert(get_caller_address() == self.vault.read(), errors::CALLER_NOT_VAULT);
        }
    }
}

#[cfg(test)]
mod payout_tests {
    use super::{TAG_PAYOUT, compute_payout_message};

    // Vector from the same starknet.js the browser signs with.
    #[test]
    fn payout_message_matches_typescript() {
        assert(TAG_PAYOUT == 0x58454e43455f5041594f55545f5631, 'payout tag');
        let got = compute_payout_message(
            0x53ef423c00d06fcfef983a4e349c078d446aee6d4f8cf5163cd9081e444ed9c, 0,
        );
        assert(
            got == 0x3cf76ea8c7e8a85b8d90b006178fe7e441054a8e6598e3017a7a4276eacb3a7,
            'payout parity',
        );
    }

    // The nonce is what stops a captured signature re-pointing payouts later.
    #[test]
    fn nonce_is_bound() {
        let a = compute_payout_message(0x123, 0);
        let b = compute_payout_message(0x123, 1);
        assert(a != b, 'nonce bound');
    }
}
