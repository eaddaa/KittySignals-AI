
import { TradingPair, Strategy, Signal } from "@/context/TradingContext";

interface PriceData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface MockAIAnalysisResponse {
  signal: Signal;
  analysis: string;
  confidence: number;
  priceData: PriceData[];
}

const fetchRealPriceData = async (pair: TradingPair): Promise<PriceData[]> => {
  try {
    const baseCurrency = pair.split('/')[0].toLowerCase();
    
    const coinGeckoIdMap: Record<string, string> = {
      'dym': 'dymension',
      'eth': 'ethereum',
      'sol': 'solana',
      'bnb': 'binancecoin',
      'xrp': 'ripple',
      'btc': 'bitcoin',
      'ada': 'cardano',
      'tia': 'celestia',
      'goat': 'goatseus-maximus', // Doğru CoinGecko ID: goatseus-maximus
      'atom': 'cosmos',
      'cvp': 'concentrated-voting-power', // Doğru CoinGecko ID: concentrated-voting-power
      'riz': 'rivalz-network' // Doğru CoinGecko ID: rivalz-network
    };
    
    const coinId = coinGeckoIdMap[baseCurrency];
    if (!coinId) {
      throw new Error(`No CoinGecko ID mapping for ${baseCurrency}`);
    }
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30&interval=daily`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch price data from CoinGecko: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // API'den gelen verileri en eski tarih solda, en yeni tarih sağda olacak şekilde sırala
    const sortedPrices = data.prices.map((priceData: [number, number]) => {
      return {
        time: priceData[0],
        close: priceData[1]
      };
    }).sort((a, b) => a.time - b.time); // Tarihe göre sırala (en eski tarih solda)
    
    // Fiyat verilerini işle
    const priceData: PriceData[] = sortedPrices.map((price, index) => {
      const open = index > 0 ? sortedPrices[index - 1].close : price.close * (1 - (Math.random() * 0.01));
      const close = price.close;
      const volatility = close * 0.02;
      const high = Math.max(open, close) + (Math.random() * volatility * 0.5);
      const low = Math.min(open, close) - (Math.random() * volatility * 0.5);
      const volume = data.total_volumes && data.total_volumes[index] 
        ? data.total_volumes[index][1] 
        : 1000000;
      
      return {
        time: price.time,
        open,
        high,
        low,
        close,
        volume
      };
    });
    
    return priceData;
  } catch (error) {
    console.error('Error fetching price data:', error);
    throw error; // Hata durumunda mock veriye dönmek yerine hatayı fırlat
  }
};

const generateMockPriceData = (pair: TradingPair, days: number = 30): PriceData[] => {
  const data: PriceData[] = [];
  const now = Date.now();
  const dayInMs = 86400000;
  
  let basePrice = 0;
  let volatilityFactor = 0.02;
  
  switch(pair) {
    case 'DYM/USDT':
      basePrice = 0.4166;
      volatilityFactor = 0.07;
      break;
    case 'ETH/USDT':
      basePrice = 3200;
      break;
    case 'SOL/USDT':
      basePrice = 145;
      break;
    case 'BNB/USDT':
      basePrice = 550;
      break;
    case 'XRP/USDT':
      basePrice = 0.58;
      break;
    case 'BTC/USDT':
      basePrice = 50000;
      volatilityFactor = 0.05;
      break;
    case 'ADA/USDT':
      basePrice = 0.6;
      volatilityFactor = 0.1;
      break;
    case 'TIA/USDT':
      basePrice = 10;
      volatilityFactor = 0.15;
      break;
    case 'GOAT/USDT':
      basePrice = 0.01;
      volatilityFactor = 0.2;
      break;
    case 'ATOM/USDT':
      basePrice = 10;
      volatilityFactor = 0.1;
      break;
    case 'CVP/USDT':
      basePrice = 0.5;
      volatilityFactor = 0.15;
      break;
    case 'RIZ/USDT':
      basePrice = 0.1;
      volatilityFactor = 0.25;
      break;
  }
  
  let lastClose = basePrice;
  
  for (let i = 0; i <= days; i++) {
    const time = now - ((days - i) * dayInMs);
    const volatility = basePrice * volatilityFactor;
    
    const trend = Math.sin(i * 0.3) * 0.4;
    const randomFactor = Math.random() * 2 - 1;
    const meanReversionFactor = (basePrice - lastClose) * 0.03;
    
    const change = (randomFactor * volatility) + (trend * volatility * 0.6) + meanReversionFactor;
    const open = lastClose;
    const close = open + change;
    const high = Math.max(open, close) + (Math.random() * volatility * 0.4);
    const low = Math.min(open, close) - (Math.random() * volatility * 0.4);
    
    const volume = basePrice < 10 
      ? basePrice * (Math.random() * 2000000 + 500000)
      : basePrice * (Math.random() * 100 + 150);
    
    data.push({
      time,
      open,
      high,
      low,
      close,
      volume
    });
    
    lastClose = close;
  }
  
  return data;
};

const generateMockSignal = (pair: TradingPair, strategy: Strategy, riskLevel: number): Signal => {
  const signals: Signal[] = ['BUY', 'SELL', 'HOLD'];
  const seed = pair.charCodeAt(0) + strategy.charCodeAt(0) + riskLevel;
  const randomValue = Math.sin(seed) * 10000;
  const index = Math.floor(Math.abs(randomValue) % 3);
  return signals[index];
};

const generateMockAnalysis = (pair: TradingPair, strategy: Strategy, signal: Signal): string => {
  const analyses = {
    BUY: [
      `Based on ${strategy} analysis, ${pair} is showing strong bullish momentum with positive divergence in trading volume.`,
      `${pair} recently formed a golden cross, suggesting a potential uptrend. ${strategy} indicators confirm this bullish sentiment.`,
      `Technical analysis using ${strategy} indicates ${pair} is currently undervalued and presents a buying opportunity.`
    ],
    SELL: [
      `${strategy} signals show ${pair} is approaching overbought territory with declining trading volume, suggesting a potential reversal.`,
      `Based on ${strategy}, ${pair} has formed a bearish pattern with resistance at current levels, indicating selling pressure.`,
      `${pair} is showing bearish divergence according to ${strategy} analysis, with momentum indicators turning negative.`
    ],
    HOLD: [
      `${pair} is consolidating in a tight range. ${strategy} analysis suggests waiting for a clearer trend direction.`,
      `Current market conditions for ${pair} are neutral based on ${strategy}. Recommend holding current positions.`,
      `${strategy} indicators for ${pair} are mixed, suggesting a period of sideways movement before a clear trend emerges.`
    ]
  };
  
  const analysisIndex = Math.floor(Math.random() * 3);
  return analyses[signal][analysisIndex];
};

export const fetchTradingData = async (
  pair: TradingPair,
  strategy: Strategy,
  riskLevel: number
): Promise<MockAIAnalysisResponse> => {
  try {
    const priceData = await fetchRealPriceData(pair);
    
    const signal = generateMockSignal(pair, strategy, riskLevel);
    const analysis = generateMockAnalysis(pair, strategy, signal);
    
    const baseConfidence = 75;
    const riskFactor = (10 - riskLevel) * 2;
    const confidence = Math.min(Math.max(baseConfidence + riskFactor, 30), 95);
    
    return {
      signal,
      analysis,
      confidence,
      priceData
    };
  } catch (error) {
    console.error('Error fetching trading data:', error);
    // API çağrısı başarısız olursa, mock veri ile devam et
    const mockPriceData = generateMockPriceData(pair);
    const signal = generateMockSignal(pair, strategy, riskLevel);
    const analysis = generateMockAnalysis(pair, strategy, signal);
    
    return {
      signal,
      analysis,
      confidence: 50, // Düşük güven seviyesi
      priceData: mockPriceData
    };
  }
};
