import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import { Wallet } from '../wallets/wallet.entity';
import { Activity } from '../activity/activity.entity';
import { protocolOf } from '../stats/protocols';
import { rules } from './rules';

@Injectable()
export class ScoringService {
  constructor(
    @InjectRepository(Wallet) private readonly walletsRepo: Repository<Wallet>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
  ) {}

  scoreWallet(wallet: Wallet, activities: Activity[]) {
    return this.calculate(wallet, activities);
  }

  async leaderboard(limit: number) {
    const wallets = await this.walletsRepo.find({ relations: ['user'] });

    const byUser = new Map<number, { address: string; wallets: Wallet[] }>();
    for (const wallet of wallets) {
      const entry = byUser.get(wallet.user.id) || {
        address: wallet.address,
        wallets: [],
      };
      entry.wallets.push(wallet);
      byUser.set(wallet.user.id, entry);
    }

    const result = [];
    for (const [userId, entry] of byUser) {
      let total = 0;
      for (const wallet of entry.wallets) {
        const activities = await this.activityRepo.find({
          where: { wallet: { id: wallet.id } },
        });
        total += this.calculate(wallet, activities).total;
      }

      result.push({
        user: userId,
        address: maskAddress(entry.address),
        wallets: entry.wallets.length,
        score: total,
      });
    }

    result.sort((a, b) => b.score - a.score);
    return result.slice(0, limit);
  }

  private calculate(wallet: Wallet, activities: Activity[]) {
    const address = wallet.address.toLowerCase();
    const months = new Set<string>();
    const contracts = new Set<string>();
    let volume = ethers.BigNumber.from(0);
    let bridgeTx = 0;
    let protocolTx = 0;

    for (const activity of activities) {
      months.add(activity.timestamp.toISOString().slice(0, 7));

      const protocol = protocolOf(activity.chain, activity.to);
      if (activity.to && (activity.method || protocol)) {
        contracts.add(activity.to.toLowerCase());
      }

      if (activity.from.toLowerCase() === address) {
        volume = volume.add(ethers.BigNumber.from(activity.value || '0'));
      }

      if (protocol) {
        protocolTx++;
        if (protocol.type === 'bridge') bridgeTx++;
      }
    }

    const volumeEth = Number(ethers.utils.formatEther(volume));

    const values: { [id: string]: number } = {
      tx_count: activities.length,
      unique_contracts: contracts.size,
      active_months: months.size,
      volume: Math.floor(volumeEth / 0.1),
      bridge_tx: bridgeTx,
      known_protocol: protocolTx,
      verified_wallet: wallet.verified ? 1 : 0,
    };

    const breakdown = rules.map((rule) => ({
      rule: rule.id,
      value: values[rule.id],
      points: Math.min(values[rule.id] * rule.points, rule.max),
    }));

    const total = breakdown.reduce((sum, item) => sum + item.points, 0);

    return { total, breakdown };
  }
}

function maskAddress(address: string | null): string | null {
  if (!address) return null;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
