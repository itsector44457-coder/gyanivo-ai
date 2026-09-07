import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationEngineService } from './recommendation-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { CourseDifficulty, MappingStatus } from '../generated/prisma/client';

describe('RecommendationEngineService', () => {
  let service: RecommendationEngineService;

  const mockProfile = {
    id: 1,
    userId: 1,
    employeeCode: 'MOSPI-SSS-8842',
    designation: 'Statistical Officer',
    user: { firstName: 'Ramesh', lastName: 'Kumar' },
    department: { name: 'Field Operations Division' },
    jobRole: {
      name: 'Statistical Officer',
      requirements: [
        {
          competencyId: 101,
          requiredScore: 70,
          priorityWeight: 1.0,
          isMandatory: true,
          competency: {
            id: 101,
            code: 'TECH_PYTHON',
            name: 'Python Data Science',
            domain: { name: 'Technical' },
          },
        },
        {
          competencyId: 102,
          requiredScore: 60,
          priorityWeight: 1.0,
          isMandatory: false,
          competency: {
            id: 102,
            code: 'TECH_GIS',
            name: 'GIS & Spatial Analysis',
            domain: { name: 'Technical' },
          },
        },
      ],
    },
    competencies: [
      { competencyId: 101, currentScore: 30, confidence: 0.8 }, // Gap = 40 (Mandatory)
      { competencyId: 102, currentScore: 50, confidence: 0.8 }, // Gap = 10 (Optional)
    ],
    enrollments: [
      { courseId: 999, status: 'COMPLETED' },
    ],
  };

  const mockCoursePython = {
    id: 1,
    providerId: 1,
    externalId: 'IGOT-MOSPI-PY-101',
    title: 'Python for Official Statistics',
    description: 'Foundational python',
    difficultyLevel: CourseDifficulty.BEGINNER,
    durationMinutes: 180,
    courseUrl: 'https://igotkarmayogi.gov.in',
    thumbnailUrl: null,
    tags: ['python'],
    isActive: true,
    provider: { code: 'IGOT', name: 'iGOT Karmayogi' },
    prerequisites: [],
  };

  const mockCourseGIS = {
    id: 2,
    providerId: 1,
    externalId: 'IGOT-MOSPI-GIS-101',
    title: 'GIS and Spatial Technology',
    description: 'Foundational GIS',
    difficultyLevel: CourseDifficulty.BEGINNER,
    durationMinutes: 120,
    courseUrl: 'https://igotkarmayogi.gov.in',
    thumbnailUrl: null,
    tags: ['gis'],
    isActive: true,
    provider: { code: 'IGOT', name: 'iGOT Karmayogi' },
    prerequisites: [],
  };

  const mockPrisma = {
    employeeProfile: {
      findUnique: jest.fn().mockResolvedValue(mockProfile),
    },
    courseCompetency: {
      findMany: jest.fn().mockResolvedValue([
        {
          courseId: 1,
          competencyId: 101,
          relevanceScore: 0.85,
          status: MappingStatus.APPROVED,
          course: mockCoursePython,
          competency: { id: 101, code: 'TECH_PYTHON', name: 'Python Data Science', domain: { name: 'Technical' } },
        },
        {
          courseId: 2,
          competencyId: 102,
          relevanceScore: 0.85,
          status: MappingStatus.APPROVED,
          course: mockCourseGIS,
          competency: { id: 102, code: 'TECH_GIS', name: 'GIS & Spatial Analysis', domain: { name: 'Technical' } },
        },
      ]),
    },
    courseRecommendation: {
      create: jest.fn().mockResolvedValue({ id: 1 }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationEngineService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RecommendationEngineService>(RecommendationEngineService);
  });

  it('should rank mandatory competency with larger gap higher', async () => {
    const recs = await service.getRecommendationsForEmployee(1);
    expect(recs.length).toBeGreaterThanOrEqual(2);

    // Python has larger gap (40 vs 10) and is mandatory (1.0 vs 0.5)
    expect(recs[0].competencyCode).toBe('TECH_PYTHON');
    expect(recs[0].recommendationScore).toBeGreaterThan(recs[1].recommendationScore);
    expect(recs[0].rankingPosition).toBe(1);
    expect(recs[0].reasons.length).toBeGreaterThan(0);
  });

  it('should calculate accurate level fit scores based on current score', () => {
    // Low score (30) -> favors BEGINNER
    const fitBeginner = service.calculateLevelFit(30, CourseDifficulty.BEGINNER);
    const fitAdvanced = service.calculateLevelFit(30, CourseDifficulty.ADVANCED);
    expect(fitBeginner).toBeGreaterThan(fitAdvanced);

    // High score (80) -> favors ADVANCED
    const fitAdvForMaster = service.calculateLevelFit(80, CourseDifficulty.ADVANCED);
    const fitBegForMaster = service.calculateLevelFit(80, CourseDifficulty.BEGINNER);
    expect(fitAdvForMaster).toBeGreaterThan(fitBegForMaster);
  });
});
