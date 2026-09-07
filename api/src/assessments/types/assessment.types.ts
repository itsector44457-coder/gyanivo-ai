import {
  QuestionDifficulty,
  AttemptStatus,
  AssessmentType,
} from '../../generated/prisma/client';

export { QuestionDifficulty, AttemptStatus, AssessmentType };

export interface QuestionOption {
  id: string; // "A", "B", "C", "D"
  text: string;
}

export interface SanitizedAssessmentQuestion {
  id: number;
  questionText: string;
  difficulty: QuestionDifficulty;
  options: QuestionOption[];
  questionNumber: number;
  totalQuestions: number;
}

export interface AnswerSubmissionResult {
  isCorrect: boolean;
  selectedOption: string;
  /**
   * Only present when isCompleted === true.
   * Never sent mid-session to prevent answer leakage.
   */
  correctOption?: string;
  /**
   * Only present when isCompleted === true.
   * Never sent mid-session to prevent answer leakage.
   */
  explanation?: string;
  estimatedMastery: number; // 0 - 100 percentage
  nextDifficulty: QuestionDifficulty;
  isCompleted: boolean;
  nextQuestion?: SanitizedAssessmentQuestion;
  resultsSummary?: AssessmentResultSummary;
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
  /**
   * Evidence-weighted reliability estimate (0.0 - 1.0).
   * Grows with more observed evidence (evidenceCount).
   * This is NOT a formal Bayesian confidence interval.
   */
  evidenceReliability: number;
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

export interface MyAssessmentsSummary {
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
    startedAt: Date;
    currentQuestionIndex: number;
    totalQuestions: number;
    currentDifficulty: QuestionDifficulty;
  }>;
  recentCompleted: Array<{
    attemptId: number;
    competencyId: number;
    competencyName: string;
    completedAt: Date;
    rawScore: number;
    initialScore: number | null;
    finalScore: number;
  }>;
}
