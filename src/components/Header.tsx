
import { useTradingContext } from "@/context/TradingContext";
import WalletConnect from "./WalletConnect";

const Header = () => {
  const { wallet } = useTradingContext();
  
  return (
    <header className="bg-black p-4 text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <span className="text-xl font-bold">CryptoSignalAI</span>
        </div>
        
        <div className="flex items-center">
          {wallet.isConnected && (
            <div className="hidden sm:flex items-center mr-4">
              <div className={`w-3 h-3 rounded-full mr-2 ${wallet.isCorrectNetwork ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">
                {wallet.isCorrectNetwork 
                  ? 'KITTYVERSE' 
                  : <button className="text-red-400 hover:underline" onClick={wallet.switchNetwork}>Switch to KITTYVERSE</button>}
              </span>
            </div>
          )}
          
          <WalletConnect />
        </div>
      </div>
    </header>
  );
};

export default Header;
