import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import { Wallet } from './wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletsRepo: Repository<Wallet>,
  ) {}

  async create(userId: number, dto: CreateWalletDto): Promise<Wallet> {
    if (!ethers.utils.isAddress(dto.address)) {
      throw new BadRequestException('invalid ethereum address');
    }
    const address = dto.address.toLowerCase();

    const existing = await this.walletsRepo.findOne({
      where: { user: { id: userId }, address },
    });
    if (existing) {
      throw new ConflictException('wallet already added');
    }

    const wallet = this.walletsRepo.create({
      user: { id: userId } as any,
      address,
      label: dto.label ?? null,
    });
    return this.walletsRepo.save(wallet);
  }

  findAllByUser(userId: number): Promise<Wallet[]> {
    return this.walletsRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOwned(userId: number, walletId: number): Promise<Wallet> {
    const wallet = await this.walletsRepo.findOne({
      where: { id: walletId, user: { id: userId } },
    });
    if (!wallet) {
      throw new NotFoundException('wallet not found');
    }
    return wallet;
  }

  async remove(userId: number, walletId: number): Promise<void> {
    const wallet = await this.findOwned(userId, walletId);
    await this.walletsRepo.remove(wallet);
  }
}
