// network.ts
export const NETWORK_CONFIG = {
  chainId: '595973',
  chainName: 'KITTYVERSE',
  rpcUrls: ['https://dymrollapp-evm.kittyverse.click'],
  nativeCurrency: {
    name: 'KITTY',
    symbol: 'KITTY',
    decimals: 18,
  },
  kittyToken: {
    address: '0x15932E67cE06c2A311Fe68045354D59dc42B4af3', // Token kontrat adresi
    decimals: 18,
  },
};

export const TOKEN_CONTRACT = {
  address: NETWORK_CONFIG.kittyToken.address,
  abi: [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
  ],
};
};
