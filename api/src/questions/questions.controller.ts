import {
  BadRequestException,
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly questionsService:
      QuestionsService,
  ) {}

  @Get('next')
  getNextQuestion(
    @Query('class')
    classLevel: string,

    @Query('subject')
    subject: string,

    @Query('difficulty')
    difficulty: string,
  ) {
    const parsedClass =
      Number(classLevel);

    const parsedDifficulty =
      Number(difficulty);

    if (!parsedClass) {
      throw new BadRequestException(
        'Valid class is required',
      );
    }

    if (!subject) {
      throw new BadRequestException(
        'Subject is required',
      );
    }

    if (
      ![1, 2, 3].includes(
        parsedDifficulty,
      )
    ) {
      throw new BadRequestException(
        'Difficulty must be 1, 2 or 3',
      );
    }

    return this.questionsService.getNextQuestion(
      parsedClass,
      subject,
      parsedDifficulty,
    );
  }

  @Get('adaptive')
  getAdaptiveQuestion(
    @Query('studentId')
    studentId: string,

    @Query('class')
    classLevel: string,

    @Query('subject')
    subject: string,
  ) {
    const parsedStudentId =
      Number(studentId);

    const parsedClass =
      Number(classLevel);

    if (!parsedStudentId) {
      throw new BadRequestException(
        'Valid studentId is required',
      );
    }

    if (!parsedClass) {
      throw new BadRequestException(
        'Valid class is required',
      );
    }

    if (!subject) {
      throw new BadRequestException(
        'Subject is required',
      );
    }

    return this.questionsService.getAdaptiveQuestion(
      parsedStudentId,
      parsedClass,
      subject,
    );
  }
}