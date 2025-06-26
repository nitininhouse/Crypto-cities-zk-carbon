import React, { useState, useEffect } from 'react';
import { useUser, useWallet, UserButton } from "@civic/auth-web3/react";
import { useAutoConnect } from "@civic/auth-web3/wagmi";
import { useAccount, useConnect, useDisconnect } from "wagmi";

const CivicConnectWallet = () => {
  const userContext = useUser();
  const walletContext = useWallet({ type: 'ethereum' });
  const { isConnected, address, connector } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [showWalletOptions, setShowWalletOptions] = useState(false);

  // Auto-connect wallet when user logs in
  useAutoConnect();

  // Debug: Log connectors to see what's available
  useEffect(() => {
    console.log('Available connectors:', connectors);
    console.log('Connector names:', connectors.map(c => ({ name: c.name, type: c.type, id: c.id })));
  }, [connectors]);

  const createWallet = async () => {
    if (userContext.user && walletContext && !walletContext.wallet) {
      try {
        connectWallet();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  const connectWallet = () => {
    const civicConnector = connectors.find(c => 
      c.name === 'Civic' || 
      c.type === 'embeddedWallet' || 
      c.id === 'embeddedWallet'
    );
    console.log('Civic connector found:', civicConnector);
    if (civicConnector) {
      connect({ connector: civicConnector });
    }
  };

  const connectMetaMask = () => {
    // Try multiple ways to find MetaMask connector
    const metaMaskConnector = connectors.find(c => 
      c.name === 'MetaMask' || 
      c.name === 'metamask' ||
      c.id === 'metaMask' ||
      c.id === 'metamask' ||
      c.type === 'injected'
    );
    console.log('MetaMask connector found:', metaMaskConnector);
    console.log('All connectors:', connectors.map(c => c.name));
    
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
      setShowWalletOptions(false);
    } else {
      console.error('MetaMask connector not found!');
      // Show available connectors for debugging
      alert(`MetaMask not found. Available: ${connectors.map(c => c.name).join(', ')}`);
    }
  };

  const connectWalletConnect = () => {
    const walletConnectConnector = connectors.find(c => 
      c.name === 'WalletConnect' || 
      c.name === 'walletConnect' ||
      c.id === 'walletConnect'
    );
    if (walletConnectConnector) {
      connect({ connector: walletConnectConnector });
      setShowWalletOptions(false);
    }
  };

  // If user is not logged in, show login button
  if (!userContext.user) {
    return <UserButton />;
  }

  // If connected, show wallet address and disconnect option
  if (isConnected && address) {
    const btnText = `${address.slice(0, 5)}...${address.slice(-4)}`;
    return (
      <div className="flex items-center gap-2">
        <UserButton />
        <div className="flex items-center gap-2">
          <button className="btn bg-green-500 text-white px-3 py-1 rounded">
            {btnText}
          </button>
          <span className="text-xs text-gray-600">({connector?.name})</span>
          <button 
            onClick={() => disconnect()}
            className="btn bg-red-500 text-white px-2 py-1 rounded text-xs"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  // If user doesn't have a Civic wallet OR wants to show wallet options
  if (!walletContext?.wallet || showWalletOptions) {
    return (
      <div className="flex items-center gap-2">
        <UserButton />
        <div className="relative">
          {!showWalletOptions ? (
            <button 
              onClick={() => setShowWalletOptions(true)} 
              className="btn bg-blue-500 text-white px-4 py-2 rounded"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex flex-col gap-2 bg-white border border-gray-300 rounded-lg p-3 shadow-lg min-w-[200px]">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-sm">Choose Wallet</h3>
                <button 
                  onClick={() => setShowWalletOptions(false)}
                  className="text-gray-500 hover:text-gray-700 text-lg"
                >
                  ×
                </button>
              </div>
              
              {/* Debug info - remove in production */}
              <div className="text-xs text-gray-500 mb-2">
                Available: {connectors.map(c => c.name).join(', ')}
              </div>
              
              {/* Civic Wallet Option */}
              {!walletContext?.wallet && (
                <button 
                  onClick={createWallet} 
                  className="btn bg-blue-500 text-white px-3 py-2 rounded text-sm w-full text-left flex items-center gap-2"
                >
                  🏛️ Create Civic Wallet
                </button>
              )}
              
              {walletContext?.wallet && (
                <button 
                  onClick={() => {
                    connectWallet();
                    setShowWalletOptions(false);
                  }}
                  className="btn bg-blue-500 text-white px-3 py-2 rounded text-sm w-full text-left flex items-center gap-2"
                >
                  🏛️ Connect Civic Wallet
                </button>
              )}

              {/* MetaMask Option - Always show for debugging */}
              <button 
                onClick={connectMetaMask}
                className="btn bg-orange-500 text-white px-3 py-2 rounded text-sm w-full text-left flex items-center gap-2"
              >
                🦊 Connect MetaMask
              </button>

              {/* WalletConnect Option */}
              {connectors.find(c => 
                c.name === 'WalletConnect' || 
                c.name === 'walletConnect' ||
                c.id === 'walletConnect'
              ) && (
                <button 
                  onClick={connectWalletConnect}
                  className="btn bg-purple-500 text-white px-3 py-2 rounded text-sm w-full text-left flex items-center gap-2"
                >
                  🔗 WalletConnect
                </button>
              )}

              {/* Show all available connectors for debugging */}
              <div className="border-t pt-2 mt-2">
                <p className="text-xs text-gray-600 mb-1">All available connectors:</p>
                {connectors.map((connector, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      connect({ connector });
                      setShowWalletOptions(false);
                    }}
                    className="btn bg-gray-500 text-white px-2 py-1 rounded text-xs w-full text-left mb-1"
                  >
                    {connector.name} ({connector.type})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If user has Civic wallet but not connected, show connect button
  if (walletContext.wallet && !isConnected) {
    return (
      <div className="flex items-center gap-2">
        <UserButton />
        <button 
          onClick={() => setShowWalletOptions(true)} 
          className="btn bg-blue-500 text-white px-4 py-2 rounded"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex items-center gap-2">
      <UserButton />
      <button 
        onClick={() => setShowWalletOptions(true)} 
        className="btn bg-blue-500 text-white px-4 py-2 rounded"
      >
        Connect Wallet
      </button>
    </div>
  );
};

export default CivicConnectWallet;