import { Module } from '@nestjs/common';

import { MathModule } from '../math/math.module';

import { QuestionsController } from './questions.controller';

import { QuestionsService } from './questions.service';

@Module({
  imports: [
    MathModule,
  ],

  controllers: [
    QuestionsController,
  ],

  providers: [
    QuestionsService,
  ],
})
export class QuestionsModule {}