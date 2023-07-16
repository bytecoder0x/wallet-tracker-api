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
    usdc: null,
    usdcDecimals: 0,
  },
  arbitrum: {
    name: 'Arbitrum',
    chainId: 42161,
    explorerApi: 'https://api.arbiscan.io/api',
    keyName: 'ARBISCAN_API_KEY',
    rpc: 'https://arb1.arbitrum.io/rpc',
    usdc: null,
    usdcDecimals: 0,
  },
  optimism: {
    name: 'Optimism',
    chainId: 10,
    explorerApi: 'https://api-optimistic.etherscan.io/api',
    keyName: 'OPTIMISM_API_KEY',
    rpc: 'https://mainnet.optimism.io',
    usdc: null,
    usdcDecimals: 0,
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
