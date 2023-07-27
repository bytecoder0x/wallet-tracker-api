import { Module } from '@nestjs/common';
import { WalletsModule } from '../wallets/wallets.module';
import { ActivityModule } from '../activity/activity.module';
import { ScoringModule } from '../scoring/scoring.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { BalancesService } from './balances.service';

@Module({
  imports: [WalletsModule, ActivityModule, ScoringModule],
  controllers: [StatsController],
  providers: [StatsService, BalancesService],
})
export class StatsModule {}
