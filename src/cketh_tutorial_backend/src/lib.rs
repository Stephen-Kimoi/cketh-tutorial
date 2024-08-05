use b3_utils::{vec_to_hex_string_with_0x, Subaccount}; 
use evm_rpc_canister_types::{
    EthSepoliaService, EvmRpcCanister, GetTransactionReceiptResult, MultiGetTransactionReceiptResult, RpcServices
};
use candid::{Nat, Principal};

mod receipt;

pub const EVM_RPC_CANISTER_ID: Principal =
  Principal::from_slice(b"\x00\x00\x00\x00\x02\x30\x00\xCC\x01\x01"); // 7hfb6-caaaa-aaaar-qadga-cai
pub const EVM_RPC: EvmRpcCanister = EvmRpcCanister(EVM_RPC_CANISTER_ID);

const MINTER_ADDRESS: &str = "0xb44b5e756a894775fc32eddf3314bb1b1944dc34";  // Minter address for ckSepoliaETH

impl From<GetTransactionReceiptResult> for receipt::ReceiptWrapper {
    fn from(result: GetTransactionReceiptResult) -> Self {
        match result {
            GetTransactionReceiptResult::Ok(receipt) => {
                if let Some(receipt) = receipt {
                    receipt::ReceiptWrapper::Ok(receipt::TransactionReceiptData {
                        to: receipt.to,
                        status: receipt.status.to_string(),
                        transaction_hash: receipt.transactionHash,
                        block_number: receipt.blockNumber.to_string(),
                        from: receipt.from,
                        logs: receipt.logs.into_iter().map(|log| receipt::LogEntry {
                            address: log.address,
                            topics: log.topics,
                        }).collect(),
                    })
                } else {
                    receipt::ReceiptWrapper::Err("Receipt is None".to_string())
                }
            },
            GetTransactionReceiptResult::Err(e) => receipt::ReceiptWrapper::Err(format!("Error on Get transaction receipt result: {:?}", e)),
        }
    }
}

// Function 1: Converting the principal object into a subaccount from the principal ID - this is necessary for depositing ETH 
#[ic_cdk::query] 
fn canister_deposit_principal() -> String {
    let subaccount = Subaccount::from(ic_cdk::id()); 

    let bytes32 = subaccount.to_bytes32().unwrap(); 

    vec_to_hex_string_with_0x(bytes32)
}

// Function 2: Testing get receipt function
#[ic_cdk::update]
async fn get_receipt(hash: String) -> String {
    let receipt = eth_get_transaction_receipt(hash).await.unwrap();
    let wrapper = receipt::ReceiptWrapper::from(receipt);
    serde_json::to_string(&wrapper).unwrap()
}

// Function 3: Verifying the transaction on-chain 
#[ic_cdk::update]
async fn verify_transaction(hash: String) -> Result<receipt::VerifiedTransactionDetails, String> {
    // Get the transaction receipt
    let receipt = match eth_get_transaction_receipt(hash.clone()).await {
        Ok(receipt) => receipt,
        Err(e) => return Err(format!("Failed to get receipt: {}", e)),
    };

    // Ensure the transaction was successful
    let receipt_data = match receipt {
        GetTransactionReceiptResult::Ok(Some(data)) => data,
        GetTransactionReceiptResult::Ok(None) => return Err("Receipt is None".to_string()),
        GetTransactionReceiptResult::Err(e) => return Err(format!("Error on Get transaction receipt result: {:?}", e)),
    };

    // Check if the status indicates success (Nat 1)
    let success_status = Nat::from(1u8);
    if receipt_data.status != success_status {
        return Err("Transaction failed".to_string());
    }

    // Verify the 'to' address matches the minter address
    if receipt_data.to != MINTER_ADDRESS {
        return Err("Minter address does not match".to_string());
    }

    // Extract relevant transaction details
    Ok(receipt::VerifiedTransactionDetails {
        to: receipt_data.to.clone(),
        status: receipt_data.status.to_string(),
        transaction_hash: receipt_data.transactionHash.clone(),
        block_number: receipt_data.blockNumber.to_string(),
        from: receipt_data.from.clone(),
        logs: receipt_data.logs.into_iter().map(|log| receipt::LogEntry {
            address: log.address,
            topics: log.topics,
        }).collect(),
    })
}

// HELPER FUNCTIONS

// Function for getting transaction receipt the transaction hash
async fn eth_get_transaction_receipt(hash: String) -> Result<GetTransactionReceiptResult, String> {
    // Make the call to the EVM_RPC canister
    let result: Result<(MultiGetTransactionReceiptResult,), String> = EVM_RPC 
        .eth_get_transaction_receipt(
            RpcServices::EthSepolia(Some(vec![
                EthSepoliaService::PublicNode,
                EthSepoliaService::BlockPi,
                EthSepoliaService::Ankr,
            ])),
            None, 
            hash, 
            10_000_000_000
        )
        .await 
        .map_err(|e| format!("Failed to call eth_getTransactionReceipt: {:?}", e));

    match result {
        Ok((MultiGetTransactionReceiptResult::Consistent(receipt),)) => {
            Ok(receipt)
        },
        Ok((MultiGetTransactionReceiptResult::Inconsistent(error),)) => {
            Err(format!("EVM_RPC returned inconsistent results: {:?}", error))
        },
        Err(e) => Err(format!("Error calling EVM_RPC: {}", e)),
    }    
}

ic_cdk::export_candid!();