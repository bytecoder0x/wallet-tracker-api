import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { rules } from './rules';

@ApiTags('scoring')
@Controller()
export class ScoringController {
  @Get('scoring/rules')
  getRules() {
    return rules;
  }
}
