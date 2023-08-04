import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { generateNonce, SiweMessage } from 'siwe';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SiweDto } from './dto/siwe.dto';
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

  async verifySiwe(dto: SiweDto) {
    const siweMessage = new SiweMessage(dto.message);
    const nonce = siweMessage.nonce;

    const expiresAt = this.nonces.get(nonce);
    if (!expiresAt || expiresAt < Date.now()) {
      this.nonces.delete(nonce);
      throw new UnauthorizedException('nonce expired or unknown');
    }

    const result = await siweMessage.verify({
      signature: dto.signature,
      nonce,
    });
    if (!result.success) {
      throw new UnauthorizedException('signature verification failed');
    }

    const address = result.data.address.toLowerCase();
    let user = await this.usersService.findByAddress(address);
    if (!user) {
      user = await this.usersService.create({ address });
    }

    return this.buildToken(user);
  }

  private buildToken(user: User) {
    const payload = { sub: user.id, email: user.email, address: user.address };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
