import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({ example: '0xd8dA6BF26964aF9D7eEd9e03E43415D37aA96045' })
  @IsString()
  address: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;
}
