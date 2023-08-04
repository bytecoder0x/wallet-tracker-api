import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SiweDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsString()
  signature: string;
}
