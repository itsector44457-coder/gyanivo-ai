import { Test, TestingModule } from '@nestjs/testing';
import { CompetenciesService } from './competencies.service';
import { CompetencyEngineService } from './competency-engine.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CompetenciesService', () => {
  let service: CompetenciesService;

  const mockProfile = {
    id: 1,
    userId: 1,
    employeeCode: 'MOSPI-SSS-8842',
    designation: 'Statistical Officer',
    department: { name: 'National Statistical Office' },
    jobRole: {
      name: 'Statistical Officer',
      requirements: [
        {
          id: 1,
          requiredScore: 70,
          priorityWeight: 1.0,
          isMandatory: true,
          competency: {
            id: 102,
            code: 'TECH_PYTHON',
            name: 'Python',
            domainId: 2,
            domain: { id: 2, code: 'TECHNICAL', name: 'Technical' },
          },
        },
      ],
    },
    competencies: [
      {
        competencyId: 102,
        currentScore: 38,
        confidence: 0.72,
        evidenceCount: 4,
        lastEvaluatedAt: new Date(),
      },
    ],
  };

  const mockPrisma = {
    employeeProfile: {
      findUnique: jest.fn().mockResolvedValue(mockProfile),
    },
    competencyHistory: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    competency: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    competencyDomain: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    jobRole: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({ id: 1, name: 'Statistical Officer' }),
    },
    roleCompetencyRequirement: {
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    $transaction: jest.fn().mockImplementation(async (cb) => cb(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompetenciesService,
        CompetencyEngineService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<CompetenciesService>(CompetenciesService);
  });

  it('should return employee competencies with correct gap calculations', async () => {
    const res = await service.getMyCompetencies(1);
    expect(res.success).toBe(true);
    expect(res.data.competencies).toHaveLength(1);
    expect(res.data.competencies[0].gap).toBe(32);
    expect(res.data.overallScore).toBe(38);
  });

  it('should return skill gaps for employee', async () => {
    const res = await service.getMySkillGaps(1);
    expect(res.success).toBe(true);
    expect(res.data.gaps).toHaveLength(1);
    expect(res.data.criticalGapsCount).toBe(1);
  });
});
