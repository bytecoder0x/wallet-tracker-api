import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { EXPLORER_CHAINS, MANUAL_CHAINS } from '../../chains/chains';

const ALL_CHAINS = [...EXPLORER_CHAINS, ...MANUAL_CHAINS];

export class ActivityQueryDto {
  @ApiPropertyOptional({ enum: ALL_CHAINS })
  @IsOptional()
  @IsIn(ALL_CHAINS)
  chain?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
