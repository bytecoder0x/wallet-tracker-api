import { BadRequestException, Injectable } from '@nestjs/common';
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

    const wallet = this.walletsRepo.create({
      user: { id: userId } as any,
      address: dto.address,
      label: dto.label ?? null,
    });
    return this.walletsRepo.save(wallet);
  }
}
