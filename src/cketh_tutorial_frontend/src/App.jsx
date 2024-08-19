import { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import Header from './components/Header/Header';
import { connectWallet } from './ConnectWallet/ConnectWallet';

function App() {
  const [account, setAccount] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);

  const openModal = async () => {
    try {
      const account = await connectWallet();
      setAccount(account);
      setWalletConnected(true);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
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

      <Header
        walletConnected={walletConnected}
        account={account}
      />
    </>
  );
}

export default App;