import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RecommendationEngineService } from './recommendation-engine.service';
import { LearningPathService } from './learning-path.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('employees/me')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(
    private readonly recommendationEngine: RecommendationEngineService,
    private readonly learningPathService: LearningPathService,
  ) {}

  /**
   * GET /employees/me/recommendations - Ranked, explainable course recommendations
   */
  @Get('recommendations')
  async getMyRecommendations(
    @CurrentUser() user: { id: number },
    @Query('competencyId') competencyId?: string,
    @Query('limit') limit?: string,
  ) {
    const recommendations =
      await this.recommendationEngine.getRecommendationsForEmployee(user.id, {
        competencyId: competencyId ? parseInt(competencyId, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : 10,
      });

    return {
      success: true,
      data: recommendations,
    };
  }

  /**
   * GET /employees/me/learning-path - Sequenced learning milestones and reassessment checkpoints
   */
  @Get('learning-path')
  async getMyLearningPath(@CurrentUser() user: { id: number }) {
    const learningPath =
      await this.learningPathService.generateLearningPath(user.id);

    return {
      success: true,
      data: learningPath,
    };
  }
}
