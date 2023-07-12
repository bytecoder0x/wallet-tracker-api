import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { Wallet } from '../wallets/wallet.entity';
import { ExplorerService } from '../explorer/explorer.service';
import { EXPLORER_CHAINS } from '../chains/chains';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
    private readonly explorerService: ExplorerService,
  ) {}

  // TODO: retry chains that failed, now they are just skipped
  async syncWallet(
    wallet: Wallet,
  ): Promise<{ added: number; chains: Record<string, number> }> {
    const chainsResult: Record<string, number> = {};
    let added = 0;

    for (const chain of EXPLORER_CHAINS) {
      try {
        const txs = await this.explorerService.fetchTransactions(
          chain,
          wallet.address,
        );
        let addedForChain = 0;

        for (const tx of txs) {
          const existing = await this.activityRepo.findOne({
            where: { chain, hash: tx.hash },
          });
          if (existing) continue;

          const method = tx.functionName
            ? tx.functionName.split('(')[0] || null
            : null;

          await this.activityRepo.save(
            this.activityRepo.create({
              wallet,
              chain,
              hash: tx.hash,
              blockNumber: Number(tx.blockNumber) || null,
              timestamp: new Date(Number(tx.timeStamp) * 1000),
              from: tx.from.toLowerCase(),
              to: tx.to ? tx.to.toLowerCase() : null,
              value: tx.value,
              gasUsed: tx.gasUsed,
              gasPrice: tx.gasPrice,
              method,
              isError: tx.isError === '1',
              source: 'explorer',
              note: null,
            }),
          );
          addedForChain++;
        }

        chainsResult[chain] = addedForChain;
        added += addedForChain;
      } catch (error) {
        this.logger.warn(
          `sync failed for ${chain} ${wallet.address}: ${error.message}`,
        );
        chainsResult[chain] = 0;
      }
    }

    wallet.lastSyncAt = new Date();
    await this.walletRepo.save(wallet);

    return { added, chains: chainsResult };
  }
}
