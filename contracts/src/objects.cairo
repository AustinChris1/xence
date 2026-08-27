//! Types shared with the STRK20 pool, plus the minimal ERC-20 surface a helper actually needs.

use starknet::ContractAddress;

/// Instruction telling the pool which open note to credit, with what.
#[derive(Serde, Copy, Drop, PartialEq, Debug)]
pub struct OpenNoteDeposit {
    /// The identifier of the open note to deposit into.
    pub note_id: felt252,
    /// The ERC-20 token contract to deposit.
    pub token: ContractAddress,
    /// The amount of tokens to deposit.
    pub amount: u128,
}

/// The minimal ERC-20 surface this helper needs: approve the pool to pull the output.
#[starknet::interface]
pub trait IERC20<T> {
    fn approve(ref self: T, spender: ContractAddress, amount: u256) -> bool;
    fn balance_of(self: @T, account: ContractAddress) -> u256;
    fn transfer(ref self: T, recipient: ContractAddress, amount: u256) -> bool;
}

/// Which leg of the forecast lifecycle a `privacy_invoke` call is driving.
#[derive(Serde, Copy, Drop, PartialEq, Debug)]
pub enum ForecastOperation {
    /// Seal a forecast and park the bond.
    Commit,
    /// Open the seal, settle against the oracle, credit an open note.
    Settle,
}

/// Lifecycle of a single sealed forecast.
pub mod state {
    pub const NONE: u8 = 0;
    pub const SEALED: u8 = 1;
    pub const SETTLED: u8 = 2;
    pub const FORFEITED: u8 = 3;
}

/// `above` means the observed value must be greater than or equal to the strike.
pub mod comparator {
    pub const BELOW: u8 = 0;
    pub const ABOVE: u8 = 1;
}

/// What a question is about. Prices come from the Pragma median; metrics are
/// any ERC-20 balance on Starknet read at the horizon: pool TVL, protocol
/// treasuries, bridge escrows. That turns "coin prediction" into "forecast
/// any measurable on-chain fact".
pub mod question_kind {
    pub const PRICE: u8 = 0;
    pub const METRIC: u8 = 1;
}
