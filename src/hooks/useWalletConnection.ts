
import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";
import { NETWORK_CONFIG } from '@/config/network';

// Define types for window.ethereum and web3 related objects
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

const useWalletConnection = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== 'undefined' && window.ethereum?.isMetaMask;
  }, []);

  // Format balance with proper decimals
  const formatBalance = (balanceWei: string, decimals: number): string => {
    if (!balanceWei) return '0';
    return (parseInt(balanceWei) / Math.pow(10, decimals)).toString();
  };

  // Fetch native token balance (DYM)
  const fetchBalance = useCallback(async (address: string) => {
    if (!window.ethereum) return;

    try {
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      
      const balanceWei = parseInt(balanceHex, 16).toString();
      setBalance(formatBalance(balanceWei, 18));
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(null);
    }
  }, []);

  // Fetch KITTY token balance
  const fetchTokenBalance = useCallback(async (address: string) => {
    if (!window.ethereum || !NETWORK_CONFIG.kittyToken.address) return;

    try {
      // Call the balanceOf function on the token contract
      const data = '0x70a08231' + // Function signature for balanceOf(address)
        '000000000000000000000000' + address.slice(2); // Pad the address to 32 bytes

      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [
          {
            to: NETWORK_CONFIG.kittyToken.address,
            data
          },
          'latest'
        ]
      });

      if (result && result !== '0x') {
        const balanceWei = parseInt(result, 16).toString();
        console.log("Raw KITTY balance:", balanceWei);
        setTokenBalance(formatBalance(balanceWei, NETWORK_CONFIG.kittyToken.decimals));
        console.log("Formatted KITTY balance:", formatBalance(balanceWei, NETWORK_CONFIG.kittyToken.decimals));
      } else {
        console.error('Empty or invalid token balance result');
        setTokenBalance('0');
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
      setTokenBalance(null);
    }
  }, []);

  // Update account state and fetch balances
  const updateAccount = useCallback(async (newAccount: string | null) => {
    setAccount(newAccount);
    setIsConnected(!!newAccount);
    
    if (newAccount) {
      fetchBalance(newAccount);
      if (chainId === NETWORK_CONFIG.evmChainId) {
        fetchTokenBalance(newAccount);
      } else {
        setTokenBalance(null);
      }
    } else {
      setBalance(null);
      setTokenBalance(null);
    }
  }, [chainId, fetchBalance, fetchTokenBalance]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      toast({
        title: "MetaMask is not installed",
        description: "Please install MetaMask extension to connect your wallet",
        variant: "destructive"
      });
      return;
    }

    try {
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts',
      });
      
      // Get current chain ID
      const chainIdHex = await window.ethereum!.request({
        method: 'eth_chainId',
      });
      
      setChainId(parseInt(chainIdHex, 16));
      
      if (accounts.length > 0) {
        updateAccount(accounts[0]);
        
        toast({
          title: "Wallet Connected",
          description: "Your wallet has been successfully connected",
        });
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive"
      });
    }
  }, [isMetaMaskInstalled, updateAccount]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setBalance(null);
    setTokenBalance(null);
    setIsConnected(false);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  }, []);

  // Switch network
  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORK_CONFIG.evmChainId.toString(16)}` }],
      });
      
      toast({
        title: "Network Switched",
        description: `Connected to ${NETWORK_CONFIG.chainName}`,
      });
    } catch (switchError: any) {
      // If the network is not added to MetaMask, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${NETWORK_CONFIG.evmChainId.toString(16)}`,
                chainName: NETWORK_CONFIG.chainName,
                rpcUrls: [NETWORK_CONFIG.evmRPC],
                nativeCurrency: NETWORK_CONFIG.nativeCurrency,
                blockExplorerUrls: [NETWORK_CONFIG.blockExplorer],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast({
            title: "Network Error",
            description: "Failed to add network to MetaMask",
            variant: "destructive"
          });
        }
      } else {
        console.error('Error switching network:', switchError);
        toast({
          title: "Network Error",
          description: "Failed to switch network",
          variant: "destructive"
        });
      }
    }
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        updateAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
      
      if (account) {
        fetchBalance(account);
        if (newChainId === NETWORK_CONFIG.evmChainId) {
          fetchTokenBalance(account);
        } else {
          setTokenBalance(null);
        }
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Check if already connected
    window.ethereum.request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts.length > 0) {
          window.ethereum!.request({ method: 'eth_chainId' })
            .then((chainIdHex: string) => {
              setChainId(parseInt(chainIdHex, 16));
              updateAccount(accounts[0]);
            });
        }
      });

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [account, disconnectWallet, fetchBalance, fetchTokenBalance, updateAccount]);

  return {
    account,
    balance,
    chainId,
    isConnected,
    tokenBalance,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };
};

export default useWalletConnection;

