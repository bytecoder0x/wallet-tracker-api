import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateActivityDto {
  @ApiProperty()
  @IsInt()
  walletId: number;

  @ApiProperty({ example: 'starknet' })
  @IsString()
  chain: string;

  @ApiProperty()
  @IsString()
  hash: string;

  @ApiProperty()
  @IsDateString()
  timestamp: string;

  @ApiPropertyOptional({ description: 'wei as string' })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
