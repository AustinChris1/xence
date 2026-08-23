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
}

pub mod errors {
    pub const CALLER_NOT_VAULT: felt252 = 'CALLER_NOT_VAULT';
    pub const VAULT_ALREADY_SET: felt252 = 'VAULT_ALREADY_SET';
    pub const NOT_DEPLOYER: felt252 = 'NOT_DEPLOYER';
    pub const ZERO_ADDRESS: felt252 = 'ZERO_ADDRESS';
    pub const BAD_BIN: felt252 = 'BAD_BIN';
}

#[starknet::contract]
pub mod XenceRegistry {
    use core::num::traits::Zero;
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
        StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_caller_address};
    use xence::scoring::{REFERENCE_BRIER_BP, calibration_bin, tier_weight};
    use super::{CalibrationBin, IXenceRegistry, Record, errors};

    #[storage]
    struct Storage {
        deployer: ContractAddress,
        vault: ContractAddress,
        records: Map<felt252, Record>,
        bins: Map<(felt252, u8), CalibrationBin>,
        seen: Map<felt252, bool>,
        forecaster_count: u64,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        Sealed: Sealed,
        Settled: Settled,
        Forfeited: Forfeited,
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
