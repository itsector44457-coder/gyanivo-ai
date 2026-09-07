import { apiClient } from './client';

export type GapSeverity = 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type CompetencyStatus =
  | 'NOT_ASSESSED'
  | 'NEEDS_IMPROVEMENT'
  | 'DEVELOPING'
  | 'MEETS_REQUIREMENT'
  | 'EXCEEDS_REQUIREMENT';

export interface EvaluatedCompetency {
  competencyId: number;
  code: string;
  name: string;
  domainId: number;
  domainName: string;
  domainCode: string;
  currentScore: number | null;
  requiredScore: number;
  gap: number;
  severity: GapSeverity;
  priorityScore: number;
  confidence: number;
  evidenceCount: number;
  isMandatory: boolean;
  priorityWeight: number;
  lastEvaluatedAt: string | null;
  status: CompetencyStatus;
  reason: string;
  needsAssessment: boolean;
}

export interface EmployeeCompetenciesResponse {
  success: boolean;
  data: {
    employee: {
      id: number;
      employeeCode?: string;
      designation: string;
      department?: string;
      jobRole: string;
    };
    overallScore: number;
    totalRequired: number;
    metRequirements: number;
    belowRequirements: number;
    competencies: EvaluatedCompetency[];
  };
}

export interface EmployeeSkillGapsResponse {
  success: boolean;
  data: {
    employee: {
      id: number;
      jobRole: string;
    };
    overallScore: number;
    totalGapsCount: number;
    criticalGapsCount: number;
    highGapsCount: number;
    gaps: EvaluatedCompetency[];
  };
}

export interface EmployeeDashboardResponse {
  success: boolean;
  data: {
    overallScore: number;
    totalRequiredCompetencies: number;
    competenciesMeetingTarget: number;
    competenciesBelowTarget: number;
    unassessedCompetencies: number;
    criticalGapsCount: number;
    highGapsCount: number;
    topPriorityGaps: EvaluatedCompetency[];
    recentHistory: Array<{
      id: number;
      competencyName: string;
      competencyCode: string;
      previousScore: number;
      newScore: number;
      changeReason: string | null;
      sourceType: string;
      createdAt: string;
    }>;
  };
}

export interface CompetenciesCatalogResponse {
  success: boolean;
  domains: Array<{
    id: number;
    code: string;
    name: string;
    description: string;
    _count?: { competencies: number };
  }>;
  competencies: Array<{
    id: number;
    code: string;
    name: string;
    description?: string;
    domainId: number;
    domain: { id: number; code: string; name: string };
  }>;
}

export interface JobRolesResponse {
  success: boolean;
  roles: Array<{
    id: number;
    code: string;
    name: string;
    description?: string;
    level?: number;
    department?: { id: number; code: string; name: string };
    _count?: { requirements: number; employees: number };
  }>;
}

export interface JobRoleMatrixResponse {
  success: boolean;
  role: {
    id: number;
    code: string;
    name: string;
    department?: { id: number; code: string; name: string };
    requirements: Array<{
      id: number;
      requiredScore: number;
      priorityWeight: number;
      isMandatory: boolean;
      minimumScore?: number;
      sourceReference?: string;
      competency: {
        id: number;
        code: string;
        name: string;
        domain: { id: number; code: string; name: string };
      };
    }>;
  };
}

export async function getMyCompetencies(): Promise<EmployeeCompetenciesResponse> {
  return apiClient<EmployeeCompetenciesResponse>('/employees/me/competencies');
}

export async function getMySkillGaps(includeSatisfied = false): Promise<EmployeeSkillGapsResponse> {
  return apiClient<EmployeeSkillGapsResponse>(
    `/employees/me/skill-gaps?includeSatisfied=${includeSatisfied}`,
  );
}

export async function getMyDashboardStats(): Promise<EmployeeDashboardResponse> {
  return apiClient<EmployeeDashboardResponse>('/employees/me/dashboard');
}

export async function getCompetenciesCatalog(
  domain?: string,
  search?: string,
): Promise<CompetenciesCatalogResponse> {
  const params: Record<string, string> = {};
  if (domain && domain !== 'ALL') params.domain = domain;
  if (search) params.search = search;
  return apiClient<CompetenciesCatalogResponse>('/competencies', { params });
}

export async function getJobRoles(): Promise<JobRolesResponse> {
  return apiClient<JobRolesResponse>('/admin/job-roles');
}

export async function getJobRoleCompetencies(roleId: number): Promise<JobRoleMatrixResponse> {
  return apiClient<JobRoleMatrixResponse>(`/admin/job-roles/${roleId}/competencies`);
}

export async function updateJobRoleCompetencies(
  roleId: number,
  requirements: Array<{
    competencyId: number;
    requiredScore: number;
    priorityWeight?: number;
    isMandatory?: boolean;
    minimumScore?: number;
    sourceReference?: string;
  }>,
): Promise<JobRoleMatrixResponse> {
  return apiClient<JobRoleMatrixResponse>(`/admin/job-roles/${roleId}/competencies`, {
    method: 'PUT',
    body: JSON.stringify({ requirements }),
  });
}
