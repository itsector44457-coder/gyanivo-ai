export enum GapSeverity {
  NONE = 'NONE',
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum CompetencyStatus {
  NOT_ASSESSED = 'NOT_ASSESSED',
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT',
  DEVELOPING = 'DEVELOPING',
  MEETS_REQUIREMENT = 'MEETS_REQUIREMENT',
  EXCEEDS_REQUIREMENT = 'EXCEEDS_REQUIREMENT',
}

export interface CompetencyEvaluationResult {
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
  lastEvaluatedAt: Date | null;
  status: CompetencyStatus;
  reason: string;
  needsAssessment: boolean;
}

export interface EmployeeDashboardSummary {
  overallScore: number;
  totalRequiredCompetencies: number;
  competenciesMeetingTarget: number;
  competenciesBelowTarget: number;
  unassessedCompetencies: number;
  criticalGapsCount: number;
  highGapsCount: number;
  topPriorityGaps: CompetencyEvaluationResult[];
  recentHistory: Array<{
    id: number;
    competencyName: string;
    competencyCode: string;
    previousScore: number;
    newScore: number;
    changeReason: string | null;
    sourceType: string;
    createdAt: Date;
  }>;
}
