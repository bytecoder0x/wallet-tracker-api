import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto) {
    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({ email: dto.email, password });

    return { id: user.id, email: user.email };
  }
}
