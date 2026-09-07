import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RecommendationEngineService } from './recommendation-engine.service';
import { LearningPathService } from './learning-path.service';
import { RecommendationsController } from './recommendations.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RecommendationsController],
  providers: [RecommendationEngineService, LearningPathService],
  exports: [RecommendationEngineService, LearningPathService],
})
export class RecommendationsModule {}
