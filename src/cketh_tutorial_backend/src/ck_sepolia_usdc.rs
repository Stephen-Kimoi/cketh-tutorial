use candid::{Nat, Principal};
use b3_utils::Subaccount;
use b3_utils::ledger::{ICRCAccount, ICRC1, ICRC2ApproveArgs, ICRC2ApproveResult};
use b3_utils::api::{InterCall, CallCycles}; 
use ic_cdk::api::call::CallResult;

use crate::{canister_id, transaction_hash, withdraw};

#[ic_cdk::update]
async fn check_ckusdc_balance(principal_id: Principal) -> Nat {
  let account = ICRCAccount::new(principal_id, None);

  ICRC1::from(canister_id::CK_SEPOLIA_USDC_LEDGER_CANISTER).balance_of(account).await.unwrap()
}

#[ic_cdk::update] 
async fn approve_cketh_burning(user_principal: Principal, amount: Nat) -> ICRC2ApproveResult {
    let from_subaccount = Subaccount::from(user_principal);
    
    // Use the ckETH minter as the spender
    let minter_principal = Principal::from_text(canister_id::CK_SEPOLIA_ETH_MINTER).expect("Invalid minter principal");
    let spender = ICRCAccount::new(minter_principal, None);

    let approve_args = ICRC2ApproveArgs {
        from_subaccount: Some(from_subaccount), 
        spender, 
        amount, 
        expected_allowance: None,
        expires_at: None,
        fee: None, 
        created_at_time: None, 
        memo: None 
    }; 

    InterCall::from(canister_id::CK_SEPOLIA_ETH_LEDGER).call(
        "icrc2_approve", 
        approve_args, 
        CallCycles::NoPay
    )
    .await 
    .unwrap()
}
 
#[ic_cdk::update]
async fn approve_usdc_burning(user_principal: Principal, amount: Nat) -> ICRC2ApproveResult {
    let from_subaccount = Subaccount::from(user_principal);
    
    // Convert minter Principal to ICRCAccount
    let minter_principal = Principal::from_text(canister_id::CK_SEPOLIA_ETH_MINTER).expect("Invalid minter principal");
    let spender = ICRCAccount::new(minter_principal, None);

    let approve_args = ICRC2ApproveArgs {
        from_subaccount: Some(from_subaccount),
        spender,
        amount,
        expected_allowance: None,
        expires_at: None,
        fee: None,
        created_at_time: None,
        memo: None
    };

    InterCall::from(canister_id::CK_SEPOLIA_ETH_LEDGER).call(
        "icrc2_approve",
        approve_args,
        CallCycles::NoPay
    )
    .await
    .unwrap()
}

#[ic_cdk::update]
async fn withdraw_ckusdc_to_ethereum(amount: Nat, eth_address: String) -> CallResult<withdraw::WithdrawErc20Result> {
    let args = withdraw::WithdrawErc20Args {
        ckerc20_ledger_id: Principal::from_text(canister_id::CK_SEPOLIA_USDC_LEDGER_CANISTER).expect("Invalid USDC ledger principal"),
        recipient: eth_address,
        amount,
    };

    InterCall::from(canister_id::CK_SEPOLIA_ETH_MINTER).call(
        "withdraw_erc20",
        args,
        CallCycles::NoPay
    )
    .await
    .unwrap()
}

// Function to store a transaction hash for ck_sepolia_usdc
#[ic_cdk::update]
fn store_ck_sepolia_usdc_hash(hash: String) {
    let mut hashes = transaction_hash::CK_SEPOLIA_USDC_HASHES.lock().unwrap();
    hashes.push(hash);
}

// Function to retrieve all transaction hashes for ck_sepolia_usdc
#[ic_cdk::query]
fn get_ck_sepolia_usdc_hashes() -> Vec<String> {
    let hashes = transaction_hash::CK_SEPOLIA_USDC_HASHES.lock().unwrap();
    hashes.clone()
}