import { Module } from '@nestjs/common';
import { WalletsModule } from '../wallets/wallets.module';
import { ActivityModule } from '../activity/activity.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [WalletsModule, ActivityModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
