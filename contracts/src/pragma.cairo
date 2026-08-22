//! Pragma oracle interface.

#[derive(Drop, Copy, Serde)]
pub enum DataType {
    SpotEntry: felt252,
    FutureEntry: (felt252, u64),
    GenericEntry: felt252,
}

#[derive(Drop, Copy, Serde)]
pub struct PragmaPricesResponse {
    pub price: u128,
    pub decimals: u32,
    pub last_updated_timestamp: u64,
    pub num_sources_aggregated: u32,
    pub expiration_timestamp: Option<u64>,
}

#[starknet::interface]
pub trait IPragmaOracle<T> {
    fn get_data_median(self: @T, data_type: DataType) -> PragmaPricesResponse;
}

/// Xence stores strikes scaled to 8 decimals.
pub const STRIKE_DECIMALS: u32 = 8;

pub fn normalise_price(price: u128, decimals: u32) -> u128 {
    if decimals == STRIKE_DECIMALS {
        price
    } else if decimals > STRIKE_DECIMALS {
        let mut factor: u128 = 1;
        let mut n = decimals - STRIKE_DECIMALS;
        while n != 0 {
            factor *= 10;
            n -= 1;
        }
        price / factor
    } else {
        let mut factor: u128 = 1;
        let mut n = STRIKE_DECIMALS - decimals;
        while n != 0 {
            factor *= 10;
            n -= 1;
        }
        price * factor
    }
}

#[cfg(test)]
mod tests {
    use super::normalise_price;

    #[test]
    fn identity_at_eight_decimals() {
        assert(normalise_price(12000000000000, 8) == 12000000000000, 'no change');
    }

    #[test]
    fn scales_down_from_higher_precision() {
        // 1200.00000000 at 10 decimals -> 8 decimals
        assert(normalise_price(12000000000000, 10) == 120000000000, 'scaled down');
    }

    #[test]
    fn scales_up_from_lower_precision() {
        // 1200.00 at 2 decimals -> 1200.00000000 at 8 decimals.
        assert(normalise_price(120000, 2) == 120000000000, 'scaled up');
    }
}
