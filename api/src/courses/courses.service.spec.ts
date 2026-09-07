import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { SemanticMappingService } from './semantic-mapping.service';
import { IGOTCourseProvider } from './providers/igot-course.provider';
import { NSSTACourseProvider } from './providers/nssta-course.provider';
import { LocalDevelopmentCourseProvider } from './providers/local-dev-course.provider';
import { PrismaService } from '../prisma/prisma.service';
import {
  CourseDifficulty,
  DifficultySource,
  MappingMethod,
  MappingStatus,
} from './types/course.types';

describe('CoursesService', () => {
  let service: CoursesService;

  const mockProviderRecord = {
    id: 1,
    code: 'IGOT',
    name: 'iGOT Karmayogi Bharat',
    providerType: 'OFFICIAL_GOVERNMENT',
    status: 'ACTIVE',
  };

  const mockCompetency = {
    id: 101,
    code: 'TECH_PYTHON',
    name: 'Python Data Science',
    domain: { name: 'Technical' },
    isActive: true,
  };

  const mockCourse = {
    id: 1,
    providerId: 1,
    externalId: 'IGOT-MOSPI-PY-101',
    title: 'Python for Official Statistics',
    description: 'Pandas data handling',
    providerName: 'iGOT Karmayogi',
    durationMinutes: 180,
    language: 'English',
    difficultyLevel: CourseDifficulty.BEGINNER,
    difficultySource: DifficultySource.PROVIDER_METADATA,
    courseUrl: 'https://igotkarmayogi.gov.in',
    thumbnailUrl: null,
    learningOutcomes: ['Data handling'],
    tags: ['python'],
    prerequisitesText: null,
    isActive: true,
    lastSyncedAt: new Date(),
    provider: mockProviderRecord,
    competencyMappings: [
      {
        competencyId: 101,
        competency: mockCompetency,
        relevanceScore: 0.85,
        mappingMethod: MappingMethod.SEMANTIC,
        mappingReliability: 0.89,
        status: MappingStatus.APPROVED,
        evidence: 'High semantic match',
      },
    ],
  };

  const mockPrisma = {
    courseProvider: {
      findMany: jest.fn().mockResolvedValue([mockProviderRecord]),
      findUnique: jest.fn().mockResolvedValue(mockProviderRecord),
      upsert: jest.fn().mockResolvedValue(mockProviderRecord),
      update: jest.fn().mockResolvedValue(mockProviderRecord),
    },
    competency: {
      findMany: jest.fn().mockResolvedValue([mockCompetency]),
      findUnique: jest.fn().mockResolvedValue(mockCompetency),
    },
    course: {
      findMany: jest.fn().mockResolvedValue([mockCourse]),
      findUnique: jest.fn().mockResolvedValue(mockCourse),
      count: jest.fn().mockResolvedValue(1),
      create: jest.fn().mockResolvedValue(mockCourse),
      update: jest.fn().mockResolvedValue(mockCourse),
    },
    courseCompetency: {
      findMany: jest.fn().mockResolvedValue(mockCourse.competencyMappings),
      findUnique: jest.fn().mockResolvedValue(mockCourse.competencyMappings[0]),
      upsert: jest.fn().mockResolvedValue(mockCourse.competencyMappings[0]),
      update: jest.fn().mockResolvedValue({
        ...mockCourse.competencyMappings[0],
        id: 1,
        course: mockCourse,
        competency: mockCompetency,
      }),
    },
    courseSyncRun: {
      create: jest.fn().mockResolvedValue({ id: 1 }),
    },
  };

  const mockSemanticMapper = {
    mapCourseToCompetencies: jest.fn().mockResolvedValue([
      {
        competencyId: 101,
        competencyCode: 'TECH_PYTHON',
        competencyName: 'Python Data Science',
        domain: 'Technical',
        semanticSimilarity: 0.85,
        mappingReliability: 0.89,
        mappingStatus: MappingStatus.APPROVED,
        evidence: 'High semantic similarity',
      },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SemanticMappingService, useValue: mockSemanticMapper },
        {
          provide: IGOTCourseProvider,
          useValue: {
            providerCode: 'IGOT',
            providerName: 'iGOT Karmayogi Bharat',
            providerType: 'OFFICIAL_GOVERNMENT',
            getCapabilities: jest.fn().mockReturnValue({
              catalogRead: true,
              authenticatedCatalogSync: false,
              enrollmentRead: false,
              completionRead: false,
              liveSyncSupported: false,
              authStatusNote: 'Public Discoverable Catalog Active.',
            }),
            fetchCatalog: jest.fn().mockResolvedValue([
              {
                externalId: 'IGOT-MOSPI-PY-101',
                title: 'Python for Official Statistics',
                description: 'Pandas data handling',
                providerName: 'iGOT Karmayogi',
                durationMinutes: 180,
                language: 'English',
                difficultyLevel: CourseDifficulty.BEGINNER,
                difficultySource: DifficultySource.PROVIDER_METADATA,
                courseUrl: 'https://igotkarmayogi.gov.in',
                learningOutcomes: ['Data handling'],
                tags: ['python'],
              },
            ]),
            getCourseByExternalId: jest.fn(),
          },
        },
        {
          provide: NSSTACourseProvider,
          useValue: {
            providerCode: 'NSSTA',
            providerName: 'National Statistical Systems Training Academy',
            providerType: 'ACADEMY',
            getCapabilities: jest.fn().mockReturnValue({
              catalogRead: true,
              authenticatedCatalogSync: true,
              enrollmentRead: true,
              completionRead: true,
              liveSyncSupported: true,
              authStatusNote: 'Connected',
            }),
            fetchCatalog: jest.fn().mockResolvedValue([]),
            getCourseByExternalId: jest.fn(),
          },
        },
        {
          provide: LocalDevelopmentCourseProvider,
          useValue: {
            providerCode: 'LOCAL_DEV',
            providerName: 'Local Development Training Sandbox',
            providerType: 'DEVELOPMENT_ONLY',
            getCapabilities: jest.fn().mockReturnValue({
              catalogRead: true,
              authenticatedCatalogSync: true,
              enrollmentRead: true,
              completionRead: true,
              liveSyncSupported: true,
              authStatusNote: 'DEV ONLY',
            }),
            fetchCatalog: jest.fn().mockResolvedValue([]),
            getCourseByExternalId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should register all providers and return truthful capabilities', async () => {
    const statuses = await service.getProvidersStatus();
    expect(statuses).toHaveLength(3);

    const igot = statuses.find((s) => s.code === 'IGOT');
    expect(igot).toBeDefined();
    expect(igot?.capabilities.catalogRead).toBe(true);
    expect(igot?.capabilities.enrollmentRead).toBe(false); // Truthful check
  });

  it('should idempotently sync catalog and generate semantic mappings', async () => {
    const res = await service.syncProviderCatalog('IGOT');
    expect(res.success).toBe(true);
    expect(res.itemsFetched).toBe(1);
    expect(res.mappingsCreated).toBe(1);
    expect(mockSemanticMapper.mapCourseToCompetencies).toHaveBeenCalled();
  });

  it('should retrieve normalized courses with competency mappings', async () => {
    const result = await service.getCourses({});
    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('Python for Official Statistics');
    expect(result.items[0].competencyMappings[0].competencyCode).toBe('TECH_PYTHON');
  });

  it('should allow admin to override a course competency mapping', async () => {
    const res = await service.updateCourseMapping(
      1,
      {
        overrideCompetencyId: 101,
        status: MappingStatus.APPROVED,
        notes: 'Verified by cadre reviewer',
      },
      1,
    );

    expect(res.success).toBe(true);
    expect(res.mapping.status).toBe(MappingStatus.APPROVED);
    expect(mockPrisma.courseCompetency.update).toHaveBeenCalled();
  });
});
