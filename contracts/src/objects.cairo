//! Types shared with the STRK20 pool, plus the minimal ERC-20 surface a helper
//! actually needs.

use starknet::ContractAddress;

/// Instruction telling the pool which open note to credit, with what.
///
/// This mirrors `privacy::objects::OpenNoteDeposit` from the starknet-privacy
/// monorepo field-for-field. It is redeclared here rather than pulled in as a
/// git dependency because the pool deserializes our return value structurally —
/// what matters is the layout, not the nominal type — and a helper that holds
/// user funds is better off with a dependency surface of zero.
///
/// If upstream ever changes this struct, this declaration must change with it.
#[derive(Serde, Copy, Drop, PartialEq, Debug)]
pub struct OpenNoteDeposit {
    /// The identifier of the open note to deposit into.
    pub note_id: felt252,
    /// The ERC-20 token contract to deposit.
    pub token: ContractAddress,
    /// The amount of tokens to deposit.
    pub amount: u128,
}

/// The minimal ERC-20 surface this helper needs: approve the pool to pull the
/// output, verify what actually arrived, and pay the keeper reward on forfeit.
#[starknet::interface]
pub trait IERC20<T> {
    fn approve(ref self: T, spender: ContractAddress, amount: u256) -> bool;
    fn balance_of(self: @T, account: ContractAddress) -> u256;
    fn transfer(ref self: T, recipient: ContractAddress, amount: u256) -> bool;
}

/// Which leg of the forecast lifecycle a `privacy_invoke` call is driving.
#[derive(Serde, Copy, Drop, PartialEq, Debug)]
pub enum ForecastOperation {
    /// Seal a forecast and park the bond. Returns an empty span.
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

/// `above` means the price must be greater than or equal to the strike.
pub mod comparator {
    pub const BELOW: u8 = 0;
    pub const ABOVE: u8 = 1;
}
