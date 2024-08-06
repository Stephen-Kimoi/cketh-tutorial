# Getting Started with ckETH: A Step-by-Step Guide

This tutorial will guide you through the process of working with ckETH, from generating a subaccount for ETH deposits to minting ckETH and verifying transactions on-chain. By the end of this tutorial, you will have a basic understanding of how to interact with the ckETH protocol using a Rust backend and a React frontend.

Slides on ckETH explanation can be found [here](https://www.canva.com/design/DAGNHEG_n-Y/Z8vo3oZsTnxMINLBlyizYw/edit)

## Prerequisites

Before we begin, ensure you have the following:

- You've installed [necessary environment requirements](https://internetcomputer.org/docs/current/developer-docs/getting-started/install/)
- [MetaMask installed in your browser](https://metamask.io/download/) with [Sepolia ETH (testnet) tokens](https://www.alchemy.com/faucets/ethereum-sepolia)
- Basic knowledge oF rust

## Install project template
I have created a simple template that comes with the configurations for calling the heloper smart contract on Ethereum, this allows you to only focus on the backend logic for intergrating ckETH

Here's the [link to the repo](https://github.com/Stephen-Kimoi/starter-template)

## Step 0(a): Setting Up the Project
Clone the project template from the link provided above. 

```bash
git clone https://github.com/Stephen-Kimoi/starter-template.git
```

```bash 
cd starter-template && npm install
```

Give permissions to the script
```bash 
chmod +x ./did.sh
```

Start the local replica for dfx 
```bash dfx 
dfx start --clean --background
```

Deploy the backend canister
```bash
./did.sh && dfx generate cketh_starter_backend && dfx deploy cketh_starter_backend
```

Start the frontend 
```bash 
npm run start 
```

## Step 0(b): Understanding the frontend logic

## 1. `depositAddress`

### Description
The `depositAddress` function is responsible for retrieving a unique deposit address from the backend canister on the Internet Computer. This address is where the user will send their Ethereum deposit.

### Usage
- **Purpose**: Fetches and sets the deposit address in the `canisterDepositAddress` state.
- **Called When**: The user clicks the "Get Deposit Address" button.

### Code Example
```javascript
const depositAddress = async () => {
  const depositAddress = await cketh_starter_backend.canister_deposit_principal();
  console.log("Deposit Address: ", depositAddress);
  setCanisterDepositAddress(depositAddress);
};
```

### Key Points
- **Async Operation**: The function is asynchronous, ensuring that the deposit address is retrieved properly before updating the state.
- **State Update**: After fetching the address, it updates the `canisterDepositAddress` state to make it available for subsequent transactions.

## 2. `write`

### Description
The `write` function interacts with the `MinterHelper` smart contract on Ethereum to execute the `deposit` method. This method sends the specified amount of Ethereum to the deposit address.

### Usage
- **Purpose**: Initiates a transaction to deposit Ethereum into the deposit address.
- **Called When**: The user clicks the "Deposit" button.

### Code Example
```javascript
const { write, data, isLoading: isWriteLoading } = useContractWrite({
  address: contractAddress,
  abi: abi,
  functionName: "deposit",
  value: parseEther(amount.toString()),
  args: [canisterDepositAddress],
  onSuccess(data) {
    toast.info("Sending ETH to the helper contract");
  },
  onError(error) {
    toast.error("Failed to send ETH");
    console.error(error);
  }
});
```

### Key Points
- **Parameters**: Sends the Ethereum amount and deposit address as arguments to the `deposit` function in the smart contract.
- **Notification**: Provides user feedback through toast notifications upon success or error.
- **Loading State**: Manages the loading state with `isWriteLoading` to disable inputs and buttons during the transaction.

## 3. `useWaitForTransaction`

### Description
The `useWaitForTransaction` hook monitors the status of the Ethereum transaction initiated by the `write` function. Once the transaction is confirmed, it triggers the `verifyTransaction` function.

### Usage
- **Purpose**: Waits for transaction confirmation and initiates verification.
- **Called When**: Automatically triggered after a transaction hash is generated.

### Code Example
```javascript
const { isLoading: isTxLoading } = useWaitForTransaction({
  hash: data?.hash,
  onSuccess() {
    toast.info("Verifying the transaction on-chain");
    verifyTransaction(data.hash);
  },
  onError(error) {
    toast.error("Transaction failed or rejected");
    console.error(error);
  }
});
```

### Key Points
- **Transaction Monitoring**: It checks the status of the transaction using its hash.
- **Verification Trigger**: On success, it calls the `verifyTransaction` function to validate the transaction on-chain.

## 4. `verifyTransaction`

### Description
The `verifyTransaction` function is responsible for verifying a transaction on the Ethereum blockchain by interacting with the backend canister on the Internet Computer.

### Usage
- **Purpose**: Verifies the transaction using its hash and retrieves the result.
- **Called When**: 
  - Automatically after a transaction is confirmed.
  - Manually when the user inputs a transaction hash and clicks the "Verify Transaction" button.

### Code Example
```javascript
const verifyTransaction = async (hash) => {
  setIsVerifying(true); // Start loading
  setVerificationError(null); // Reset error state

  try {
    const result = await cketh_starter_backend.verify_transaction(hash);
    setVerificationResult(result); // Store the verification result
    toast.success("Transaction verified successfully");
  } catch (error) {
    setVerificationError("Verification failed. Please check the transaction hash and try again.");
    toast.error("Verification failed");
    console.error(error);
  } finally {
    setIsVerifying(false); // Stop loading
  }
};
```

### Key Points
- **Transaction Hash**: Takes the transaction hash as an argument.
- **Async Operation**: This function is asynchronous and updates the UI based on success or failure.
- **Error Handling**: Catches errors during the verification process and displays appropriate messages.
- **State Management**: Updates `isVerifying`, `verificationResult`, and `verificationError` states to reflect the current status of the verification process.

## 5. `changeAmountHandler`

### Description
The `changeAmountHandler` function manages changes to the deposit amount input field, ensuring that only valid numerical values are accepted.

### Usage
- **Purpose**: Updates the `amount` state based on user input.
- **Called When**: The user types in the "Amount" input field.

### Code Example
```javascript
const changeAmountHandler = (e) => {
  let amount = e.target.valueAsNumber;
  if (Number.isNaN(amount) || amount < 0) amount = 0;
  setAmount(amount);
};
```

### Key Points
- **Input Validation**: Ensures that the input is a positive number or resets it to zero.
- **State Update**: Directly updates the `amount` state based on user input.

## 6. `changeAddressHandler`

### Description
The `changeAddressHandler` function handles changes to the deposit address input field.

### Usage
- **Purpose**: Updates the `canisterDepositAddress` state with the user's input.
- **Called When**: The user types in the "Canister Deposit Address" input field.

### Code Example
```javascript
const changeAddressHandler = (e) => {
  setCanisterDepositAddress(e.target.value);
};
```

### Key Points
- **State Update**: Directly updates the `canisterDepositAddress` state with the new input value.

## 7. `changeTransactionHashHandler`

### Description
The `changeTransactionHashHandler` function is responsible for managing changes to the transaction hash input field.

### Usage
- **Purpose**: Updates the `transactionHash` state with the user-provided hash.
- **Called When**: The user types in the "Transaction Hash" input field.

### Code Example
```javascript
const changeTransactionHashHandler = (e) => {
  setTransactionHash(e.target.value);
};
```

### Key Points
- **State Update**: Directly updates the `transactionHash` state with the new hash value.

## Step 1: Generating a Subaccount from a Principal ID

The first step is to create a function that converts a Principal ID into a subaccount. This subaccount is necessary for depositing ETH.

### Backend Code

```rust
use b3_utils::{vec_to_hex_string_with_0x, Subaccount};
use candid::Principal;

#[ic_cdk::query]
fn canister_deposit_principal() -> String {
    let subaccount = Subaccount::from(ic_cdk::id());

    let bytes32 = subaccount.to_bytes32().unwrap();

    vec_to_hex_string_with_0x(bytes32)
}
```

This function generates a deposit address that you can use to mint ckETH to the new subaccount.

## Step 2: Minting ckETH Tokens

Once you have the deposit principal, the next step is to mint ckETH tokens by calling the `deposit` function in the ckETH helper contract with the generated address as the argument.

### Contract Information

Inside the `_components/contracts` directory, you will find:

- The contract address of the minter helper located at `contract-address.json`.
- The ABI of the minter helper located at `MinterHelper.json`.

### Frontend Code

Here's how to integrate the deposit function in your frontend:

```javascript
import { useAccount, useContractWrite } from 'wagmi';
import { parseEther } from 'viem';
import { MinterHelper as contractAddress } from '../contracts/contracts-address.json';
import abi from '../contracts/MinterHelper.json';
import { toast } from 'react-toastify';

function Header() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState(0);
  const [canisterDepositAddress, setCanisterDepositAddress] = useState("");

  const depositAddress = async () => {
    const depositAddress = await cketh_tutorial_backend.canister_deposit_principal();
    setCanisterDepositAddress(depositAddress);
  };

  const { write, data, isLoading: isWriteLoading } = useContractWrite({
    address: contractAddress,
    abi: abi,
    functionName: "deposit",
    value: parseEther(amount.toString()),
    args: [canisterDepositAddress],
    onSuccess(data) {
      toast.info("Sending ETH to the helper contract");
    },
    onError(error) {
      toast.error("Failed to send ETH");
      console.error(error);
    }
  });

  return (
    // Your JSX code for rendering the UI
  );
}
```

This code snippet allows users to connect their MetaMask wallet, input an amount, and click the "Deposit" button to mint ckETH to the generated principal address.

## Step 3: Verifying the Transaction On-Chain

After minting ckETH, it's crucial to verify the transaction on-chain. This involves checking several details:

- The transaction status should be `1` (indicating success).
- The `to` address must match the minter address.
- The logs must include the correct deposit principal.

### Backend Code

First, test the transaction by getting the receipt:

```rust
#[ic_cdk::update]
async fn get_receipt(hash: String) -> String {
    let receipt = eth_get_transaction_receipt(hash).await.unwrap();
    let wrapper = receipt::ReceiptWrapper::from(receipt);
    serde_json::to_string(&wrapper).unwrap()
}
```

Now, create a function to verify the transaction:

```rust
#[ic_cdk::update]
async fn verify_transaction(hash: String) -> Result<receipt::VerifiedTransactionDetails, String> {
    let receipt = match eth_get_transaction_receipt(hash.clone()).await {
        Ok(receipt) => receipt,
        Err(e) => return Err(format!("Failed to get receipt: {}", e)),
    };

    let receipt_data = match receipt {
        GetTransactionReceiptResult::Ok(Some(data)) => data,
        GetTransactionReceiptResult::Ok(None) => return Err("Receipt is None".to_string()),
        GetTransactionReceiptResult::Err(e) => return Err(format!("Error on Get transaction receipt result: {:?}", e)),
    };

    let success_status = Nat::from(1u8);
    if receipt_data.status != success_status {
        return Err("Transaction failed".to_string());
    }

    if receipt_data.to != MINTER_ADDRESS {
        return Err("Minter address does not match".to_string());
    }

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
```

### Frontend Code for Verification

Add a section in your frontend to input a transaction hash and verify it:

```javascript
function Header() {
  // Other states and functions...

  const [transactionHash, setTransactionHash] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(null);

  const verifyTransaction = async (hash) => {
    setIsVerifying(true);
    setVerificationError(null);

    try {
      const result = await cketh_tutorial_backend.verify_transaction(hash);
      setVerificationResult(result);
      toast.success("Transaction verified successfully");
    } catch (error) {
      setVerificationError("Verification failed. Please check the transaction hash and try again.");
      toast.error("Verification failed");
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    // Your JSX code for rendering the UI
  );
}
```

This allows users to verify the transaction by inputting the transaction hash.

## Conclusion

You have now successfully created a ckETH integration with Rust and React, including depositing ETH, minting ckETH, and verifying the transaction on-chain. This tutorial provides a solid foundation for working with ckETH and can be expanded to include more features as needed.
