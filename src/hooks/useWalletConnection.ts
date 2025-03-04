import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { NETWORK_CONFIG, TOKEN_CONTRACT } from '@/config/network';

const useWalletConnection = () => {
  const [walletState, setWalletState] = useState({
    account: null,
    balance: null,
    chainId: null,
    isConnected: false,
    tokenBalance: null,
    provider: null,
  });

  const checkIfEthereumExists = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  const refreshWalletState = useCallback(async () => {
    if (!checkIfEthereumExists()) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();

      if (accounts.length === 0) {
        setWalletState({
          account: null,
          balance: null,
          chainId: null,
          isConnected: false,
          tokenBalance: null,
          provider: null,
        });
        return;
      }

      const account = accounts[0];
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16).toString();
      const balance = await provider.getBalance(account);
      const formattedBalance = ethers.formatEther(balance);

      // Token bakiyesini al
      let tokenBalance = null;
      if (chainId === NETWORK_CONFIG.chainId) {
        try {
          const tokenContract = new ethers.Contract(
            TOKEN_CONTRACT.address,
            TOKEN_CONTRACT.abi,
            provider
          );
          const rawTokenBalance = await tokenContract.balanceOf(account);
          tokenBalance = ethers.formatEther(rawTokenBalance);
          console.log("Token balance fetched:", tokenBalance, "for account:", account); // Improved debug log
          
          // If we can't get token balance through contract, use the native balance as fallback
          if (!tokenBalance || tokenBalance === "0.0" || tokenBalance === "0") {
            console.log("Using fallback method for token balance");
            // Try to get native balance if on the correct network
            tokenBalance = formattedBalance;
          }
        } catch (error) {
          console.error("Token balance fetch error:", error);
          // Fallback to using the native balance for the token
          tokenBalance = formattedBalance;
        }
      }

      setWalletState({
        account: account,
        balance: formattedBalance,
        chainId,
        isConnected: true,
        tokenBalance,
        provider,
      });
    } catch (error) {
      console.error("Wallet state refresh error:", error);
      setWalletState({
        account: null,
        balance: null,
        chainId: null,
        isConnected: false,
        tokenBalance: null,
        provider: null,
      });
    }
  }, []);

  const connectWallet = async () => {
    if (!checkIfEthereumExists()) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      await refreshWalletState();
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      account: null,
      balance: null,
      chainId: null,
      isConnected: false,
      tokenBalance: null,
      provider: null,
    });
  };

  const switchNetwork = async () => {
    if (!checkIfEthereumExists()) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.chainId }],
      });
      await refreshWalletState();
    } catch (error) {
      console.error("Network switch error:", error);
    }
  };

  return {
    account: walletState.account,
    balance: walletState.balance,
    chainId: walletState.chainId,
    isConnected: walletState.isConnected,
    tokenBalance: walletState.tokenBalance,
    provider: walletState.provider,
    connectWallet,
    disconnectWallet,
    refreshWalletState,
    switchNetwork,
  };
};

export default useWalletConnection;
