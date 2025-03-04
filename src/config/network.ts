
// KITTYVERSE ağ yapılandırması
export const NETWORK_CONFIG = {
  chainId: '595973',
  chainName: 'KITTYVERSE',
  rpcUrls: ['https://dymrollapp-evm.kittyverse.click'],
  nativeCurrency: {
    name: 'KITTY',
    symbol: 'KITTY',
    decimals: 18
  }
};

// Hex formatında chainId
export const CHAIN_ID_HEX = `0x${parseInt(NETWORK_CONFIG.chainId).toString(16)}`;

// Token kontrat bilgileri (eğer token kontrolü yapılacaksa)
export const TOKEN_CONTRACT = {
  address: '0x15932E67cE06c2A311Fe68045354D59dc42B4af3', // Token kontrat adresi
  abi: [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
  ]
};

// Oyun için gerekli minimum token miktarı (eğer token kontrolü yapılacaksa)
export const REQUIRED_TOKEN_BALANCE = "1000000000000000000"; // 1 KITTY Token

// RPC sağlayıcı URL'si
export const RPC_URL = NETWORK_CONFIG.rpcUrls[0];

// Ağ değiştirme parametreleri
export const NETWORK_PARAMS = {
  chainId: CHAIN_ID_HEX,
  chainName: NETWORK_CONFIG.chainName,
  rpcUrls: NETWORK_CONFIG.rpcUrls,
  nativeCurrency: NETWORK_CONFIG.nativeCurrency
};
