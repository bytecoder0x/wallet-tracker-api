export const EXPLORER_CHAINS = ['ethereum', 'arbitrum', 'optimism'] as const;

export interface ChainConfig {
  name: string;
  chainId: number;
  explorerApi: string | null;
  keyName: string | null;
}

export const chains: Record<string, ChainConfig> = {
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    explorerApi: 'https://api.etherscan.io/api',
    keyName: 'ETHERSCAN_API_KEY',
  },
  arbitrum: {
    name: 'Arbitrum',
    chainId: 42161,
    explorerApi: 'https://api.arbiscan.io/api',
    keyName: 'ARBISCAN_API_KEY',
  },
  optimism: {
    name: 'Optimism',
    chainId: 10,
    explorerApi: 'https://api-optimistic.etherscan.io/api',
    keyName: 'OPTIMISM_API_KEY',
  },
};
