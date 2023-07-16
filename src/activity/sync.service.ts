import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { Wallet } from '../wallets/wallet.entity';
import { WalletsService } from '../wallets/wallets.service';
import { ExplorerService } from '../explorer/explorer.service';
import { EXPLORER_CHAINS } from '../chains/chains';

const SLEEP_BETWEEN_CHAINS_MS = 250;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
    private readonly walletsService: WalletsService,
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
        // console.log(error);
        // network error or bad response, skip this chain
        this.logger.warn(
          `sync failed for ${chain} ${wallet.address}: ${error.message}`,
        );
        chainsResult[chain] = 0;
      }

      await sleep(SLEEP_BETWEEN_CHAINS_MS);
    }

    wallet.lastSyncAt = new Date();
    await this.walletRepo.save(wallet);

    return { added, chains: chainsResult };
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async syncAllVerified() {
    const wallets = await this.walletsService.findVerified();
    for (const wallet of wallets) {
      await this.syncWallet(wallet);
    }
  }
}
