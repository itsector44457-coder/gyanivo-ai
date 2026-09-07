import { Test, TestingModule } from '@nestjs/testing';
import { LearningPathService } from './learning-path.service';
import { RecommendationEngineService } from './recommendation-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { CourseDifficulty } from '../generated/prisma/client';

describe('LearningPathService', () => {
  let service: LearningPathService;

  const mockProfile = {
    id: 1,
    userId: 1,
    user: { firstName: 'Ramesh', lastName: 'Kumar' },
    jobRole: { name: 'Statistical Officer' },
    competencies: [],
  };

  const mockRecommendations = [
    {
      courseId: 1,
      externalId: 'IGOT-MOSPI-PY-101',
      title: 'Python for Official Statistics',
      description: 'Foundational python',
      providerCode: 'IGOT',
      providerName: 'iGOT Karmayogi',
      durationMinutes: 180,
      difficultyLevel: CourseDifficulty.BEGINNER,
      courseUrl: 'https://igotkarmayogi.gov.in',
      thumbnailUrl: null,
      tags: ['python'],
      competencyId: 101,
      competencyCode: 'TECH_PYTHON',
      competencyName: 'Python Data Science',
      domainName: 'Technical',
      currentCompetencyScore: 30,
      requiredScore: 70,
      skillGap: 40,
      isMandatory: true,
      recommendationScore: 0.88,
      rankingPosition: 1,
      levelFitScore: 95,
      reasons: ['Addresses a 40 pt skill gap'],
    },
  ];

  const mockPrisma = {
    employeeProfile: {
      findUnique: jest.fn().mockResolvedValue(mockProfile),
    },
  };

  const mockRecEngine = {
    getRecommendationsForEmployee: jest.fn().mockResolvedValue(mockRecommendations),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningPathService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RecommendationEngineService, useValue: mockRecEngine },
      ],
    }).compile();

    service = module.get<LearningPathService>(LearningPathService);
  });

  it('should generate a sequenced learning path with course, reassessment, and goal milestones', async () => {
    const path = await service.generateLearningPath(1);
    expect(path.employeeName).toBe('Ramesh Kumar');
    expect(path.milestones.length).toBeGreaterThanOrEqual(3);

    // Step 1: Course
    expect(path.milestones[0].type).toBe('COURSE');
    expect(path.milestones[0].competencyCode).toBe('TECH_PYTHON');

    // Step 2: Reassessment
    expect(path.milestones[1].type).toBe('REASSESSMENT');

    // Final Step: Goal
    expect(path.milestones[path.milestones.length - 1].type).toBe('GOAL');
  });
});
