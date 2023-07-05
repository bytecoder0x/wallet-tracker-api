import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyWalletDto {
  @ApiProperty()
  @IsString()
  signature: string;
}
