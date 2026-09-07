import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
} from '@nestjs/common';

import { AttemptsService } from './attempts.service';

import { StartAttemptDto } from './dto/start-attempt.dto';

import { ValidateAttemptStepDto } from './dto/validate-attempt-step.dto';

@Controller('attempts')
export class AttemptsController {
  constructor(
    private readonly attemptsService:
      AttemptsService,
  ) {}

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

  @Post(':id/validate-step')
  validateStep(
    @Param('id')
    attemptId: string,

    @Body()
    data: ValidateAttemptStepDto,
  ) {
    const parsedAttemptId =
      Number(attemptId);

    if (!parsedAttemptId) {
      throw new BadRequestException(
        'Valid attempt id is required',
      );
    }

    if (!data) {
      throw new BadRequestException(
        'Request body is required',
      );
    }

    return this.attemptsService.validateStep(
      parsedAttemptId,
      data,
    );
  }
}