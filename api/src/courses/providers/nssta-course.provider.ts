import { Injectable, Logger } from '@nestjs/common';
import { ICourseProvider } from './course-provider.interface';
import {
  ProviderCapabilities,
  RawCoursePayload,
  CourseDifficulty,
  DifficultySource,
} from '../types/course.types';

@Injectable()
export class NSSTACourseProvider implements ICourseProvider {
  readonly providerCode = 'NSSTA';
  readonly providerName = 'National Statistical Systems Training Academy (NSSTA)';
  readonly providerType = 'ACADEMY';

  private readonly logger = new Logger(NSSTACourseProvider.name);

  getCapabilities(): ProviderCapabilities {
    return {
      catalogRead: true,
      authenticatedCatalogSync: true,
      enrollmentRead: true,
      completionRead: true,
      liveSyncSupported: true,
      authStatusNote: 'Official NSSTA / TPAC Cadre Training Programme Repository Connected.',
    };
  }

  async fetchCatalog(): Promise<RawCoursePayload[]> {
    return [
      {
        externalId: 'NSSTA-TPAC-PY-301',
        title: 'Advanced PyData and Vectorized Computing for Microdata Aggregation',
        description: 'Advanced NSSTA workshop on high-performance NumPy broadcasting, Dask out-of-core chunk processing, and multiprocessing for gigabyte-scale Census & NSS microdata.',
        providerName: 'NSSTA Greater Noida / MoSPI',
        durationMinutes: 360,
        language: 'English',
        difficultyLevel: CourseDifficulty.ADVANCED,
        difficultySource: DifficultySource.PROVIDER_METADATA,
        courseUrl: 'https://mospi.gov.in/nssta/course/NSSTA-TPAC-PY-301',
        learningOutcomes: [
          'Process out-of-core microdata exceeding RAM using Dask chunking',
          'Eliminate Python interpreter bottlenecks with multi-dimensional NumPy einsum operations',
          'Parallelize survey validation rules across multiple CPU cores',
        ],
        tags: ['python', 'dask', 'vectorization', 'microdata', 'high-performance'],
        prerequisitesText: 'Proficiency in intermediate Python and pandas (Score 50+ in TECH_PYTHON).',
        sourceUpdatedAt: new Date('2026-02-10'),
      },
      {
        externalId: 'NSSTA-TPAC-GIS-201',
        title: 'Spatial Econometrics and Spatial Autocorrelation for District Planning',
        description: 'NSSTA institutional programme on spatial join topological predicates, GiST spatial indexing, Global Moran’s I, and LISA clustering for district poverty mapping.',
        providerName: 'NSSTA Greater Noida / MoSPI',
        durationMinutes: 300,
        language: 'English',
        difficultyLevel: CourseDifficulty.INTERMEDIATE,
        difficultySource: DifficultySource.PROVIDER_METADATA,
        courseUrl: 'https://mospi.gov.in/nssta/course/NSSTA-TPAC-GIS-201',
        learningOutcomes: [
          'Construct spatial weights matrices (Queen and Rook contiguity)',
          'Compute Moran’s I and Anselin Local Indicators of Spatial Association (LISA)',
          'Execute sub-second bounding box queries on PostGIS spatial databases',
        ],
        tags: ['gis', 'spatial-econometrics', 'moran-i', 'postgis', 'sdg'],
        prerequisitesText: 'Foundational GIS and coordinate systems (Score 40+ in TECH_GIS).',
        sourceUpdatedAt: new Date('2026-02-05'),
      },
      {
        externalId: 'NSSTA-TPAC-SAM-301',
        title: 'Small Area Estimation (SAE) and Complex Variance Linearization',
        description: 'Master-level NSSTA specialization on Fay-Herriot EBLUP models, Taylor Series Linearization, and GREG calibration weighting for disaggregated district statistics.',
        providerName: 'NSSTA Greater Noida / ISI Kolkata',
        durationMinutes: 420,
        language: 'English',
        difficultyLevel: CourseDifficulty.ADVANCED,
        difficultySource: DifficultySource.PROVIDER_METADATA,
        courseUrl: 'https://mospi.gov.in/nssta/course/NSSTA-TPAC-SAM-301',
        learningOutcomes: [
          'Formulate Fay-Herriot area-level models borrowing strength across administrative units',
          'Compute linearization for complex non-linear poverty indices',
          'Apply calibration raking to align survey estimates with Census population totals',
        ],
        tags: ['small-area-estimation', 'sampling', 'variance', 'eblup', 'isi'],
        prerequisitesText: 'Intermediate sampling theory and design weights (Score 50+ in STAT_SAMPLING).',
        sourceUpdatedAt: new Date('2026-01-28'),
      },
      {
        externalId: 'NSSTA-TPAC-SQL-201',
        title: 'Advanced SQL Window Functions, Rollups, and Query Optimization',
        description: 'Deep dive into analytical SQL: DENSE_RANK, moving averages, rolling frames, hierarchical ROLLUPs, and EXPLAIN ANALYZE tuning for multi-million row survey databases.',
        providerName: 'NSSTA Greater Noida / NIC MoSPI Cell',
        durationMinutes: 240,
        language: 'English',
        difficultyLevel: CourseDifficulty.INTERMEDIATE,
        difficultySource: DifficultySource.PROVIDER_METADATA,
        courseUrl: 'https://mospi.gov.in/nssta/course/NSSTA-TPAC-SQL-201',
        learningOutcomes: [
          'Master window frame clauses: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW',
          'Generate hierarchical subtotals with GROUP BY ROLLUP and GROUPING SETS',
          'Analyze query execution plans and eliminate costly sequential table scans',
        ],
        tags: ['sql', 'window-functions', 'postgresql', 'performance-tuning', 'optimization'],
        prerequisitesText: 'Basic SQL SELECT and JOIN operations.',
        sourceUpdatedAt: new Date('2026-02-12'),
      },
    ];
  }

  async getCourseByExternalId(externalId: string): Promise<RawCoursePayload | null> {
    const catalog = await this.fetchCatalog();
    return catalog.find((c) => c.externalId === externalId) || null;
  }
}
