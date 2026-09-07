import { CourseDifficulty } from '../../generated/prisma/client';

export interface CourseRecommendationDto {
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
  recommendationScore: number; // 0.0 - 1.0
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

export interface PersonalizedLearningPathDto {
  employeeId: number;
  employeeName: string;
  jobRole: string;
  totalGapsIdentified: number;
  primaryFocusCompetency: string;
  estimatedTotalHours: number;
  milestones: LearningPathMilestone[];
}
