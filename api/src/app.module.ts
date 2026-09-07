import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmployeesModule } from './employees/employees.module';
import { CompetenciesModule } from './competencies/competencies.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { CoursesModule } from './courses/courses.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { MathModule } from './math/math.module';
import { QuestionsModule } from './questions/questions.module';
import { AttemptsModule } from './attempts/attempts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    EmployeesModule,
    CompetenciesModule,
    AssessmentsModule,
    CoursesModule,
    RecommendationsModule,
    MathModule,
    QuestionsModule,
    AttemptsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}