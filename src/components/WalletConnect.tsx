import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Wallet, Link, Link2, Unlink, Coins } from "lucide-react";
import useWalletConnection from "@/hooks/useWalletConnection";
import { NETWORK_CONFIG } from "@/config/network";
import { ethers } from "ethers";

const WalletConnect = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  
  const {
    account,
    balance,
    chainId,
    isConnected,
    connectWallet,
    disconnectWallet,
    switchNetwork
  } = useWalletConnection();

  const isCorrectNetwork = chainId === NETWORK_CONFIG.chainId;

  // Replace with your KITTY token contract address
  const KITTY_TOKEN_ADDRESS = "0x278838f86a613193e9cf2efe8846b705674cbfe2"; 

  const shortenAddress = (address: string | null) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Fetch token balance from the smart contract
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (isConnected && account) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);

          // Check if provider is available
          if (!provider) {
            console.error("Ethereum provider is not available");
            return;
          }

          const contract = new ethers.Contract(
            KITTY_TOKEN_ADDRESS,
            ["function balanceOf(address) view returns (uint256)"],
            provider
          );

          // Fetch balance
          const balance = await contract.balanceOf(account);
          
          // Log the raw balance and formatted balance for debugging
          console.log("Raw balance:", balance.toString());

          // Convert to human-readable format (18 decimals)
          const formattedBalance = ethers.utils.formatUnits(balance, 18);
          console.log("Formatted balance:", formattedBalance);

          // Set the token balance state
          setTokenBalance(formattedBalance);
        } catch (error) {
          console.error("Failed to fetch token balance:", error);
        }
      }
    };

    fetchTokenBalance();
  }, [account, isConnected]);

  return (
    <>
      <Button 
        variant="outline" 
        className="ml-2" 
        onClick={() => setIsOpen(true)}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isConnected ? 'Wallet' : 'Connect'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Wallet className="mr-2 h-5 w-5" />
              {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Account:</span>
                  <span className="text-sm font-mono">{shortenAddress(account)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Network:</span>
                  <div className="flex items-center">
                    <span className={`text-sm ${isCorrectNetwork ? 'text-green-500' : 'text-red-500'}`}>
                      {isCorrectNetwork ? NETWORK_CONFIG.chainName : 'Wrong Network'}
                    </span>
                    {!isCorrectNetwork && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-2" 
                        onClick={switchNetwork}
                      >
                        <Link2 className="mr-1 h-3 w-3" />
                        Switch
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Balance:</span>
                  <span className="text-sm">
                    {balance ? `${parseFloat(balance).toFixed(4)} ${NETWORK_CONFIG.nativeCurrency.symbol}` : '...'}
                  </span>
                </div>
                
                {isCorrectNetwork && tokenBalance !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">KITTY Tokens:</span>
                    <span className="text-sm">
                      {parseFloat(tokenBalance).toFixed(4)} KITTY
                    </span>
                  </div>
                )}
                
                <div className="pt-4">
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={() => {
                      disconnectWallet();
                      setIsOpen(false);
                    }}
                  >
                    <Unlink className="mr-2 h-4 w-4" />
                    Disconnect Wallet
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to access the trading signals and manage your portfolio on the KITTYVERSE network.
                </p>
                
                <Button 
                  className="w-full" 
                  onClick={() => {
                    connectWallet();
                  }}
                >
                  <Link className="mr-2 h-4 w-4" />
                  Connect MetaMask
                </Button>
                
                <div className="flex items-center justify-center pt-2">
                  <Coins className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Requires MetaMask extension
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletConnect;

