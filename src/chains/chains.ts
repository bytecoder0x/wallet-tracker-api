export const EXPLORER_CHAINS = ['ethereum'] as const;

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
};
