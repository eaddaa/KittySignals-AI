// useWalletConnection.ts
import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, ethers } from 'ethers';
import { toast } from "@/components/ui/use-toast";
import { 
  NETWORK_CONFIG, 
  CHAIN_ID_HEX, 
  TOKEN_CONTRACT, 
  NETWORK_PARAMS 
} from '@/config/network';

interface WalletState {
  account: string | null;
  balance: string | null;
  chainId: string | null;
  isConnected: boolean;
  tokenBalance: string | null;
  provider: BrowserProvider | null;
}

const useWalletConnection = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    account: null,
    balance: null,
    chainId: null,
    isConnected: false,
    tokenBalance: null,
    provider: null
  });

  const checkIfEthereumExists = useCallback(() => {
    return typeof window !== 'undefined' && window.ethereum !== undefined;
  }, []);

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
          provider: null
        });
        return;
      }
      
      const account = accounts[0];
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16).toString();
      const balance = await provider.getBalance(account.address);
      const formattedBalance = ethers.formatEther(balance);
      
      let tokenBalance = null;
      if (chainId === NETWORK_CONFIG.chainId) {
        try {
          const tokenContract = new ethers.Contract(
            TOKEN_CONTRACT.address,
            TOKEN_CONTRACT.abi,
            provider
          );
          const rawTokenBalance = await tokenContract.balanceOf(account.address);
          tokenBalance = ethers.formatEther(rawTokenBalance);
        } catch (error) {
          console.error("Token balance fetch error:", error);
        }
      }
      
      setWalletState({
        account: account.address,
        balance: formattedBalance,
        chainId,
        isConnected: true,
        tokenBalance,
        provider
      });
    } catch (error) {
      console.error("Wallet state refresh error:", error);
      setWalletState({
        account: null,
        balance: null,
        chainId: null,
        isConnected: false,
        tokenBalance: null,
        provider: null
      });
    }
  }, [checkIfEthereumExists]);

  const connectWallet = useCallback(async () => {
    if (!checkIfEthereumExists()) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await refreshWalletState();
      
      toast({
        title: "Wallet connected",
        description: "Your wallet has been successfully connected",
      });
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Connection failed",
        description: "Failed to connect to your wallet",
        variant: "destructive",
      });
    }
  }, [checkIfEthereumExists, refreshWalletState]);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      account: null,
      balance: null,
      chainId: null,
      isConnected: false,
      tokenBalance: null,
      provider: null
    });
    
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    });
  }, []);

  const switchNetwork = useCallback(async () => {
    if (!checkIfEthereumExists() || !walletState.isConnected) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_ID_HEX }]
      });
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK_PARAMS]
          });
        } catch (addError) {
          console.error("Failed to add network:", addError);
          toast({
            title: "Network Change Failed",
            description: "Failed to add KITTYVERSE network to your wallet",
            variant: "destructive",
          });
          return;
        }
      } else {
        console.error("Failed to switch network:", error);
        toast({
          title: "Network Change Failed",
          description: "Failed to switch to KITTYVERSE network",
          variant: "destructive",
        });
        return;
      }
    }
    
    await refreshWalletState();
    
    toast({
      title: "Network Changed",
      description: "Successfully switched to KITTYVERSE network",
    });
  }, [checkIfEthereumExists, refreshWalletState, walletState.isConnected]);

  useEffect(() => {
    if (!checkIfEthereumExists()) return;
    
    const handleAccountsChanged = () => {
      refreshWalletState();
    };
    
    const handleChainChanged = () => {
      refreshWalletState();
    };
    
    const handleDisconnect = (error: { code: number; message: string }) => {
      console.log("Wallet disconnected:", error);
      disconnectWallet();
    };
    
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);
    
    refreshWalletState();
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [checkIfEthereumExists, disconnectWallet, refreshWalletState]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshWalletState
  };
};

export default useWalletConnection;

