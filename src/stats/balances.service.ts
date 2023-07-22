import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { chains } from '../chains/chains';

const BALANCE_CHAINS = ['ethereum', 'arbitrum', 'optimism', 'zksync'];

@Injectable()
export class BalancesService {
  async getBalances(address: string) {
    const balances: { [chain: string]: { eth: string } | null } = {};

    for (const chain of BALANCE_CHAINS) {
      const config = chains[chain];
      if (!config) {
        balances[chain] = null;
        continue;
      }

      const provider = new ethers.providers.JsonRpcProvider(config.rpc);
      const ethBalance = await provider.getBalance(address);
      balances[chain] = { eth: ethers.utils.formatEther(ethBalance) };
    }

    return { balances };
  }
}
