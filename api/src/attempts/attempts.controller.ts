import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  ParseIntPipe,
} from '@nestjs/common';

import { AttemptsService } from './attempts.service';

import { StartAttemptDto } from './dto/start-attempt.dto';

import { ValidateAttemptStepDto } from './dto/validate-attempt-step.dto';

import { Public } from '../common/decorators/public.decorator';

@Controller('attempts')
export class AttemptsController {
  constructor(
    private readonly attemptsService:
      AttemptsService,
  ) { }

  /**
   * POST /attempts/start
   *
   * Legacy attempt endpoint.
   *
   * Kept public temporarily for
   * backwards compatibility.
   */
  @Public()
  @Post('start')
  startAttempt(
    @Body()
    data: StartAttemptDto,
  ) {
    if (!data) {
      throw new BadRequestException(
        'Request body is required',
      );
    }

    if (!data.studentId) {
      throw new BadRequestException(
        'studentId is required',
      );
    }

    if (!data.questionId) {
      throw new BadRequestException(
        'questionId is required',
      );
    }

    return this.attemptsService.startAttempt(
      data.studentId,
      data.questionId,
    );
  }

  /**
   * POST /attempts/:id/validate-step
   *
   * Legacy step validation endpoint.
   */
  @Public()
  @Post(':id/validate-step')
  validateStep(
    @Param(
      'id',
      ParseIntPipe,
    )
    attemptId: number,

    @Body()
    data: ValidateAttemptStepDto,
  ) {
    if (!data) {
      throw new BadRequestException(
        'Request body is required',
      );
    }

    return this.attemptsService.validateStep(
      attemptId,
      data,
    );
  }
}