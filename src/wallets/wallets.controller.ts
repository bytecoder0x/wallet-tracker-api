import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  AuthUser,
} from '../common/decorators/current-user.decorator';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { VerifyWalletDto } from './dto/verify-wallet.dto';

@ApiTags('wallets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateWalletDto) {
    return this.walletsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.walletsService.findAllByUser(user.id);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.walletsService.remove(user.id, id);
    return { removed: true };
  }

  @Get(':id/verify-message')
  async verifyMessage(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const wallet = await this.walletsService.findOwned(user.id, id);
    return { message: this.walletsService.getVerifyMessage(wallet) };
  }

  @Post(':id/verify')
  async verify(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerifyWalletDto,
  ) {
    const wallet = await this.walletsService.findOwned(user.id, id);
    await this.walletsService.verify(wallet, dto.signature);
    return { verified: true };
  }
}
