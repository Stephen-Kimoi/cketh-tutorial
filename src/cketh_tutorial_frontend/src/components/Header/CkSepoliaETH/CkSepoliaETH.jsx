// CkSepoliaETH.jsx
import { useState } from 'react';
import { ethers } from 'ethers';
// import abi from '../contracts/MinterHelper.json';
import abi from '../contracts/MinterHelper.json'
import MinterHelper from '../contracts/contracts-address.json';
import '../TokenComponent.css';
import { cketh_tutorial_backend } from 'declarations/cketh_tutorial_backend';
import { toast, ToastContainer } from 'react-toastify';
import { Principal } from '@dfinity/principal';
import 'react-toastify/dist/ReactToastify.css';

function CkSepoliaETH({ walletConnected, account }) {
  const [amount, setAmount] = useState(0);
  const [canisterDepositAddress, setCanisterDepositAddress] = useState("");
  const [ckEthBalance, setCkEthBalance] = useState(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [generatedByte32Address, setGeneratedByte32Address] = useState("");
  const [balancePrincipalId, setBalancePrincipalId] = useState("");
  const [generatePrincipalId, setGeneratePrincipalId] = useState("");
  const [isGenerateLoading, setIsGenerateLoading] = useState(false);

  const depositAddress = async () => {
    const depositAddress = await cketh_tutorial_backend.canister_deposit_principal();
    console.log("Deposit Address: ", depositAddress);
    setCanisterDepositAddress(depositAddress);
  };

  const depositckETH = async () => {
    if (!walletConnected) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(MinterHelper.MinterHelper, abi, signer);

      const tx = await contract.deposit(canisterDepositAddress, {
        value: ethers.utils.parseEther(amount.toString())
      });

      toast.info("Sending ETH to the helper contract");
      await tx.wait();
      toast.success("Transaction successful");
    } catch (error) {
      toast.error("Failed to send ETH");
      console.error(error);
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

  const checkCkEthBalance = async () => {
    try {
      setIsBalanceLoading(true);
      const principal = Principal.fromText(balancePrincipalId);
      const balance = await cketh_tutorial_backend.balance(principal);
      setCkEthBalance(balance.toString());
      toast.success("Balance fetched successfully");
    } catch (error) {
      toast.error("Failed to fetch balance");
      console.error(error);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  const generateByte32Address = async () => {
    try {
      setIsGenerateLoading(true);
      const principal = Principal.fromText(generatePrincipalId);
      const byte32Address = await cketh_tutorial_backend.convert_principal_to_byte32(principal);
      setGeneratedByte32Address(byte32Address);
      toast.success("Byte32 address generated successfully");
    } catch (error) {
      toast.error("Failed to generate byte32 address");
      console.error(error);
    } finally {
      setIsGenerateLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Address copied to clipboard");
    }).catch((error) => {
      toast.error("Failed to copy address");
      console.error(error);
    });
  };

  return (
    <div className='container'>
      <ToastContainer />
      <h1 className='title'>CkSepoliaETH Tester</h1>

      <div className='wallet-info'>
        {walletConnected ? (
          <p>Connected Wallet: <strong>{account}</strong></p>
        ) : (
          <p>No wallet connected</p>
        )}
      </div>

      <div className='sections-container'>
        <div className='section-row'>
          <div className='section'>
            <h2>ckSepoliaETH Canister ID</h2>
            {/* <button onClick={depositAddress} className='button'>Get Canister byte32 Address</button> */}
            <div>{canisterDepositAddress}</div>
          </div>

          <div className='section'>
            <h2>Deposit ckSepoliaETH</h2>
            <div className='form'>
              <label>Byte32 Address:</label>
              <input
                type="text"
                value={canisterDepositAddress}
                onChange={changeAddressHandler}
                placeholder="Byte32 Deposit Address"
                className='input'
              />
              <input
                type="number"
                value={amount}
                onChange={changeAmountHandler}
                placeholder="Amount"
                className='input'
              />
              <button onClick={depositckETH} className='button'>
                Deposit ckSepoliaETH
              </button>
            </div>
          </div>
        </div>

        <div className='section-row'>
          <div className='section'>
            <h2>Check ckSepoliaETH Balance</h2>
            <div className='form'>
              <input
                type="text"
                value={balancePrincipalId}
                onChange={(e) => setBalancePrincipalId(e.target.value)}
                placeholder="Principal ID"
                className='input'
              />
              <button onClick={checkCkEthBalance} disabled={isBalanceLoading} className='button'>
                {isBalanceLoading ? 'Checking...' : 'Check Balance'}
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
                value={generatePrincipalId}
                onChange={(e) => setGeneratePrincipalId(e.target.value)}
                placeholder="Principal ID"
                className='input'
              />
              <button onClick={generateByte32Address} disabled={isGenerateLoading} className='button'>
                {isGenerateLoading ? 'Generating...' : 'Generate Byte32 Address'}
              </button>
            </div>
            {generatedByte32Address && (
              <div className='address-display'>
                <p>Generated Byte32 Address: {generatedByte32Address}</p>
                <button onClick={() => copyToClipboard(generatedByte32Address)} className='button'>
                  Copy Address
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documentation Section */}
      <div className='documentation'>
        <h2>How to Mint CkSepoliaETH to Your Principal ID</h2>
        <ol>
          <li><strong>Step 1:</strong> Get the Canister ID/Principal ID.</li>
          <li><strong>Step 2:</strong> Generate Byte32 Address from the <b>Generate Byte32 Address</b> function</li>
          <li><strong>Step 3:</strong> Connect Your Wallet via the <b>Connect Wallet</b> button </li>
          <li><strong>Step 4:</strong> Put the generated Byte32 address in the <b>Deposit ckSepoliaETH section</b> and enter amount of ckSepoliaETH you'd like to deposit</li>
          <li><strong>Step 5:</strong> You can now check the balance of deposited ckETH by checking <b>Check ckSepoliaETH Balance</b> function</li>
        </ol>
        <p><strong>Note:</strong> The "Get canister byte32 address" button generates the byte32 address of the backend canister.</p>
      </div>
    </div>
  );
}

export default CkSepoliaETH;