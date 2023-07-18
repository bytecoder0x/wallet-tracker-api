import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { Activity } from '../activity/activity.entity';

export interface Stats {
  txCount: number;
  failedCount: number;
  uniqueContracts: number;
  volumeEth: string;
  gasEth: string;
  firstTx: Date | null;
  lastTx: Date | null;
}

@Injectable()
export class StatsService {
  buildStats(activities: Activity[], walletAddress: string): Stats {
    const address = walletAddress.toLowerCase();

    let failedCount = 0;
    let volume = ethers.BigNumber.from(0);
    let gas = ethers.BigNumber.from(0);
    // uniqe contracts the wallet interacted with
    const contracts = new Set<string>();
    let firstTx: Date | null = null;
    let lastTx: Date | null = null;

    for (const activity of activities) {
      if (activity.isError) failedCount++;

      if (activity.from.toLowerCase() === address) {
        volume = volume.add(ethers.BigNumber.from(activity.value || '0'));
      }

      if (activity.gasUsed && activity.gasPrice) {
        gas = gas.add(
          ethers.BigNumber.from(activity.gasUsed).mul(
            ethers.BigNumber.from(activity.gasPrice),
          ),
        );
      }

      if (activity.to && activity.method) {
        contracts.add(activity.to.toLowerCase());
      }

      if (!firstTx || activity.timestamp < firstTx)
        firstTx = activity.timestamp;
      if (!lastTx || activity.timestamp > lastTx) lastTx = activity.timestamp;
    }

    return {
      txCount: activities.length,
      failedCount,
      uniqueContracts: contracts.size,
      volumeEth: ethers.utils.formatEther(volume),
      gasEth: ethers.utils.formatEther(gas),
      firstTx,
      lastTx,
    };
  }
}
