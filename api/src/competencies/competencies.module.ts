import { Module } from '@nestjs/common';
import { CompetenciesService } from './competencies.service';
import { CompetencyEngineService } from './competency-engine.service';
import { CompetenciesController } from './competencies.controller';
import { AdminRoleMatrixController } from './admin-role-matrix.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CompetenciesController, AdminRoleMatrixController],
  providers: [CompetenciesService, CompetencyEngineService],
  exports: [CompetenciesService, CompetencyEngineService],
})
export class CompetenciesModule {}
