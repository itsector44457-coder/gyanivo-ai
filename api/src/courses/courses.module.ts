import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { SemanticMappingService } from './semantic-mapping.service';
import { IGOTCourseProvider } from './providers/igot-course.provider';
import { NSSTACourseProvider } from './providers/nssta-course.provider';
import { LocalDevelopmentCourseProvider } from './providers/local-dev-course.provider';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [CoursesController],
  providers: [
    CoursesService,
    SemanticMappingService,
    IGOTCourseProvider,
    NSSTACourseProvider,
    LocalDevelopmentCourseProvider,
  ],
  exports: [CoursesService, SemanticMappingService],
})
export class CoursesModule {}
