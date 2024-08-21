import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import abi from '../contracts/SepoliaUSDCAbi.json';
import MinterHelper from '../contracts/contracts-address.json';
import '../TokenComponent.css';
import { cketh_tutorial_backend } from 'declarations/cketh_tutorial_backend';
import { toast, ToastContainer } from 'react-toastify';
import { Principal } from '@dfinity/principal';
import 'react-toastify/dist/ReactToastify.css';
import { FaCopy, FaArrowLeft } from 'react-icons/fa';

function CkSepoliaUSDC({ walletConnected, account }) {
  const [amount, setAmount] = useState(0);
  const [canisterDepositAddress, setCanisterDepositAddress] = useState("");
  const [ckUSDCBalance, setCkUSDCBalance] = useState(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [generatedByte32Address, setGeneratedByte32Address] = useState("");
  const [balancePrincipalId, setBalancePrincipalId] = useState("");
  const [generatePrincipalId, setGeneratePrincipalId] = useState("");
  const [isGenerateLoading, setIsGenerateLoading] = useState(false);
  const [ckSepoliaUSDCid, setSepoliaUSDCid] = useState("");
  const [isDepositLoading, setIsDepositLoading] = useState(false);
  const [isApproveLoading, setIsApproveLoading] = useState(false);
  const [transactionHashes, setTransactionHashes] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptLoading, setIsReceiptLoading] = useState(false);

  // SepoliaUSDC Address
  const SepoliaUSDCAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; 
  
  // Use a standard ERC20 ABI
  const erc20ABI = [
    {
      "constant": false,
      "inputs": [
        {
          "name": "_spender",
          "type": "address"
        },
        {
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "type": "function"
    }
  ];
  
  // Fetching ckSepoliaUSDC Canister ID
  const ckSepoliaUSDCID = async () => {
    const canisterID = await cketh_tutorial_backend.ck_sepolia_usdc_ledger_canister_id();
    setSepoliaUSDCid(canisterID); 
  };

  // Function for getting the deposit address
  const depositAddress = async () => {
    const depositAddress = await cketh_tutorial_backend.canister_deposit_principal();
    setCanisterDepositAddress(depositAddress);
  };
  
  // Function for approving the helper contract to spend Sepolia USDC
  const approveSepoliaUSDC = async () => {
    setIsApproveLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(SepoliaUSDCAddress, erc20ABI, signer);

      const amountInSmallestUnit = ethers.utils.parseUnits(amount.toString(), 6);
    
      const tx = await contract.approve(MinterHelper.SepoliaUSDCHelper, amountInSmallestUnit);
      toast.info("Approving helper contract to spend Sepolia USDC");
      await tx.wait();
      toast.success("Approval successful. You can now proceed with the deposit.");
      console.log("Approval transaction data: ", tx);
    } catch (error) {
      toast.error("Approval failed");
      console.error(error);
    } finally {
      setIsApproveLoading(false);
    }
  };
  
  // Function for calling the "deposit" function in the helper contract
  const depositSepoliaUSDC = async () => {
    if (!walletConnected) {
      toast.error("Wallet not connected");
      return;
    }
  
    setIsDepositLoading(true);
    try {
      // First, approve the helper contract to spend Sepolia USDC
      await approveSepoliaUSDC();
  
      // Convert the amount to the smallest unit
      const amountInSmallestUnit = ethers.utils.parseUnits(amount.toString(), 6);
  
      // Proceed with the deposit after approval
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(MinterHelper.SepoliaUSDCHelper, abi, signer);
  
      const tx = await contract.deposit(SepoliaUSDCAddress, amountInSmallestUnit, canisterDepositAddress);
  
      toast.info("Depositing Sepolia USDC");
      await tx.wait();
      toast.success("Deposit successful");

      // Store transaction hash
      toast.info("Storing transaction hash...");
      await cketh_tutorial_backend.store_ck_sepolia_usdc_hash(tx.hash);
      toast.success("Transaction hash stored");

      // Fetch updated transaction hashes
      fetchTransactionHashes();
    } catch (error) {
      toast.error("Operation failed");
      console.error(error);
    } finally {
      setIsDepositLoading(false);
    }
  };

  const fetchTransactionHashes = async () => {
    try {
      const hashes = await cketh_tutorial_backend.get_ck_sepolia_usdc_hashes();
      setTransactionHashes(hashes);
    } catch (error) {
      toast.error("Failed to fetch transaction hashes");
      console.error(error);
    }
  };

  const getReceipt = async (hash) => {
    setIsReceiptLoading(true);
    try {
      const receipt = await cketh_tutorial_backend.get_receipt(hash);
      setSelectedReceipt(receipt);
      toast.success("Transaction receipt fetched");
    } catch (error) {
      toast.error("Failed to fetch transaction receipt");
      console.error(error);
    } finally {
      setIsReceiptLoading(false);
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

  const checkCkUSDCBalance = async () => {
    try {
      setIsBalanceLoading(true);
      const principal = Principal.fromText(balancePrincipalId);
      const balance = await cketh_tutorial_backend.check_ckusdc_balance(principal);
      setCkUSDCBalance(balance.toString());
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
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        toast.success("Copied to clipboard", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: { backgroundColor: '#007bff', color: '#fff' }
        });
      }).catch((error) => {
        toast.error("Failed to copy", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        console.error(error);
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          toast.success("Copied to clipboard", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: { backgroundColor: '#007bff', color: '#fff' }
          });
        } else {
          throw new Error("Copy command was unsuccessful");
        }
      } catch (err) {
        toast.error("Failed to copy", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        console.error(err);
      }
      document.body.removeChild(textArea);
    }
  };

  useEffect(() => {
    ckSepoliaUSDCID();
    depositAddress();
    fetchTransactionHashes();
  }, []);

  return (
    <div className='container'>
      <ToastContainer />
      <h1 className='title'>CkSepoliaUSDC Tester</h1>

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
            <h2>ckSepoliaUSDC Canister ID</h2>
            <div>
              {ckSepoliaUSDCid}
              <FaCopy
                onClick={() => copyToClipboard(ckSepoliaUSDCid)}
                style={{ cursor: 'pointer', marginLeft: '8px' }}
              />
            </div>
          </div>

          <div className='section'>
            <h2>Deposit ckSepoliaUSDC</h2>
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
              <button onClick={depositSepoliaUSDC} disabled={isDepositLoading || isApproveLoading} className='button'>
                {isDepositLoading ? 'Depositing ckSepoliaUSDC...' : 'Deposit ckSepoliaUSDC'}
              </button>
            </div>
          </div>

          <div className='section'>
            <h2>Check Previous Transactions</h2>
            {selectedReceipt ? (
              <div className='receipt-display'>
                <FaArrowLeft
                  onClick={() => setSelectedReceipt(null)}
                  style={{ cursor: 'pointer', color: '#007bff', marginBottom: '10px' }}
                />
                <h3>Transaction Receipt</h3>
                <pre>{JSON.stringify(selectedReceipt, null, 2)}</pre>
              </div>
            ) : (
              <div className='transaction-list'>
                {isReceiptLoading ? (
                  <p>Loading transaction receipt...</p>
                ) : (
                  transactionHashes.map((hash, index) => (
                    <div key={index} className='transaction-item'>
                      <span onClick={() => getReceipt(hash)} style={{ cursor: 'pointer', color: '#007bff' }}>
                        {`${hash.slice(0, 24)}...${hash.slice(-24)}`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className='section-row'>
          <div className='section'>
            <h2>Check ckSepoliaUSDC Balance</h2>
            <div className='form'>
              <input
                type="text"
                value={balancePrincipalId}
                onChange={(e) => setBalancePrincipalId(e.target.value)}
                placeholder="Principal ID"
                className='input'
              />
              <button onClick={checkCkUSDCBalance} disabled={isBalanceLoading} className='button'>
                {isBalanceLoading ? 'Checking...' : 'Check Balance'}
              </button>
            </div>
            {ckUSDCBalance !== null && (
              <div className='balance-display'>
                <p>ckSepoliaUSDC Balance: {ckUSDCBalance}</p>
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
                <p>
                  Generated Byte32 Address: {generatedByte32Address}
                  <FaCopy
                    onClick={() => copyToClipboard(generatedByte32Address)}
                    style={{ cursor: 'pointer', marginLeft: '8px' }}
                  />
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documentation Section */}
      <div className='documentation'>
        <h2>How to Mint ckSepoliaUSDC to Your Principal ID</h2>
        <ol>
          <li><strong>Step 1:</strong> Get the Canister ID/Principal ID.</li>
          <li><strong>Step 2:</strong> Generate Byte32 Address from the <b>Generate Byte32 Address</b> function</li>
          <li><strong>Step 3:</strong> Connect Your Wallet via the <b>Connect Wallet</b> button </li>
          <li><strong>Step 4:</strong> Put the generated Byte32 address in the <b>Deposit ckSepoliaUSDC section</b> and enter amount of ckSepoliaUSDC you'd like to deposit</li>
          <li><strong>Step 5:</strong> You can now check the balance of deposited ckSepoliaUSDC by checking <b>Check ckSepoliaUSDC Balance</b> function</li>
        </ol>
        <p><strong>Note:</strong> The "Get canister byte32 address" button generates the byte32 address of the backend canister.</p>
      </div>
    </div>
  );
}

export default CkSepoliaUSDC;