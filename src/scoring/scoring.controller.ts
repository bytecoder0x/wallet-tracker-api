import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ScoringService } from './scoring.service';
import { rules } from './rules';

@ApiTags('scoring')
@Controller()
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Get('scoring/rules')
  getRules() {
    return rules;
  }

  @Get('leaderboard')
  getLeaderboard(@Query('limit') limit?: string) {
    const parsed = limit ? parseInt(limit, 10) : 20;
    return this.scoringService.leaderboard(parsed);
  }
}
