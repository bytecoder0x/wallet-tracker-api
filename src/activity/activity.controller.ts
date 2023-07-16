import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  AuthUser,
} from '../common/decorators/current-user.decorator';
import { WalletsService } from '../wallets/wallets.service';
import { ActivityService } from './activity.service';
import { SyncService } from './sync.service';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { CreateActivityDto } from './dto/create-activity.dto';

// nested under /wallets since activity and sync both act on a specific wallet
@ApiTags('wallets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class WalletActivityController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly activityService: ActivityService,
    private readonly syncService: SyncService,
  ) {}

  @Get(':id/activity')
  async findActivity(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ActivityQueryDto,
  ) {
    await this.walletsService.findOwned(user.id, id);
    return this.activityService.findByWallet(id, query);
  }

  @Post(':id/sync')
  async sync(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const wallet = await this.walletsService.findOwned(user.id, id);
    return this.syncService.syncWallet(wallet);
  }
}

@ApiTags('activity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activity')
export class ActivityController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly activityService: ActivityService,
  ) {}

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateActivityDto) {
    const wallet = await this.walletsService.findOwned(user.id, dto.walletId);
    return this.activityService.createManual(wallet, dto);
  }
}
