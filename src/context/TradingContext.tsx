import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "@/components/ui/use-toast";
import useWalletConnection from '@/hooks/useWalletConnection';
import { REQUIRED_TOKEN_BALANCE, NETWORK_CONFIG } from '@/config/network';
import { ethers } from 'ethers';

export type TradingPair = 'BTC/USDT' | 'ETH/USDT' | 'SOL/USDT' | 'BNB/USDT' | 'XRP/USDT' | 'ADA/USDT' | 'TIA/USDT' | 'DYM/USDT' | 'GOAT/USDT' | 'ATOM/USDT' | 'CVP/USDT' | 'RIZ/USDT' | 'DOGE/USDT' | 'DOT/USDT' | 'SHIB/USDT' | 'AVAX/USDT' | 'MATIC/USDT' | 'LINK/USDT' | 'TRX/USDT' | 'UNI/USDT' | 'TON/USDT' | 'ICP/USDT' | 'INJ/USDT' | 'APE/USDT' | 'SUI/USDT' | 'LTC/USDT' | 'BCH/USDT' | 'NEAR/USDT' | 'FIL/USDT' | 'ARB/USDT';
export type Strategy = 'MACD' | 'RSI' | 'Moving Average' | 'Bollinger Bands' | 'Fibonacci Retracement' | 'Stochastic Oscillator' | 'Relative Vigor Index' | 'Parabolic SAR' | 'Ichimoku Cloud' | 'Williams %R';
export type Signal = 'BUY' | 'SELL' | 'HOLD';

interface PriceData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface AnalysisResult {
  signal: Signal;
  analysis: string;
  confidence: number;
  priceData: PriceData[];
}

const fetchTradingData = async (
  pair: TradingPair,
  strategy: Strategy,
  riskLevel: number
): Promise<AnalysisResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const signals: Signal[] = ['BUY', 'SELL', 'HOLD'];
      const randomSignal = signals[Math.floor(Math.random() * signals.length)];
      const confidence = Math.floor(Math.random() * 30) + 70;

      const priceData: PriceData[] = [];
      const basePrice = pair === 'BTC/USDT' ? 60000 : pair === 'ETH/USDT' ? 3000 : 1000;
      const now = Date.now();

      for (let i = 0; i < 30; i++) {
        const time = now - (29 - i) * 3600 * 1000;
        const randomOffset = (Math.random() - 0.5) * basePrice * 0.02;
        const open = basePrice + randomOffset;
        const high = open + Math.random() * basePrice * 0.01;
        const low = open - Math.random() * basePrice * 0.01;
        const close = (high + low) / 2 + (Math.random() - 0.5) * basePrice * 0.005;
        const volume = Math.floor(Math.random() * 1000) + 500;

        priceData.push({ time, open, high, low, close, volume });
      }

      resolve({
        signal: randomSignal,
        analysis: `Based on ${strategy} analysis with risk level ${riskLevel}, the signal for ${pair} is ${randomSignal}.`,
        confidence,
        priceData
      });
    }, 2000); // Simulate 2-second API delay
  });
};

interface TradingContextType {
  selectedPair: TradingPair;
  setSelectedPair: (pair: TradingPair) => void;
  selectedStrategy: Strategy;
  setSelectedStrategy: (strategy: Strategy) => void;
  riskLevel: number;
  setRiskLevel: (level: number) => void;
  analyzing: boolean;
  analysisResult: AnalysisResult | null;
  analyzeMarket: () => Promise<void>;
  hasRequiredTokens: boolean;
  checkTokenBalance: () => Promise<void>;
  wallet: {
    isConnected: boolean;
    account: string | null;
    chainId: string | null;
    isCorrectNetwork: boolean;
    tokenBalance: string | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    switchNetwork: () => Promise<void>;
  };
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPair, setSelectedPair] = useState<TradingPair>('BTC/USDT');
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>('MACD');
  const [riskLevel, setRiskLevel] = useState(10);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [hasRequiredTokens, setHasRequiredTokens] = useState(false);

  const { isConnected, account, chainId, tokenBalance, connectWallet, disconnectWallet, switchNetwork } = useWalletConnection();

  const isCorrectNetwork = Number(chainId) === NETWORK_CONFIG.evmChainId;

  const checkTokenBalance = async () => {
    try {
      if (isConnected && isCorrectNetwork && tokenBalance) {
        const requiredBalance = ethers.formatEther(REQUIRED_TOKEN_BALANCE);
        const userBalance = parseFloat(tokenBalance);
        setHasRequiredTokens(userBalance >= parseFloat(requiredBalance));
      } else {
        setHasRequiredTokens(false);
      }
    } catch (error) {
      console.error('Error checking token balance:', error);
      toast({
        title: 'Error',
        description: 'Failed to check token balance.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    checkTokenBalance();
  }, [isConnected, isCorrectNetwork, tokenBalance]);

  const analyzeMarket = async () => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to analyze the market',
        variant: 'destructive',
      });
      return;
    }

    if (!isCorrectNetwork) {
      toast({
        title: 'Wrong Network',
        description: 'Please switch to the correct network to analyze the market',
        variant: 'destructive',
      });
      return;
    }

    if (!hasRequiredTokens) {
      toast({
        title: 'Insufficient Tokens',
        description: 'You need at least 1 token to use this feature.',
        variant: 'destructive',
      });
      return;
    }

    setAnalyzing(true);
    try {
      const result = await fetchTradingData(selectedPair, selectedStrategy, riskLevel);
      setAnalysisResult(result);

      toast({
        title: `${result.signal} Signal Generated`,
        description: `Analysis completed with ${result.confidence}% confidence`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze the market. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <TradingContext.Provider
      value={{
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
        checkTokenBalance,
        wallet: {
          isConnected,
          account,
          chainId,
          isCorrectNetwork,
          tokenBalance,
          connectWallet,
          disconnectWallet,
          switchNetwork
        }
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTradingContext = () => {
  const context = useContext(TradingContext);
  if (context === undefined) {
    throw new Error('useTradingContext must be used within a TradingProvider');
  }
  return context;
};

export { fetchTradingData };

