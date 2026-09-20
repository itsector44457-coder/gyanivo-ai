import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { StartDiagnosticDto } from './dto/start-diagnostic.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Controller('assessments')
@UseGuards(JwtAuthGuard)
export class AssessmentsController {
  private readonly logger = new Logger(AssessmentsController.name);

  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get('my')
  async getMyAssessments(@CurrentUser() user: AuthenticatedUser) {
    return this.assessmentsService.getMyAssessments(user.id);
  }

  @Post('diagnostic/start')
  async startDiagnostic(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: StartDiagnosticDto,
  ) {
    try {
      return await this.assessmentsService.startDiagnostic(user.id, dto);
    } catch (err: any) {
      this.logger.error(`Failed to start diagnostic for user ${user.id}: ${err.message}`, err.stack);
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        err.message || 'Internal error starting diagnostic assessment',
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('attempts/:attemptId/answer')
  async submitAnswer(
    @CurrentUser() user: AuthenticatedUser,
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @Body() dto: SubmitAnswerDto,
  ) {
    try {
      return await this.assessmentsService.submitAnswer(user.id, attemptId, dto);
    } catch (err: any) {
      this.logger.error(`Failed to submit answer for attempt ${attemptId}: ${err.message}`, err.stack);
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        err.message || 'Internal error submitting answer',
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('attempts/:attemptId/results')
  async getAttemptResults(
    @CurrentUser() user: AuthenticatedUser,
    @Param('attemptId', ParseIntPipe) attemptId: number,
  ) {
    return this.assessmentsService.getAttemptResults(user.id, attemptId);
  }

  @Public()
  @Get(':id')
  async getAssessmentById(@Param('id', ParseIntPipe) id: number) {
    return this.assessmentsService.getAssessmentById(id);
  }
}
