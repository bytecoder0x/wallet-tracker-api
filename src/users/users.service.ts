import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  findById(id: number): Promise<User | null> {
    return this.usersRepo.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOneBy({ email });
  }

  create(data: Partial<User>): Promise<User> {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  async getMe(id: number) {
    const user = await this.usersRepo.findOneBy({ id });
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
