import { Module } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { AdaptiveAssessmentEngineService } from './adaptive-assessment-engine.service';
import { AssessmentsController } from './assessments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CompetenciesModule } from '../competencies/competencies.module';

@Module({
  imports: [PrismaModule, CompetenciesModule],
  controllers: [AssessmentsController],
  providers: [AssessmentsService, AdaptiveAssessmentEngineService],
  exports: [AssessmentsService, AdaptiveAssessmentEngineService],
})
export class AssessmentsModule {}
