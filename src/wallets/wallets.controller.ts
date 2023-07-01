import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  AuthUser,
} from '../common/decorators/current-user.decorator';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';

@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateWalletDto) {
    return this.walletsService.create(user.id, dto);
  }
}
