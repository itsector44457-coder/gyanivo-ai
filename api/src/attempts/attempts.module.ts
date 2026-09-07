import { Module } from '@nestjs/common';

import { MathModule } from '../math/math.module';

import { AttemptsController } from './attempts.controller';

import { AttemptsService } from './attempts.service';

@Module({
  imports: [
    MathModule,
  ],

  controllers: [
    AttemptsController,
  ],

  providers: [
    AttemptsService,
  ],
})
export class AttemptsModule {}