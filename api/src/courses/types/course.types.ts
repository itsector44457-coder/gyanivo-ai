import {
  CourseDifficulty,
  DifficultySource,
  MappingMethod,
  MappingStatus,
  ProviderStatus,
  SyncStatus,
  EnrollmentStatus,
  EnrollmentSource,
} from '../../generated/prisma/client';

export {
  CourseDifficulty,
  DifficultySource,
  MappingMethod,
  MappingStatus,
  ProviderStatus,
  SyncStatus,
  EnrollmentStatus,
  EnrollmentSource,
};

export interface ProviderCapabilities {
  catalogRead: boolean;
  authenticatedCatalogSync: boolean;
  enrollmentRead: boolean;
  completionRead: boolean;
  liveSyncSupported: boolean;
  authStatusNote: string;
}

export interface RawCoursePayload {
  externalId: string;
  title: string;
  description?: string;
  providerName: string;
  durationMinutes: number;
  language: string;
  difficultyLevel: CourseDifficulty;
  difficultySource: DifficultySource;
  courseUrl?: string;
  thumbnailUrl?: string;
  learningOutcomes?: string[];
  tags?: string[];
  prerequisitesText?: string;
  sourceUpdatedAt?: Date;
}

export interface NormalizedCourseDto {
  id: number;
  providerId: number;
  providerCode: string;
  providerName: string;
  externalId: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  language: string;
  difficultyLevel: CourseDifficulty;
  difficultySource: DifficultySource;
  courseUrl: string | null;
  thumbnailUrl: string | null;
  learningOutcomes: string[];
  tags: string[];
  prerequisitesText: string | null;
  isActive: boolean;
  lastSyncedAt: Date;
  competencyMappings: Array<{
    competencyId: number;
    competencyCode: string;
    competencyName: string;
    domainName: string;
    relevanceScore: number;
    mappingMethod: MappingMethod;
    mappingReliability: number;
    status: MappingStatus;
    evidence: string | null;
  }>;
}

export interface CourseCatalogFilterQuery {
  search?: string;
  providerCode?: string;
  competencyCode?: string;
  competencyId?: number;
  difficulty?: CourseDifficulty;
  mappingStatus?: MappingStatus;
  page?: number;
  limit?: number;
}
