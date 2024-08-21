use icrc_ledger_types::icrc1::transfer::NumTokens;
use candid::{Nat, Principal, CandidType, Deserialize};
use icrc_ledger_types::icrc1::account::Account;
use serde::Serialize;

// Withdraw structs
#[derive(candid::CandidType, serde::Deserialize)]
pub struct WithdrawErc20Args {
    pub ckerc20_ledger_id: Principal,
    pub recipient: String,
    pub amount: Nat,
}

#[derive(candid::CandidType, serde::Deserialize)]
pub struct WithdrawErc20Result {
    pub block_index: Nat,
}

// Transfer structs
#[derive(CandidType, Deserialize, Serialize)]
pub struct TransferArgs {
    pub amount: NumTokens,
    pub to_account: Account,
}