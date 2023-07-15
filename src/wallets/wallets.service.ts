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

const VERIFY_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class WalletsService {
  private readonly pendingVerifications = new Map<
    number,
    { message: string; expiresAt: number }
  >();

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

  findVerified(): Promise<Wallet[]> {
    return this.walletsRepo.find({ where: { verified: true } });
  }

  async remove(userId: number, walletId: number): Promise<void> {
    const wallet = await this.findOwned(userId, walletId);
    await this.walletsRepo.remove(wallet);
  }

  getVerifyMessage(wallet: Wallet): string {
    const nonce = Math.random().toString(36).slice(2);
    const message = `wallet-tracker: verify ${wallet.address} nonce ${nonce}`;
    this.pendingVerifications.set(wallet.id, {
      message,
      expiresAt: Date.now() + VERIFY_TTL_MS,
    });
    return message;
  }

  // adress is saved in lowercase, so compare in lowercase too
  async verify(wallet: Wallet, signature: string): Promise<Wallet> {
    const pending = this.pendingVerifications.get(wallet.id);
    if (!pending || pending.expiresAt < Date.now()) {
      throw new BadRequestException(
        'verify message expired, request a new one',
      );
    }

    const recovered = ethers.utils
      .verifyMessage(pending.message, signature)
      .toLowerCase();
    if (recovered !== wallet.address) {
      throw new BadRequestException('signature does not match wallet address');
    }

    this.pendingVerifications.delete(wallet.id);
    wallet.verified = true;
    return this.walletsRepo.save(wallet);
  }
}
