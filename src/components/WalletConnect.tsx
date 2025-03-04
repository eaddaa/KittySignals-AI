import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Wallet, Link, Link2, Unlink, Coins } from "lucide-react";
import useWalletConnection from "@/hooks/useWalletConnection";
import { NETWORK_CONFIG } from "@/config/network";

const WalletConnect = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    account,
    balance,
    chainId,
    isConnected,
    tokenBalance,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshWalletState // added to handle state refreshing
  } = useWalletConnection();

  const isCorrectNetwork = chainId === NETWORK_CONFIG.chainId;

  const shortenAddress = useCallback((address: string | null) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }, []);

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

                {isCorrectNetwork && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">KITTY Tokens:</span>
                    <span className="text-sm">
                      {tokenBalance !== undefined && tokenBalance !== null ? parseFloat(tokenBalance).toFixed(4) : '0.0000'} KITTY
                    </span>
                  </div>
                )}

                <div className="flex space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={refreshWalletState} // directly call refreshWalletState
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 3L16 7M16 3L12 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Refresh Balance
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1" 
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
                  onClick={connectWallet}
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

