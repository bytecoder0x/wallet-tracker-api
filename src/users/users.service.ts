import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Wallet } from '../wallets/wallet.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Wallet) private readonly walletsRepo: Repository<Wallet>,
  ) {}

  findById(id: number): Promise<User | null> {
    return this.usersRepo.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOneBy({ email });
  }

  findByAddress(address: string): Promise<User | null> {
    return this.usersRepo.findOneBy({ address });
  }

  create(data: Partial<User>): Promise<User> {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  async getMe(id: number) {
    const user = await this.usersRepo.findOneBy({ id });
    const wallets = await this.walletsRepo.count({ where: { user: { id } } });

    return {
      id: user.id,
      email: user.email,
      address: user.address,
      createdAt: user.createdAt,
      wallets,
    };
  }
}
