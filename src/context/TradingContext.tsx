
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchTradingData } from '@/utils/tradingApi';
import { toast } from "@/components/ui/use-toast";
import useWalletConnection from '@/hooks/useWalletConnection';

export type TradingPair = 'BTC/USDT' | 'ETH/USDT' | 'SOL/USDT' | 'BNB/USDT' | 'XRP/USDT' | 'ADA/USDT' | 'TIA/USDT' | 'DYM/USDT' | 'GOAT/USDT' | 'ATOM/USDT' | 'CVP/USDT' | 'RIZ/USDT';
export type Strategy = 'MACD' | 'RSI' | 'Moving Average' | 'Bollinger Bands' | 'Fibonacci Retracement';
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
  wallet: {
    isConnected: boolean;
    account: string | null;
    chainId: string | null;
    isCorrectNetwork: boolean;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    switchNetwork: () => Promise<void>;
  };
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPair, setSelectedPair] = useState<TradingPair>('BTC/USDT');
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>('MACD');
  const [riskLevel, setRiskLevel] = useState(5);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  const {
    isConnected, 
    account, 
    chainId, 
    connectWallet, 
    disconnectWallet, 
    switchNetwork
  } = useWalletConnection();
  
  const isCorrectNetwork = chainId === '595973'; // KITTYVERSE chainId
  
  const analyzeMarket = async () => {
    // Eğer cüzdan bağlı değilse veya doğru ağda değilse uyarı göster
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to analyze the market",
        variant: "destructive",
      });
      return;
    }
    
    if (!isCorrectNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch to KITTYVERSE network to analyze the market",
        variant: "destructive",
      });
      return;
    }
    
    setAnalyzing(true);
    try {
      const result = await fetchTradingData(selectedPair, selectedStrategy, riskLevel);
      setAnalysisResult(result);
      
      // Başarılı analiz toast mesajı
      toast({
        title: `${result.signal} Signal Generated`,
        description: `Analysis completed with ${result.confidence}% confidence`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the market. Please try again.",
        variant: "destructive",
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
        wallet: {
          isConnected,
          account,
          chainId,
          isCorrectNetwork,
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
