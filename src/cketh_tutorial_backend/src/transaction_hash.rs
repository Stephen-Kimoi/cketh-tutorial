use std::sync::Mutex;
use lazy_static::lazy_static;

lazy_static! {
    pub static ref CK_SEPOLIA_ETH_HASHES: Mutex<Vec<String>> = Mutex::new(Vec::new());
    pub static ref CK_SEPOLIA_USDC_HASHES: Mutex<Vec<String>> = Mutex::new(Vec::new());
}