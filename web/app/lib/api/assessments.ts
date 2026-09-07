import { apiClient } from './client';

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'EXPIRED';

export interface QuestionOption {
  id: string; // "A", "B", "C", "D"
  text: string;
}

export interface SanitizedQuestion {
  id: number;
  questionText: string;
  difficulty: QuestionDifficulty;
  options: QuestionOption[];
  questionNumber: number;
  totalQuestions: number;
}

export interface AssessmentResultSummary {
  attemptId: number;
  competencyId: number;
  competencyName: string;
  competencyCode: string;
  domainName: string;
  requiredScore: number;
  previousScore: number | null;
  newScore: number;
  scoreChange: number;
  previousGap: number;
  newGap: number;
  gapChange: number;
  /** Evidence-weighted reliability metric (0-1) */
  evidenceReliability?: number;
  /** Legacy alias for backwards compatibility */
  confidence?: number;
  evidenceCount: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  durationSeconds: number;
  difficultyBreakdown: {
    easy: { total: number; correct: number };
    medium: { total: number; correct: number };
    hard: { total: number; correct: number };
  };
}

export interface StartDiagnosticResponse {
  success: boolean;
  data: {
    attemptId: number;
    competencyId: number;
    competencyName: string;
    competencyCode: string;
    startedAt: string;
    initialScore: number | null;
    question: SanitizedQuestion;
  };
}

export interface SubmitAnswerResponse {
  success: boolean;
  data: {
    isCorrect: boolean;
    selectedOption: string;
    /** Present only when isCompleted === true to prevent answer leakage */
    correctOption?: string;
    /** Present only when isCompleted === true to prevent answer leakage */
    explanation?: string;
    estimatedMastery: number;
    nextDifficulty: QuestionDifficulty;
    isCompleted: boolean;
    nextQuestion?: SanitizedQuestion;
    resultsSummary?: AssessmentResultSummary;
  };
}

export interface MyAssessmentsResponse {
  success: boolean;
  data: {
    availableDiagnostics: Array<{
      competencyId: number;
      code: string;
      name: string;
      domain: string;
      requiredScore: number;
      currentScore: number | null;
      gap: number;
      isMandatory: boolean;
      needsAssessment: boolean;
      activeAttemptId?: number;
    }>;
    inProgressAttempts: Array<{
      attemptId: number;
      competencyId: number;
      competencyName: string;
      startedAt: string;
      currentQuestionIndex: number;
      totalQuestions: number;
      currentDifficulty: QuestionDifficulty;
    }>;
    recentCompleted: Array<{
      attemptId: number;
      competencyId: number;
      competencyName: string;
      completedAt: string;
      rawScore: number;
      initialScore: number | null;
      finalScore: number;
    }>;
  };
}

export interface AssessmentResultsResponse {
  success: boolean;
  data: AssessmentResultSummary;
}

export async function getMyAssessments(): Promise<MyAssessmentsResponse> {
  return apiClient<MyAssessmentsResponse>('/assessments/my');
}

export async function startDiagnosticAssessment(
  competencyId: number,
): Promise<StartDiagnosticResponse> {
  return apiClient<StartDiagnosticResponse>('/assessments/diagnostic/start', {
    method: 'POST',
    body: JSON.stringify({ competencyId }),
  });
}

export async function submitAssessmentAnswer(
  attemptId: number,
  questionId: number,
  selectedOption: string,
  responseTimeMs?: number,
): Promise<SubmitAnswerResponse> {
  return apiClient<SubmitAnswerResponse>(`/assessments/attempts/${attemptId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ questionId, selectedOption, responseTimeMs }),
  });
}

export async function getAssessmentResults(
  attemptId: number,
): Promise<AssessmentResultsResponse> {
  return apiClient<AssessmentResultsResponse>(`/assessments/attempts/${attemptId}/results`);
}
