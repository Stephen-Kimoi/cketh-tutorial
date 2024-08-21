pub const CK_SEPOLIA_ETH_MINTER_ADDRESS: &str = "0xb44b5e756a894775fc32eddf3314bb1b1944dc34";  // Minter address for ckSepoliaETH
pub const CK_SEPOLIA_ETH_LEDGER: &str = "apia6-jaaaa-aaaar-qabma-cai";
pub const CK_SEPOLIA_ETH_MINTER: &str = "jzenf-aiaaa-aaaar-qaa7q-cai";

pub const CK_SEPOLIA_ERC20_LEDGER_SUITE_ORCHESTRATOR_CANISTER: &str = "2s5qh-7aaaa-aaaar-qadya-cai";

pub const SEPOLIA_CHAIN_ID: &str = "11155111";
pub const ETHEREUM_CHAIN_ID: &str = "1";
pub const SEPOLIA_USDC_ADDRESS: &str = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
pub const ETHEREUM_USDC_ADDRESS: &str = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

pub const CK_SEPOLIA_USDC_LEDGER_CANISTER: &str = "yfumr-cyaaa-aaaar-qaela-cai"; 
pub const CK_SEPOLIA_USDC_INDEX_CANISTER: &str = "ycvkf-paaaa-aaaar-qaelq-cai"; 

/// Returns the canister ID for the ckSepoliaETH ledger.
#[ic_cdk::query]
pub async fn ck_sepolia_eth_ledger_canister_id() -> &'static str {
    CK_SEPOLIA_ETH_LEDGER
}

/// Returns the canister ID for the ckSepoliaETH minter.
#[ic_cdk::query]
pub async fn ck_sepolia_eth_minter_canister_id() -> &'static str {
    CK_SEPOLIA_ETH_MINTER
}

/// Returns the canister ID for the ckSepoliaUSDC ledger
#[ic_cdk::query]
pub async fn ck_sepolia_usdc_ledger_canister_id() -> &'static str {
    CK_SEPOLIA_USDC_LEDGER_CANISTER
}

/// Returns the canister ID for the ckSepoliaUSDC index.
#[ic_cdk::query]
pub async fn ck_sepolia_usdc_index_canister_id() -> &'static str {
    CK_SEPOLIA_USDC_INDEX_CANISTER
}