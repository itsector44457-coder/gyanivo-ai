import { Injectable } from '@nestjs/common';
import {
  GapSeverity,
  CompetencyStatus,
  CompetencyEvaluationResult,
} from './types/competency-engine.types';

export interface RawRequirement {
  id: number;
  requiredScore: number;
  priorityWeight: number;
  isMandatory: boolean;
  competency: {
    id: number;
    code: string;
    name: string;
    domainId: number;
    domain: {
      id: number;
      code: string;
      name: string;
    };
  };
}

export interface RawEmployeeCompetency {
  competencyId: number;
  currentScore: number;
  confidence: number;
  evidenceCount: number;
  lastEvaluatedAt: Date | null;
}

@Injectable()
export class CompetencyEngineService {
  /**
   * Calculates the base gap between required score and current score.
   * If current score exceeds required score, gap is 0 (cannot be negative).
   */
  calculateGap(requiredScore: number, currentScore: number | null): number {
    if (currentScore === null || currentScore === undefined) {
      return requiredScore;
    }
    return Math.max(0, Math.round((requiredScore - currentScore) * 10) / 10);
  }

  /**
   * Determines gap severity category based on absolute point deficit.
   */
  determineSeverity(gap: number, isUnassessed: boolean): GapSeverity {
    if (isUnassessed) {
      return GapSeverity.CRITICAL;
    }
    if (gap <= 0) {
      return GapSeverity.NONE;
    }
    if (gap <= 10) {
      return GapSeverity.LOW;
    }
    if (gap <= 20) {
      return GapSeverity.MODERATE;
    }
    if (gap <= 30) {
      return GapSeverity.HIGH;
    }
    return GapSeverity.CRITICAL;
  }

  /**
   * Determines competency proficiency status relative to requirement.
   */
  determineStatus(
    currentScore: number | null,
    requiredScore: number,
  ): CompetencyStatus {
    if (currentScore === null || currentScore === undefined) {
      return CompetencyStatus.NOT_ASSESSED;
    }
    if (currentScore < requiredScore * 0.6) {
      return CompetencyStatus.NEEDS_IMPROVEMENT;
    }
    if (currentScore < requiredScore) {
      return CompetencyStatus.DEVELOPING;
    }
    if (currentScore < requiredScore * 1.15) {
      return CompetencyStatus.MEETS_REQUIREMENT;
    }
    return CompetencyStatus.EXCEEDS_REQUIREMENT;
  }

  /**
   * Deterministic priority score calculation normalized between 0.00 and 1.00.
   * Combines normalized gap, role priority weight, mandatory status, and assessment certainty.
   */
  calculatePriorityScore(
    gap: number,
    requiredScore: number,
    priorityWeight: number,
    isMandatory: boolean,
    confidence: number,
    isUnassessed: boolean,
  ): number {
    if (gap <= 0 && !isUnassessed) {
      return 0.0;
    }

    const safeRequired = Math.max(1, requiredScore);
    const normalizedGap = Math.min(1.0, gap / safeRequired);
    const mandatoryMultiplier = isMandatory ? 1.25 : 1.0;
    const weightFactor = Math.min(2.0, Math.max(0.5, priorityWeight || 1.0));
    
    // Higher uncertainty (lower confidence) gives slight urgency factor
    const certaintyFactor = isUnassessed ? 1.1 : 1.0 - (confidence * 0.15);

    const rawScore =
      (normalizedGap * 0.6 + 0.4 * (gap / 100)) *
      weightFactor *
      mandatoryMultiplier *
      certaintyFactor;

    return Math.min(1.0, Math.max(0.0, Math.round(rawScore * 100) / 100));
  }

  /**
   * Generates a deterministic, explainable rationale for the competency gap.
   */
  generateReason(
    competencyName: string,
    roleName: string,
    currentScore: number | null,
    requiredScore: number,
    gap: number,
    severity: GapSeverity,
    isMandatory: boolean,
    isUnassessed: boolean,
  ): string {
    if (isUnassessed) {
      return `${competencyName} is a ${
        isMandatory ? 'mandatory' : 'recommended'
      } competency for your role (${roleName}) with target benchmark of ${requiredScore}%, but has not yet been assessed. A diagnostic evaluation is required.`;
    }

    if (gap <= 0) {
      return `Your proficiency in ${competencyName} (${currentScore}%) meets or exceeds the required target of ${requiredScore}% for ${roleName}.`;
    }

    const urgencyText =
      severity === GapSeverity.CRITICAL
        ? 'critical priority training'
        : severity === GapSeverity.HIGH
        ? 'high priority development'
        : severity === GapSeverity.MODERATE
        ? 'moderate skill reinforcement'
        : 'minor refinement';

    return `${competencyName} is ${
      isMandatory ? 'mandatory' : 'required'
    } for ${roleName}. Your current score is ${currentScore}% against the benchmark of ${requiredScore}% (Gap: ${gap} points, ${severity} severity), making this a ${urgencyText} area.`;
  }

  /**
   * Computes the overall role-weighted competency score (0-100).
   * Only includes assessed competencies in the score average.
   */
  calculateOverallScore(evaluations: CompetencyEvaluationResult[]): number {
    const assessed = evaluations.filter((e) => e.currentScore !== null);
    if (assessed.length === 0) {
      return 0;
    }

    let weightedSum = 0;
    let totalWeight = 0;

    for (const item of assessed) {
      const weight = item.priorityWeight || 1.0;
      weightedSum += (item.currentScore as number) * weight;
      totalWeight += weight;
    }

    if (totalWeight === 0) {
      return 0;
    }

    return Math.round((weightedSum / totalWeight) * 10) / 10;
  }

  /**
   * Main evaluation runner taking raw role requirements and employee competencies,
   * returning a unified, priority-sorted array of evaluation results.
   */
  evaluateCompetencies(
    requirements: RawRequirement[],
    employeeCompetencies: RawEmployeeCompetency[],
    roleName = 'Official Role',
  ): CompetencyEvaluationResult[] {
    const empCompMap = new Map<number, RawEmployeeCompetency>();
    for (const ec of employeeCompetencies) {
      empCompMap.set(ec.competencyId, ec);
    }

    const results: CompetencyEvaluationResult[] = [];

    for (const req of requirements) {
      const empComp = empCompMap.get(req.competency.id);
      const isUnassessed = !empComp || empComp.currentScore === null;
      const currentScore = isUnassessed ? null : empComp.currentScore;
      const confidence = isUnassessed ? 0.0 : empComp.confidence;
      const evidenceCount = isUnassessed ? 0 : empComp.evidenceCount;
      const lastEvaluatedAt = isUnassessed ? null : empComp.lastEvaluatedAt;

      const gap = this.calculateGap(req.requiredScore, currentScore);
      const severity = this.determineSeverity(gap, isUnassessed);
      const status = this.determineStatus(currentScore, req.requiredScore);
      const priorityScore = this.calculatePriorityScore(
        gap,
        req.requiredScore,
        req.priorityWeight,
        req.isMandatory,
        confidence,
        isUnassessed,
      );
      const reason = this.generateReason(
        req.competency.name,
        roleName,
        currentScore,
        req.requiredScore,
        gap,
        severity,
        req.isMandatory,
        isUnassessed,
      );

      results.push({
        competencyId: req.competency.id,
        code: req.competency.code,
        name: req.competency.name,
        domainId: req.competency.domainId,
        domainName: req.competency.domain.name,
        domainCode: req.competency.domain.code,
        currentScore,
        requiredScore: req.requiredScore,
        gap,
        severity,
        priorityScore,
        confidence,
        evidenceCount,
        isMandatory: req.isMandatory,
        priorityWeight: req.priorityWeight,
        lastEvaluatedAt,
        status,
        reason,
        needsAssessment: isUnassessed,
      });
    }

    // Sort descending by priorityScore, then descending by gap
    return results.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      return b.gap - a.gap;
    });
  }
}
