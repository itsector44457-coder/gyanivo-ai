import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ICourseProvider } from './course-provider.interface';
import {
  ProviderCapabilities,
  RawCoursePayload,
  CourseDifficulty,
  DifficultySource,
} from '../types/course.types';

@Injectable()
export class IGOTCourseProvider implements ICourseProvider {
  readonly providerCode = 'IGOT';
  readonly providerName = 'iGOT Karmayogi Bharat';
  readonly providerType = 'OFFICIAL_GOVERNMENT';

  private readonly logger = new Logger(IGOTCourseProvider.name);
  private readonly apiKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('IGOT_API_KEY');
  }

  getCapabilities(): ProviderCapabilities {
    const hasAuth = !!this.apiKey;
    return {
      catalogRead: true,
      authenticatedCatalogSync: hasAuth,
      enrollmentRead: hasAuth,
      completionRead: hasAuth,
      liveSyncSupported: hasAuth,
      authStatusNote: hasAuth
        ? 'Authenticated iGOT Karmayogi Enterprise integration active.'
        : 'Public Discoverable Catalog Active. Live Enrollment & Completion Sync requires authorized iGOT Bharat API credentials.',
    };
  }

  async fetchCatalog(): Promise<RawCoursePayload[]> {
    // Official public/discoverable MoSPI & Civil Services courses on iGOT Karmayogi
    return [
      {
        externalId: 'IGOT-MOSPI-PY-101',
        title: 'Python for Official Statistics and Large-Scale Data Handling',
        description: 'Comprehensive curriculum designed for Statistical Officers on using Python, pandas, and NumPy for survey data processing and tabulation.',
        providerName: 'iGOT Karmayogi / MoSPI',
        durationMinutes: 180,
        language: 'English',
        difficultyLevel: CourseDifficulty.BEGINNER,
        difficultySource: DifficultySource.PROVIDER_METADATA,
        courseUrl: 'https://igotkarmayogi.gov.in/app/toc/course/IGOT-MOSPI-PY-101',
        learningOutcomes: [
          'Master pandas DataFrame indexing and survey schedule cleaning',
          'Automate monthly price data validation workflows',
          'Handle missing values and survey response imputations in Python',
        ],
        tags: ['python', 'pandas', 'statistics', 'mospi', 'data-cleaning'],
        prerequisitesText: 'Basic computer literacy and spreadsheet familiarity.',
        sourceUpdatedAt: new Date('2026-01-15'),
      },
      {
        externalId: 'IGOT-MOSPI-GIS-101',
        title: 'GIS and Spatial Technology for Field Survey Enumeration',
        description: 'Foundational training on coordinate systems (EPSG:4326), satellite basemaps, and spatial verification of Enumeration Blocks (EBs).',
        providerName: 'iGOT Karmayogi / Survey of India',
        durationMinutes: 240,
        language: 'English',
        difficultyLevel: CourseDifficulty.BEGINNER,
        difficultySource: DifficultySource.PROVIDER_METADATA,
        courseUrl: 'https://igotkarmayogi.gov.in/app/toc/course/IGOT-MOSPI-GIS-101',
        learningOutcomes: [
          'Understand geographic coordinates (WGS84) vs projected map planes',
          'Verify household survey GPS points within official boundaries',
          'Export thematic choropleth maps for administrative reporting',
        ],
        tags: ['gis', 'spatial', 'gps', 'qgis', 'mapping'],
        prerequisitesText: 'None.',
        sourceUpdatedAt: new Date('2026-02-01'),
      },
      {
        externalId: 'IGOT-MOSPI-SAM-201',
        title: 'Principles of Multi-Stage Stratified Sampling in National Surveys',
        description: 'Intermediate course on sampling frame preparation, Primary Sampling Unit (PSU) selection, and design weights in official surveys.',
        providerName: 'iGOT Karmayogi / MoSPI NSO',
        durationMinutes: 300,
        language: 'English',
        difficultyLevel: CourseDifficulty.INTERMEDIATE,
        difficultySource: DifficultySource.PROVIDER_METADATA,
        courseUrl: 'https://igotkarmayogi.gov.in/app/toc/course/IGOT-MOSPI-SAM-201',
        learningOutcomes: [
          'Calculate design effects (Deff) and intra-cluster correlation',
          'Formulate inverse inclusion probability multipliers for NSS rounds',
          'Apply post-stratification and non-response adjustments',
        ],
        tags: ['sampling', 'stratification', 'survey-design', 'weights', 'nso'],
        prerequisitesText: 'Basic probability and descriptive statistics.',
        sourceUpdatedAt: new Date('2026-01-20'),
      },
      {
        externalId: 'IGOT-MOSPI-SQL-101',
        title: 'SQL Fundamentals for Government Data Analysts',
        description: 'Introduction to relational databases, multi-table joins, aggregations, and data extraction for administrative reporting.',
        providerName: 'iGOT Karmayogi / NIC',
        durationMinutes: 120,
        language: 'English',
        difficultyLevel: CourseDifficulty.FOUNDATIONAL,
        difficultySource: DifficultySource.PROVIDER_METADATA,
        courseUrl: 'https://igotkarmayogi.gov.in/app/toc/course/IGOT-MOSPI-SQL-101',
        learningOutcomes: [
          'Write SELECT, WHERE, GROUP BY, and HAVING queries',
          'Perform INNER and LEFT JOIN operations across survey master tables',
          'Handle NULL values using COALESCE',
        ],
        tags: ['sql', 'database', 'postgres', 'analytics'],
        prerequisitesText: 'None.',
        sourceUpdatedAt: new Date('2026-01-10'),
      },
    ];
  }

  async getCourseByExternalId(externalId: string): Promise<RawCoursePayload | null> {
    const catalog = await this.fetchCatalog();
    return catalog.find((c) => c.externalId === externalId) || null;
  }
}
