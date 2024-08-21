use candid::{Nat, Principal};
use b3_utils::ledger::{ICRCAccount, ICRC1, ICRC1TransferArgs, ICRC1TransferResult};
use b3_utils::api::{InterCall, CallCycles}; 
use b3_utils::caller_is_controller;

use crate::{canister_id, minter, transaction_hash}; 

// Fetching canister's balance of ckETH
#[ic_cdk::update]
async fn ck_sepolia_eth_balance(principal_id: Principal) -> Nat {
    let account = ICRCAccount::new(principal_id, None);

    ICRC1::from(canister_id::CK_SEPOLIA_ETH_LEDGER).balance_of(account).await.unwrap()
}

// Transfering a specified amount of ckETH to another account 
#[ic_cdk::update]
async fn ck_sepolia_eth_transfer(to: String, amount: Nat) -> ICRC1TransferResult {
    let to = ICRCAccount::from_text(&to).unwrap(); 
    
    let transfer_args = ICRC1TransferArgs {
        to, 
        amount, 
        from_subaccount: None, 
        fee: None, 
        memo: None, 
        created_at_time: None, 
    }; 

    ICRC1::from(canister_id::CK_SEPOLIA_ETH_LEDGER).transfer(transfer_args).await.unwrap()
}

// Withdrawing ckETH from the canister
#[ic_cdk::update(guard = "caller_is_controller")]
async fn ck_sepolia_eth_withdraw(amount: Nat, recipient: String) -> minter::WithdrawalResult {
    let withdraw = minter::WithdrawalArg{ 
        amount, 
        recipient
    }; 
    
    InterCall::from(canister_id::CK_SEPOLIA_ETH_MINTER)
    .call(
        "withdraw_eth", 
        withdraw, 
        CallCycles::NoPay
    )
    .await
    .unwrap()
}

// Function to store a transaction hash for ck_sepolia_eth
#[ic_cdk::update]
fn store_ck_sepolia_eth_hash(hash: String) {
    let mut hashes = transaction_hash::CK_SEPOLIA_ETH_HASHES.lock().unwrap();
    hashes.push(hash);
}

// Function to retrieve all transaction hashes for ck_sepolia_eth
#[ic_cdk::query]
fn get_ck_sepolia_eth_hashes() -> Vec<String> {
    let hashes = transaction_hash::CK_SEPOLIA_ETH_HASHES.lock().unwrap();
    hashes.clone()
}