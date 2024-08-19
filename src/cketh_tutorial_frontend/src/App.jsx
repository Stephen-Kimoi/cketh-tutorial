import { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import CkSepoliaETH from './components/Header/CkSepoliaETH/CkSepoliaETH';
import CkETH from './components/Header/CkETH/CkETH';
import CkUSDC from './components/Header/CkUSDC/CkUSDC';
import CkSepoliaUSDC from './components/Header/CkSepoliaUSDC/CkSepoliaUSDC';
import { connectWallet } from './ConnectWallet/ConnectWallet';

function App() {
  const [account, setAccount] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [activeComponent, setActiveComponent] = useState("CkSepoliaETH");

  const openModal = async () => {
    try {
      const account = await connectWallet();
      setAccount(account);
      setWalletConnected(true);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "CkSepoliaETH":
        return <CkSepoliaETH walletConnected={walletConnected} account={account} />;
      case "CkETH":
        return <CkETH walletConnected={walletConnected} account={account} />;
      case "CkUSDC":
        return <CkUSDC walletConnected={walletConnected} account={account} />;
      case "CkSepoliaUSDC":
        return <CkSepoliaUSDC walletConnected={walletConnected} account={account} />;
      default:
        return <CkSepoliaETH walletConnected={walletConnected} account={account} />;
    }
  };

  return (
    <>
      <Navbar
        openModal={openModal}
        account={account}
        walletConnected={walletConnected}
        setWalletConnected={setWalletConnected}
        setAccount={setAccount}
      />

      <div className="component-switcher">
        <button
          className={activeComponent === "CkSepoliaETH" ? "active" : ""}
          onClick={() => setActiveComponent("CkSepoliaETH")}
        >
          CkSepoliaETH
        </button>
        <button
          className={activeComponent === "CkETH" ? "active" : ""}
          onClick={() => setActiveComponent("CkETH")}
        >
          CkETH
        </button>
        <button
          className={activeComponent === "CkUSDC" ? "active" : ""}
          onClick={() => setActiveComponent("CkUSDC")}
        >
          CkUSDC
        </button>
        <button
          className={activeComponent === "CkSepoliaUSDC" ? "active" : ""}
          onClick={() => setActiveComponent("CkSepoliaUSDC")}
        >
          CkSepoliaUSDC
        </button>
      </div>

      {renderActiveComponent()}
    </>
  );
}

export default App;