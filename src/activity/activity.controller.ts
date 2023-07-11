import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  AuthUser,
} from '../common/decorators/current-user.decorator';
import { WalletsService } from '../wallets/wallets.service';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';

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
