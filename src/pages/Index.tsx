
import { Button } from "@/components/ui/button";
import { TradingProvider, useTradingContext } from "@/context/TradingContext";
import Header from "@/components/Header";
import { AlertCircle } from "lucide-react";

const TradingDashboard = () => {
  const { 
    selectedPair, 
    setSelectedPair,
    selectedStrategy,
    setSelectedStrategy,
    riskLevel,
    setRiskLevel,
    analyzing,
    analysisResult,
    analyzeMarket,
    hasRequiredTokens,
    wallet
  } = useTradingContext();
  
  const tradingPairs = [
    'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 
    'XRP/USDT', 'ADA/USDT', 'TIA/USDT', 'DYM/USDT', 
    'GOAT/USDT', 'ATOM/USDT', 'CVP/USDT', 'RIZ/USDT'
  ];
  
  const strategies = [
    'MACD', 'RSI', 'Moving Average', 'Bollinger Bands', 'Fibonacci Retracement',
    'Stochastic Oscillator', 'Relative Vigor Index', 'Parabolic SAR', 'Ichimoku Cloud', 'Williams %R'
  ];
  
  const getSignalColor = () => {
    if (!analysisResult) return 'bg-gray-200';
    switch (analysisResult.signal) {
      case 'BUY': return 'bg-green-500';
      case 'SELL': return 'bg-red-500';
      case 'HOLD': return 'bg-yellow-500';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Trading Parameters</h2>
            
            {/* Wallet Status */}
            <div className="mb-6 p-4 rounded-lg bg-gray-50">
              <h3 className="font-medium mb-2">Wallet Status</h3>
              {wallet.isConnected ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Account:</span>
                    <span className="text-sm font-mono">
                      {wallet.account?.substring(0, 6)}...{wallet.account?.substring(wallet.account.length - 4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Network:</span>
                    <span className={`text-sm ${wallet.isCorrectNetwork ? 'text-green-600' : 'text-red-500'}`}>
                      {wallet.isCorrectNetwork ? 'KITTYVERSE' : 'Wrong Network'}
                    </span>
                  </div>
                  {!wallet.isCorrectNetwork && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2" 
                      onClick={wallet.switchNetwork}
                    >
                      Switch to KITTYVERSE
                    </Button>
                  )}
                  {wallet.isCorrectNetwork && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">KITTY Balance:</span>
                      <span className={`text-sm ${hasRequiredTokens ? 'text-green-600' : 'text-red-500'}`}>
                        {wallet.tokenBalance ? parseFloat(wallet.tokenBalance).toFixed(4) : '0.0000'}
                      </span>
                    </div>
                  )}
                  {wallet.isCorrectNetwork && !hasRequiredTokens && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-red-700">
                        You need at least 1 KITTY token to generate signals
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Connect your wallet to generate signals</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={wallet.connectWallet}
                  >
                    Connect Wallet
                  </Button>
                </div>
              )}
            </div>
            
            {/* Trading Pair Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Trading Pair
              </label>
              <div className="grid grid-cols-3 gap-2">
                {tradingPairs.map((pair) => (
                  <button
                    key={pair}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedPair === pair
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedPair(pair as any)}
                  >
                    {pair}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Strategy Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Strategy
              </label>
              <div className="grid grid-cols-2 gap-2">
                {strategies.map((strategy) => (
                  <button
                    key={strategy}
                    className={`px-3 py-2 text-sm rounded text-left ${
                      selectedStrategy === strategy
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedStrategy(strategy as any)}
                  >
                    {strategy}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Risk Level */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Risk Level: {riskLevel}
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={riskLevel}
                onChange={(e) => setRiskLevel(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low Risk</span>
                <span>High Risk</span>
              </div>
            </div>
            
            {/* Analyze Button */}
            <Button
              className="w-full"
              onClick={analyzeMarket}
              disabled={analyzing || !wallet.isConnected || !wallet.isCorrectNetwork || !hasRequiredTokens}
            >
              {analyzing ? 'Analyzing...' : 'Generate Signal'}
            </Button>
            
            {wallet.isConnected && wallet.isCorrectNetwork && !hasRequiredTokens && (
              <p className="mt-2 text-xs text-center text-red-500">
                You need at least 1 KITTY token to use KittySignals AI
              </p>
            )}
          </div>
          
          {/* Results Panel */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">Trading Signal</h2>
            
            {analysisResult ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${getSignalColor()}`}>
                    {analysisResult.signal}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{selectedPair}</h3>
                    <div className="text-sm text-gray-500">
                      Confidence: {analysisResult.confidence}%
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Analysis</h4>
                  <p className="text-gray-700">{analysisResult.analysis}</p>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Key Data Points</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {analysisResult.priceData.slice(-4).map((data, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500">
                          {new Date(data.time).toLocaleDateString()}
                        </div>
                        <div className="font-medium">
                          ${data.close.toFixed(2)}
                        </div>
                        <div className={`text-xs ${
                          data.close > data.open ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {data.close > data.open ? '+' : ''}{((data.close / data.open - 1) * 100).toFixed(2)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-700 mb-1">No Signal Generated</h3>
                <p className="text-gray-500 max-w-md">
                  {wallet.isConnected 
                    ? wallet.isCorrectNetwork 
                      ? hasRequiredTokens
                        ? "Select your trading parameters and click 'Generate Signal' to get AI trading recommendations."
                        : "You need at least 1 KITTY token to use KittySignals AI."
                      : "Please switch to the KITTYVERSE network to generate signals."
                    : "Connect your wallet to access AI trading signals."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const Index = () => (
  <TradingProvider>
    <TradingDashboard />
  </TradingProvider>
);

export default Index;
