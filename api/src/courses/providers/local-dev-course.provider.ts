import { Injectable, Logger } from '@nestjs/common';
import { ICourseProvider } from './course-provider.interface';
import {
  ProviderCapabilities,
  RawCoursePayload,
  CourseDifficulty,
  DifficultySource,
} from '../types/course.types';

@Injectable()
export class LocalDevelopmentCourseProvider implements ICourseProvider {
  readonly providerCode = 'LOCAL_DEV';
  readonly providerName = 'Local Development Training Sandbox';
  readonly providerType = 'DEVELOPMENT_ONLY';

  private readonly logger = new Logger(LocalDevelopmentCourseProvider.name);

  getCapabilities(): ProviderCapabilities {
    return {
      catalogRead: true,
      authenticatedCatalogSync: true,
      enrollmentRead: true,
      completionRead: true,
      liveSyncSupported: true,
      authStatusNote: 'DEVELOPMENT ONLY: Mock provider for testing offline scenarios and calibration.',
    };
  }

  async fetchCatalog(): Promise<RawCoursePayload[]> {
    return [
      {
        externalId: 'DEV-MOSPI-PY-001',
        title: 'Introduction to Python for Non-Programmer Statisticians',
        description: 'Gentle step-by-step introduction to Python syntax, variables, lists, dictionaries, and simple data processing.',
        providerName: 'Internal Training Cell',
        durationMinutes: 90,
        language: 'Hindi & English',
        difficultyLevel: CourseDifficulty.FOUNDATIONAL,
        difficultySource: DifficultySource.PROVIDER_METADATA,
        courseUrl: 'http://localhost:3000/courses/DEV-MOSPI-PY-001',
        learningOutcomes: [
          'Understand Python syntax, types, and loops',
          'Load CSV files using built-in csv module',
          'Perform basic summary calculations',
        ],
        tags: ['python', 'basics', 'foundational', 'beginners'],
        prerequisitesText: 'None.',
        sourceUpdatedAt: new Date('2026-01-01'),
      },
      {
        externalId: 'DEV-MOSPI-GIS-001',
        title: 'Fundamentals of GPS Mapping and OpenStreetMap',
        description: 'Hands-on guide to collecting handheld GPS points and uploading spatial survey boundaries to OpenStreetMap.',
        providerName: 'Internal Training Cell',
        durationMinutes: 90,
        language: 'Hindi & English',
        difficultyLevel: CourseDifficulty.FOUNDATIONAL,
        difficultySource: DifficultySource.PROVIDER_METADATA,
        courseUrl: 'http://localhost:3000/courses/DEV-MOSPI-GIS-001',
        learningOutcomes: [
          'Collect GPS latitude and longitude waypoint records',
          'Import GPS points into QGIS',
          'Perform visual spatial verification',
        ],
        tags: ['gps', 'osm', 'mapping', 'foundational'],
        prerequisitesText: 'None.',
        sourceUpdatedAt: new Date('2026-01-01'),
      },
    ];
  }

  async getCourseByExternalId(externalId: string): Promise<RawCoursePayload | null> {
    const catalog = await this.fetchCatalog();
    return catalog.find((c) => c.externalId === externalId) || null;
  }
}
