export const EXPLORER_CHAINS = ['ethereum', 'arbitrum', 'optimism'] as const;
export const MANUAL_CHAINS = ['zksync', 'starknet'] as const;

export interface ChainConfig {
  name: string;
  chainId: number;
  explorerApi: string | null;
  keyName: string | null;
  rpc: string;
  usdc: string | null;
  usdcDecimals: number;
}

// zksync explorer has no etherscan-like api, so zksync and starknet are manual only
export const chains: Record<string, ChainConfig> = {
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    explorerApi: 'https://api.etherscan.io/api',
    keyName: 'ETHERSCAN_API_KEY',
    rpc: 'https://cloudflare-eth.com',
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    usdcDecimals: 6,
  },
  arbitrum: {
    name: 'Arbitrum',
    chainId: 42161,
    explorerApi: 'https://api.arbiscan.io/api',
    keyName: 'ARBISCAN_API_KEY',
    rpc: 'https://arb1.arbitrum.io/rpc',
    usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    usdcDecimals: 6,
  },
  optimism: {
    name: 'Optimism',
    chainId: 10,
    explorerApi: 'https://api-optimistic.etherscan.io/api',
    keyName: 'OPTIMISM_API_KEY',
    rpc: 'https://mainnet.optimism.io',
    usdc: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    usdcDecimals: 6,
  },
  zksync: {
    name: 'zkSync Era',
    chainId: 324,
    explorerApi: null,
    keyName: null,
    rpc: 'https://mainnet.era.zksync.io',
    usdc: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
    usdcDecimals: 6,
  },
  starknet: {
    name: 'Starknet',
    chainId: 0,
    explorerApi: null,
    keyName: null,
    rpc: '',
    usdc: null,
    usdcDecimals: 0,
  },
};
