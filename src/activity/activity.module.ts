import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './activity.entity';
import { Wallet } from '../wallets/wallet.entity';
import { ActivityService } from './activity.service';
import { SyncService } from './sync.service';
import {
  WalletActivityController,
  ActivityController,
} from './activity.controller';
import { ExplorerModule } from '../explorer/explorer.module';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, Wallet]),
    ExplorerModule,
    WalletsModule,
  ],
  controllers: [WalletActivityController, ActivityController],
  providers: [ActivityService, SyncService],
  exports: [ActivityService, SyncService],
})
export class ActivityModule {}
