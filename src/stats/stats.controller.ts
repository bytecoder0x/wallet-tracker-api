import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  AuthUser,
} from '../common/decorators/current-user.decorator';
import { WalletsService } from '../wallets/wallets.service';
import { ActivityService } from '../activity/activity.service';
import { StatsService } from './stats.service';
import { BalancesService } from './balances.service';
import { ScoringService } from '../scoring/scoring.service';

@ApiTags('stats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class StatsController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly activityService: ActivityService,
    private readonly statsService: StatsService,
    private readonly balancesService: BalancesService,
    private readonly scoringService: ScoringService,
  ) {}

  @Get(':id/stats')
  async stats(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const wallet = await this.walletsService.findOwned(user.id, id);
    const activities = await this.activityService.findAllByWallet(wallet.id);
    return this.statsService.buildStats(activities, wallet.address);
  }

  @Get(':id/balances')
  async balances(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const wallet = await this.walletsService.findOwned(user.id, id);
    return this.balancesService.getBalances(wallet.address);
  }

  @Get(':id/score')
  async score(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const wallet = await this.walletsService.findOwned(user.id, id);
    const activities = await this.activityService.findAllByWallet(wallet.id);
    return this.scoringService.scoreWallet(wallet, activities);
  }
}
