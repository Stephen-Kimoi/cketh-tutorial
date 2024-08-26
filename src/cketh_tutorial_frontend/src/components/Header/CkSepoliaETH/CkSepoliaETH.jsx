import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import abi from '../contracts/SepoliaETHMinterHelper.json';
import MinterHelper from '../contracts/contracts-address.json';
import '../TokenComponent.css';
import { cketh_tutorial_backend } from 'declarations/cketh_tutorial_backend';
import { Principal } from '@dfinity/principal';
import { FaCopy, FaArrowLeft } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CkSepoliaETH({ walletConnected, account }) {
  const [amount, setAmount] = useState(0);
  const [ckSepoliaETHLedgerid, setkSepoliaETHLedgerid] = useState("");
  const [ckSepoliaETHMInterid, setkSepoliaETHMinterid] = useState("");
  const [ckEthBalance, setCkEthBalance] = useState(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [generatedByte32Address, setGeneratedByte32Address] = useState("");
  const [balancePrincipalId, setBalancePrincipalId] = useState("");
  const [generatePrincipalId, setGeneratePrincipalId] = useState("");
  const [isGenerateLoading, setIsGenerateLoading] = useState(false);
  const [canisterDepositAddress, setCanisterDepositAddress] = useState("");
  const [isDepositLoading, setIsDepositLoading] = useState(false);
  const [transactionHashes, setTransactionHashes] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptLoading, setIsReceiptLoading] = useState(false);

  // Fetching ckSepoliaETH Canister ID
  const ckSepoliaCanisterIDs = async () => {
    const ledgerCanisterID = await cketh_tutorial_backend.ck_sepolia_eth_ledger_canister_id();
    setkSepoliaETHLedgerid(ledgerCanisterID); 

    const minterCanisterID = await cketh_tutorial_backend.ck_sepolia_eth_minter_canister_id(); 
    setkSepoliaETHMinterid(minterCanisterID); 
  };

  // Fetching ckSepoliaETH Minter Canister ID: 


  // Function for getting the deposit address
  const depositAddress = async () => {
    const depositAddress = await cketh_tutorial_backend.canister_deposit_principal();
    console.log("Deposit address: ", depositAddress);
    setCanisterDepositAddress(depositAddress);
  };

  const depositckETH = async () => {
    if (!walletConnected) {
      toast.error("Wallet not connected");
      return;
    }

    setIsDepositLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(MinterHelper.SepoliaETHMinterHelper, abi, signer);

      const tx = await contract.deposit(canisterDepositAddress, {
        value: ethers.utils.parseEther(amount.toString())
      });

      toast.info("Sending ETH to the helper contract");
      await tx.wait();
      toast.success("Transaction successful");

      // Store transaction hash
      toast.info("Storing transaction hash...");
      await cketh_tutorial_backend.store_ck_sepolia_eth_hash(tx.hash);
      toast.success("Transaction hash stored");

      // Fetch updated transaction hashes
      fetchTransactionHashes();
    } catch (error) {
      toast.error("Failed to send ETH");
      console.error(error);
    } finally {
      setIsDepositLoading(false);
    }
  };

  const fetchTransactionHashes = async () => {
    try {
      const hashes = await cketh_tutorial_backend.get_ck_sepolia_eth_hashes();
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

  const checkCkEthBalance = async () => {
    try {
      setIsBalanceLoading(true);
      const principal = Principal.fromText(balancePrincipalId);
      const balance = await cketh_tutorial_backend.ck_sepolia_eth_balance(principal);
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
    ckSepoliaCanisterIDs();
    depositAddress();
    fetchTransactionHashes();
  }, []);

  return (
    <div className='container'>
      <ToastContainer />
      <h1 className='title'>ckSepoliaETH Tester</h1>

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
            <h2>ckSepoliaETH Canister IDs</h2>
            <div>
              <b><i>Ledger ID:</i></b> {ckSepoliaETHLedgerid}
              <FaCopy
                onClick={() => copyToClipboard(ckSepoliaETHLedgerid)}
                style={{ cursor: 'pointer', marginLeft: '8px' }}
              />

              <b><i>Minter ID:</i></b> {ckSepoliaETHMInterid}
              <FaCopy
                onClick={() => copyToClipboard(ckSepoliaETHMInterid)}
                style={{ cursor: 'pointer', marginLeft: '8px' }}
              />
            </div>
          </div>

          <div className='section'>
            <h2>Deposit ckSepoliaETH</h2>
            <div className='form'>
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
              <button onClick={depositckETH} disabled={isDepositLoading} className='button'>
                {isDepositLoading ? 'Depositing ckSepoliaETH...' : 'Deposit ckSepoliaETH'}
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
        <h2>How to Mint ckSepoliaETH to Your Principal ID</h2>
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