import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { generateNonce } from 'siwe';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  // nonce -> expires at
  private nonces = new Map<string, number>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('email already registered');
    }

    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({ email: dto.email, password });

    return this.buildToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('invalid credentials');
    }

    return this.buildToken(user);
  }

  getNonce() {
    const nonce = generateNonce();
    this.nonces.set(nonce, Date.now() + 10 * 60 * 1000);
    return { nonce };
  }

  private buildToken(user: User) {
    const payload = { sub: user.id, email: user.email, address: user.address };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
