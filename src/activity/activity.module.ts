import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './activity.entity';
import { ActivityService } from './activity.service';
import {
  WalletActivityController,
  ActivityController,
} from './activity.controller';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [TypeOrmModule.forFeature([Activity]), WalletsModule],
  controllers: [WalletActivityController, ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
