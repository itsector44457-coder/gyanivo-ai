import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { MathService } from './math.service';

import { ValidateStepDto } from './dto/validate-step.dto';

@Controller('math')
export class MathController {
  constructor(
    private readonly mathService: MathService,
  ) {}

  @Post('validate-step')
  async validateStep(
    @Body() data: ValidateStepDto,
  ) {
    return this.mathService.validateStep(
      data,
    );
  }
}