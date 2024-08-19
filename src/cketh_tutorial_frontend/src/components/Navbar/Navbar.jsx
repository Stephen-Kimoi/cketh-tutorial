import './Navbar.css';

function Navbar({ openModal, account, walletConnected }) {
  return (
    <div className="navbar">
      <div className="logo">
        <p>ckTokens Tester</p>
      </div>

      {
        !walletConnected ? (
          <button className="connect-button" onClick={openModal}>Connect Wallet</button>
        ) : (
          <div>
            <button className='connect-button' onClick={() => window.location.reload()}>Disconnect Wallet</button>
          </div>
        )
      }
    </div>
  );
}

export default Navbar;