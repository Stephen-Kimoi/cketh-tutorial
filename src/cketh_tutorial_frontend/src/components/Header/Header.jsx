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
  const [byte32Address, setByte32Address] = useState("");
  const [canisterDepositAddress, setCanisterDepositAddress] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [principalId, setPrincipalId] = useState("");
  const [ckEthBalance, setCkEthBalance] = useState(null);
  const [generatedByte32Address, setGeneratedByte32Address] = useState("");

  const depositAddress = async () => {
    const depositAddress = await cketh_tutorial_backend.canister_deposit_principal();
    console.log("Deposit Address: ", depositAddress);
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

  const depositckETH = async () => {
    console.log("Deposit ckETH: ", byte32Address);
  }

  const changeAmountHandler = (e) => {
    let amount = e.target.valueAsNumber;
    if (Number.isNaN(amount) || amount < 0) amount = 0;
    setAmount(amount);
  };

  const changeAddressHandler = (e) => {
    setCanisterDepositAddress(e.target.value);
  };

  const setByte32AddressHandler = (e) => {
    setByte32Address(e.target.value);
  };

  const changeTransactionHashHandler = (e) => {
    setTransactionHash(e.target.value);
  };

  // New functions
  const checkCkEthBalance = async () => {
    try {
      setLoading(true);
      const balance = await cketh_tutorial_backend.balance(principalId);
      setCkEthBalance(balance.toString());
      toast.success("Balance fetched successfully");
    } catch (error) {
      toast.error("Failed to fetch balance");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateByte32Address = async () => {
    try {
      setLoading(true);
      const byte32Address = await cketh_tutorial_backend.convert_principal_to_byte32(principalId);
      setGeneratedByte32Address(byte32Address);
      toast.success("Byte32 address generated successfully");
    } catch (error) {
      toast.error("Failed to generate byte32 address");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const changePrincipalIdHandler = (e) => {
    setPrincipalId(e.target.value);
  };

  return (
    <div className='container'>
      <ToastContainer />
      <h1 className='title'>ckSepoliaETH Tester</h1>
      
      <div className='wallet-info'>
        {isConnected ? (
          <p>Connected Wallet: <strong>{address}</strong></p>
        ) : (
          <p>No wallet connected</p>
        )}
      </div>
      
      <div className='sections-container'>
        <div className='section-row'>
          <div className='section'>
            <h2>Get canister byte32 address:</h2>
            <button onClick={depositAddress} className='button'>Get Canister byte32 Address</button>
            <div>Byte 32 Address is: {canisterDepositAddress}</div>
          </div>

          <div className='section'>
            <h2>Deposit ckETH</h2>
            <div className='form'>
              <label>Byte32 Address:</label>
              <input 
                type="text" 
                value={canisterDepositAddress} 
                onChange={changeAddressHandler} 
                placeholder="Byte32 Deposit Address" 
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
                {(isWriteLoading || isTxLoading) ? 'Sending ckETH to address...' : 'Deposit ckETH'}
              </button>
              {(isWriteLoading || isTxLoading) && <div className="loading-indicator">Loading...</div>}
            </div>
          </div>
        </div>

        <div className='section-row'>
          <div className='section'>
            <h2>Check ckETH Balance</h2>
            <div className='form'>
              <input 
                type="text" 
                value={principalId} 
                onChange={changePrincipalIdHandler} 
                placeholder="Principal ID" 
                className='input'
              />
              <button onClick={checkCkEthBalance} disabled={loading} className='button'>
                {loading ? 'Checking...' : 'Check Balance'}
              </button>
            </div>
            {ckEthBalance !== null && (
              <div className='balance-display'>
                <p>ckETH Balance: {ckEthBalance}</p>
              </div>
            )}
          </div>

          <div className='section'>
            <h2>Generate Byte32 Address</h2>
            <div className='form'>
              <input 
                type="text" 
                value={principalId} 
                onChange={changePrincipalIdHandler} 
                placeholder="Principal ID" 
                className='input'
              />
              <button onClick={generateByte32Address} disabled={loading} className='button'>
                {loading ? 'Generating...' : 'Generate Byte32 Address'}
              </button>
            </div>
            {generatedByte32Address && (
              <div className='address-display'>
                <p>Generated Byte32 Address: {generatedByte32Address}</p>
              </div>
            )}
          </div>

          <div className='section'>
            <h2>Verify Transaction</h2>
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
            </div>
            {isVerifying && <div className="loading-indicator">Verifying transaction...</div>}
          </div>
        </div>

        {verificationResult && (
          <div className='verification-result'>
            <h2>Verification Result:</h2>
            <pre>{JSON.stringify(verificationResult, null, 2)}</pre>
          </div>
        )}

        {verificationError && (
          <div className='error-message'>
            <p>{verificationError}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;