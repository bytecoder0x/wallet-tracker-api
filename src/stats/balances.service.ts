import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { chains } from '../chains/chains';

const ERC20_ABI = ['function balanceOf(address owner) view returns (uint256)'];

const BALANCE_CHAINS = ['ethereum', 'arbitrum', 'optimism', 'zksync'];

@Injectable()
export class BalancesService {
  async getBalances(address: string) {
    const balances: {
      [chain: string]: { eth: string; usdc: string } | null;
    } = {};
    let ens: string | null = null;

    for (const chain of BALANCE_CHAINS) {
      const config = chains[chain];
      if (!config) {
        balances[chain] = null;
        continue;
      }

      const provider = new ethers.providers.JsonRpcProvider(config.rpc);
      const ethBalance = await provider.getBalance(address);
      let usdc = '0';

      if (config.usdc) {
        const token = new ethers.Contract(config.usdc, ERC20_ABI, provider);
        const raw = await token.balanceOf(address);
        usdc = ethers.utils.formatUnits(raw, config.usdcDecimals);
      }

      balances[chain] = { eth: ethers.utils.formatEther(ethBalance), usdc };

      if (chain === 'ethereum') {
        ens = await provider.lookupAddress(address).catch(() => null);
      }
    }

    return { ens, balances };
  }
}
