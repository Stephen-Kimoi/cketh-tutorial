import { useState } from 'react';
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi'; 
import { MinterHelper as contractAddress } from '../contracts/contracts-address.json'; 
import { parseEther } from 'viem';
import abi from '../contracts/MinterHelper.json'
import './Header.css'
import { cketh_tutorial_backend } from 'declarations/cketh_tutorial_backend';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Header() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState(0);
  const [canisterDepositAddress, setCanisterDepositAddress] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false); // State for loading
  const [verificationError, setVerificationError] = useState(null); // State for error

  const depositAddress = async () => {
    const depositAddress = await cketh_tutorial_backend.canister_deposit_principal();
    console.log("Deposit Address: ", depositAddress);
    setCanisterDepositAddress(depositAddress);
  };
   
  // Calling the deposit function in the helper contract
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

  const verifyTransaction = async (hash) => {
    setIsVerifying(true); // Start loading
    setVerificationError(null); // Reset error state

    try {
      const result = await cketh_tutorial_backend.verify_transaction(hash);
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

  const changeAmountHandler = (e) => {
    let amount = e.target.valueAsNumber;
    if (Number.isNaN(amount) || amount < 0) amount = 0;
    setAmount(amount);
  };

  const changeAddressHandler = (e) => {
    setCanisterDepositAddress(e.target.value);
  };

  const changeTransactionHashHandler = (e) => {
    setTransactionHash(e.target.value);
  };

  return (
    <div className='container'>
      <ToastContainer />
      <h1 className='title'>ckSepoliaETH Tester</h1>
      
      {/* Connected Wallet Address Section */}
      <div className='wallet-info'>
        {isConnected ? (
          <p>Connected Wallet: <strong>{address}</strong></p>
        ) : (
          <p>No wallet connected</p>
        )}
      </div>

      <button onClick={depositAddress} className='button'>Get Deposit Address</button>
      <div className='form'>
        <input 
          type="text" 
          value={canisterDepositAddress} 
          onChange={changeAddressHandler} 
          placeholder="Canister Deposit Address" 
          disabled={isWriteLoading || isTxLoading}
          className='input'
        />
        <input 
          type="number" 
          value={amount} 
          onChange={changeAmountHandler} 
          placeholder="Amount" 
          disabled={isWriteLoading || isTxLoading}
          className='input'
        />
        <button onClick={() => write()} disabled={isWriteLoading || isTxLoading} className='button'>
          {(isWriteLoading || isTxLoading) ? 'Processing...' : 'Deposit'}
        </button>
        {(isWriteLoading || isTxLoading) && <div className="loading-indicator">Loading...</div>}
      </div>

      {/* New input for transaction hash */}
      <div className='form'>
        <input 
          type="text" 
          value={transactionHash} 
          onChange={changeTransactionHashHandler} 
          placeholder="Transaction Hash" 
          disabled={isVerifying}
          className='input'
        />
        <button onClick={() => verifyTransaction(transactionHash)} disabled={isVerifying} className='button'>
          {isVerifying ? 'Verifying...' : 'Verify Transaction'}
        </button>
        {isVerifying && <div className="loading-indicator">Verifying transaction...</div>}
      </div>

      {/* Display verification result */}
      {verificationResult && (
        <div className='verification-result'>
          <h2>Verification Result:</h2>
          <pre>{JSON.stringify(verificationResult, null, 2)}</pre>
        </div>
      )}

      {/* Display verification error */}
      {verificationError && (
        <div className='error-message'>
          <p>{verificationError}</p>
        </div>
      )}
    </div>
  );
}

export default Header;
