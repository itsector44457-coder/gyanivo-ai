import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { QuestionDifficulty } from './types/assessment.types';

@Injectable()
export class AdaptiveAssessmentEngineService {
  private readonly logger = new Logger(AdaptiveAssessmentEngineService.name);
  private readonly mlServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.mlServiceUrl =
      this.configService.get<string>('ML_SERVICE_URL') ||
      'http://localhost:8000';
  }

  /**
   * Deterministically determines the initial question difficulty for a diagnostic session.
   */
  determineInitialDifficulty(
    currentScore: number | null | undefined,
  ): QuestionDifficulty {
    if (currentScore === null || currentScore === undefined) {
      return QuestionDifficulty.MEDIUM;
    }
    if (currentScore < 35) {
      return QuestionDifficulty.EASY;
    }
    if (currentScore <= 70) {
      return QuestionDifficulty.MEDIUM;
    }
    return QuestionDifficulty.HARD;
  }

  /**
   * Deterministically calculates the next difficulty based on current performance and streak.
   */
  determineNextDifficulty(
    currentDifficulty: QuestionDifficulty,
    isCorrect: boolean,
    streak: number, // Positive for consecutive correct, negative for consecutive incorrect
  ): QuestionDifficulty {
    if (isCorrect) {
      if (currentDifficulty === QuestionDifficulty.EASY && streak >= 1) {
        return QuestionDifficulty.MEDIUM;
      }
      if (currentDifficulty === QuestionDifficulty.MEDIUM && streak >= 2) {
        return QuestionDifficulty.HARD;
      }
      return currentDifficulty;
    } else {
      if (currentDifficulty === QuestionDifficulty.HARD && streak <= -1) {
        return QuestionDifficulty.MEDIUM;
      }
      if (currentDifficulty === QuestionDifficulty.MEDIUM && streak <= -2) {
        return QuestionDifficulty.EASY;
      }
      return currentDifficulty;
    }
  }

  /**
   * Selects the next unseen question matching the target difficulty or nearest fallback.
   */
  selectNextQuestion<T extends { id: number; difficulty: QuestionDifficulty }>(
    allQuestions: T[],
    seenQuestionIds: Set<number>,
    targetDifficulty: QuestionDifficulty,
  ): T | null {
    const unseen = allQuestions.filter((q) => !seenQuestionIds.has(q.id));
    if (unseen.length === 0) {
      return null;
    }

    // 1. Direct match
    const directMatch = unseen.filter((q) => q.difficulty === targetDifficulty);
    if (directMatch.length > 0) {
      return directMatch[0];
    }

    // 2. Fallback order based on requested difficulty
    let fallbackOrder: QuestionDifficulty[];
    if (targetDifficulty === QuestionDifficulty.HARD) {
      fallbackOrder = [QuestionDifficulty.MEDIUM, QuestionDifficulty.EASY];
    } else if (targetDifficulty === QuestionDifficulty.EASY) {
      fallbackOrder = [QuestionDifficulty.MEDIUM, QuestionDifficulty.HARD];
    } else {
      fallbackOrder = [QuestionDifficulty.EASY, QuestionDifficulty.HARD];
    }

    for (const diff of fallbackOrder) {
      const fallbackMatch = unseen.filter((q) => q.difficulty === diff);
      if (fallbackMatch.length > 0) {
        return fallbackMatch[0];
      }
    }

    return unseen[0];
  }

  /**
   * Calls the FastAPI BKT knowledge tracing service to update competency mastery probability (0.0 - 1.0).
   * Includes high-fidelity local mathematical BKT fallback if ML service is unreachable.
   */
  async updateMasteryProbability(
    priorProbability: number,
    isCorrect: boolean,
    difficulty: QuestionDifficulty,
    responseTimeMs?: number,
  ): Promise<number> {
    const prior = Math.min(0.99, Math.max(0.01, priorProbability));

    try {
      const response = await axios.post(
        `${this.mlServiceUrl}/knowledge-tracing/competency-update`,
        {
          priorMastery: prior,
          correct: isCorrect,
          difficulty: difficulty,
          timeTakenSec: responseTimeMs
            ? Math.round(responseTimeMs / 1000)
            : undefined,
        },
        { timeout: 3000 },
      );

      if (
        response.data &&
        typeof response.data.updatedMastery === 'number'
      ) {
        return response.data.updatedMastery;
      }
    } catch (error) {
      this.logger.warn(
        `ML Service BKT call failed, using local mathematical engine: ${
          error instanceof Error ? error.message : error
        }`,
      );
    }

    // Local deterministic BKT calculation
    return this.calculateLocalBKT(prior, isCorrect, difficulty);
  }

  /**
   * Local Bayesian Knowledge Tracing calculation matching standard parameters.
   */
  public calculateLocalBKT(
    prior: number,
    isCorrect: boolean,
    difficulty: QuestionDifficulty,
  ): number {
    let guess = 0.2;
    let slip = 0.1;
    let learn = 0.1;

    if (difficulty === QuestionDifficulty.EASY) {
      guess = 0.25;
      slip = 0.08;
      learn = 0.12;
    } else if (difficulty === QuestionDifficulty.HARD) {
      guess = 0.15;
      slip = 0.12;
      learn = 0.08;
    }

    // 1. Observation Update
    let posterior: number;
    if (isCorrect) {
      const num = prior * (1 - slip);
      const den = num + (1 - prior) * guess;
      posterior = den === 0 ? prior : num / den;
    } else {
      const num = prior * slip;
      const den = num + (1 - prior) * (1 - guess);
      posterior = den === 0 ? prior : num / den;
    }

    // 2. Learning Transition
    const transitioned = posterior + (1 - posterior) * learn;

    // 3. Dynamic Evidence Blend
    const stepWeight =
      difficulty === QuestionDifficulty.HARD && isCorrect
        ? 0.85
        : difficulty === QuestionDifficulty.EASY && !isCorrect
        ? 0.85
        : 0.7;

    const maxDelta = 0.18;
    let blended: number;

    if (isCorrect) {
      blended = Math.min(prior + maxDelta, prior + (transitioned - prior) * stepWeight);
    } else {
      blended = Math.max(prior - maxDelta, prior + (transitioned - prior) * stepWeight);
    }

    return Math.min(0.99, Math.max(0.01, Math.round(blended * 10000) / 10000));
  }

  /**
   * Computes updated assessment statistical confidence based on evidence count and question volume.
   */
  calculateUpdatedConfidence(
    currentConfidence: number | null | undefined,
    evidenceCount: number,
  ): number {
    const base = currentConfidence ? Math.max(0.4, currentConfidence) : 0.5;
    const increment = Math.min(0.45, evidenceCount * 0.04);
    return Math.min(0.95, Math.round((base + increment) * 100) / 100);
  }
}
