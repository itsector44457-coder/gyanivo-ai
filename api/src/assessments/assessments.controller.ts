import {
  Body,
  Controller,
  Get,
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
    return this.assessmentsService.startDiagnostic(user.id, dto);
  }

  @Post('attempts/:attemptId/answer')
  async submitAnswer(
    @CurrentUser() user: AuthenticatedUser,
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.assessmentsService.submitAnswer(user.id, attemptId, dto);
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
