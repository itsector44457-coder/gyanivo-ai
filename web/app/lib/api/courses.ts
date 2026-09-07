// web/app/lib/api/courses.ts
// Real API client for Phase 4 Course Catalog, Recommendations & Learning Path

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000';

export type CourseDifficulty = 'FOUNDATIONAL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type MappingStatus = 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED';
export type MappingMethod = 'SEMANTIC' | 'KEYWORD' | 'HUMAN_OVERRIDE';

export interface CourseCompetencyMapping {
  competencyId: number;
  competencyCode: string;
  competencyName: string;
  domainName: string;
  relevanceScore: number;
  mappingMethod: MappingMethod;
  mappingReliability: number;
  status: MappingStatus;
  evidence: string | null;
}

export interface CourseDto {
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
  courseUrl: string | null;
  thumbnailUrl: string | null;
  learningOutcomes: string[];
  tags: string[];
  prerequisitesText: string | null;
  isActive: boolean;
  lastSyncedAt: string;
  competencyMappings: CourseCompetencyMapping[];
}

export interface CourseListResponse {
  items: CourseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CourseProvider {
  id?: number;
  code: string;
  name: string;
  providerType: string;
  status: string;
  capabilities: {
    catalogRead: boolean;
    authenticatedCatalogSync: boolean;
    enrollmentRead: boolean;
    completionRead: boolean;
    liveSyncSupported: boolean;
    authStatusNote: string;
  };
  courseCount: number;
  lastSyncAt: string | null;
}

export interface CourseRecommendation {
  courseId: number;
  externalId: string;
  title: string;
  description: string | null;
  providerCode: string;
  providerName: string;
  durationMinutes: number;
  difficultyLevel: CourseDifficulty;
  courseUrl: string | null;
  thumbnailUrl: string | null;
  tags: string[];
  competencyId: number;
  competencyCode: string;
  competencyName: string;
  domainName: string;
  currentCompetencyScore: number | null;
  requiredScore: number;
  skillGap: number;
  isMandatory: boolean;
  recommendationScore: number;
  rankingPosition: number;
  levelFitScore: number;
  reasons: string[];
  isEnrolled?: boolean;
  isCompleted?: boolean;
}

export interface LearningPathMilestone {
  stepNumber: number;
  type: 'COURSE' | 'REASSESSMENT' | 'GOAL';
  title: string;
  description: string;
  competencyCode: string;
  competencyName: string;
  difficultyLevel?: CourseDifficulty;
  durationMinutes?: number;
  courseId?: number;
  courseUrl?: string | null;
  providerName?: string;
  estimatedScoreGain?: number;
  targetCompetencyScore?: number;
  isCompleted?: boolean;
}

export interface PersonalizedLearningPath {
  employeeId: number;
  employeeName: string;
  jobRole: string;
  totalGapsIdentified: number;
  primaryFocusCompetency: string;
  estimatedTotalHours: number;
  milestones: LearningPathMilestone[];
}

export interface CourseMappingAdminRow {
  id: number;
  courseId: number;
  courseTitle: string;
  courseExternalId: string;
  providerCode: string;
  providerName: string;
  difficultyLevel: CourseDifficulty;
  competencyId: number;
  competencyCode: string;
  competencyName: string;
  domainName: string;
  relevanceScore: number;
  mappingMethod: MappingMethod;
  mappingReliability: number;
  evidence: string | null;
  status: MappingStatus;
  approvedByUser: string | null;
  approvedAt: string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), { headers: getAuthHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `API error ${res.status}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `API error ${res.status}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `API error ${res.status}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

// ── Course Catalog ────────────────────────────────────────────────────────────

export async function getCourses(params?: {
  search?: string;
  providerCode?: string;
  competencyCode?: string;
  difficulty?: CourseDifficulty;
  mappingStatus?: MappingStatus;
  page?: number;
  limit?: number;
}): Promise<CourseListResponse> {
  return apiGet<CourseListResponse>('/courses', params as Record<string, string>);
}

export async function getCourseById(id: number): Promise<CourseDto> {
  return apiGet<CourseDto>(`/courses/${id}`);
}

export async function getCourseProviders(): Promise<CourseProvider[]> {
  return apiGet<CourseProvider[]>('/courses/providers');
}

// ── Recommendations ───────────────────────────────────────────────────────────

export async function getMyRecommendations(params?: {
  competencyId?: number;
  limit?: number;
}): Promise<CourseRecommendation[]> {
  return apiGet<CourseRecommendation[]>('/employees/me/recommendations', params as Record<string, number>);
}

export async function getMyLearningPath(): Promise<PersonalizedLearningPath> {
  return apiGet<PersonalizedLearningPath>('/employees/me/learning-path');
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function syncProviderCatalog(idOrCode: string): Promise<{
  success: boolean;
  providerCode: string;
  itemsFetched: number;
  itemsCreated: number;
  itemsUpdated: number;
  mappingsCreated: number;
  durationMs: number;
}> {
  return apiPost(`/admin/course-providers/${idOrCode}/sync`);
}

export async function getCourseMappings(params?: {
  status?: MappingStatus;
  competencyId?: number;
  providerCode?: string;
}): Promise<CourseMappingAdminRow[]> {
  return apiGet<CourseMappingAdminRow[]>('/admin/course-mappings', params as Record<string, string>);
}

export async function updateCourseMapping(
  id: number,
  data: {
    status?: MappingStatus;
    overrideCompetencyId?: number;
    relevanceScore?: number;
    notes?: string;
  },
): Promise<{ success: boolean; mapping: Partial<CourseMappingAdminRow> }> {
  return apiPatch(`/admin/course-mappings/${id}`, data);
}
