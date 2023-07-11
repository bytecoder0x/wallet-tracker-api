import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { Wallet } from '../wallets/wallet.entity';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
  ) {}

  async createManual(
    wallet: Wallet,
    dto: CreateActivityDto,
  ): Promise<Activity> {
    const existing = await this.activityRepo.findOne({
      where: { chain: dto.chain, hash: dto.hash },
    });
    if (existing) {
      throw new ConflictException('activity with this hash already exists');
    }

    const activity = this.activityRepo.create({
      wallet,
      chain: dto.chain,
      hash: dto.hash,
      blockNumber: null,
      timestamp: new Date(dto.timestamp),
      from: wallet.address,
      to: dto.to ?? null,
      value: dto.value ?? '0',
      gasUsed: null,
      gasPrice: null,
      method: null,
      isError: false,
      source: 'manual',
      note: dto.note ?? null,
    });

    return this.activityRepo.save(activity);
  }
}
