import { Test, TestingModule } from '@nestjs/testing';
import { AttemptsService } from './attempts.service';
import { PrismaService } from '../prisma/prisma.service';
import { MathService } from '../math/math.service';

describe('AttemptsService', () => {
  let service: AttemptsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttemptsService,
        {
          provide: PrismaService,
          useValue: {
            student: { findUnique: jest.fn() },
            question: { findUnique: jest.fn() },
            attempt: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
            attemptStep: { create: jest.fn(), count: jest.fn() },
            skill: { findUnique: jest.fn() },
            studentSkillMastery: { findUnique: jest.fn(), upsert: jest.fn() },
          },
        },
        {
          provide: MathService,
          useValue: {
            validateStep: jest.fn(),
            updateKnowledge: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AttemptsService>(AttemptsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
