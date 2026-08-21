//! # Xence
//!
//! Sealed forecast bonds and public calibration, settled through the STRK20
//! privacy pool.
//!
//! Two contracts:
//!
//! - [`vault`] — `XenceVault`, the anonymizer. A stateful `privacy_invoke`
//!   helper that parks a bond when a forecast is sealed and credits an open
//!   note when it settles.
//! - [`registry`] — `XenceRegistry`, the public reputation ledger. Holds no
//!   funds and knows nothing about wallets; only pseudonymous keys and scores.
//!
//! ## ⚠ Draft — not audited
//!
//! An anonymizer contract holds user funds across transactions and is the app
//! team's code to review and audit. This is a first draft written against the
//! documented `privacy_invoke` pattern. It has NOT been audited and has NOT
//! been reviewed by StarkWare. Read it before you trust it with anything.

pub mod objects;
pub mod scoring;
pub mod pragma;
pub mod registry;
pub mod vault;
