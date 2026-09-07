import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsService } from './questions.service';
import { PrismaService } from '../prisma/prisma.service';
import { MathService } from '../math/math.service';

describe('QuestionsService', () => {
  let service: QuestionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        {
          provide: PrismaService,
          useValue: {
            question: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
            student: { findUnique: jest.fn() },
            subject: { findFirst: jest.fn() },
            studentSkillMastery: { findMany: jest.fn() },
            skill: { findMany: jest.fn() },
          },
        },
        {
          provide: MathService,
          useValue: {
            generateQuestion: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<QuestionsService>(QuestionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
