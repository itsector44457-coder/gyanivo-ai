import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CourseDifficulty, MappingStatus } from '../generated/prisma/client';
import { CourseRecommendationDto } from './types/recommendation.types';

@Injectable()
export class RecommendationEngineService {
  private readonly logger = new Logger(RecommendationEngineService.name);

  // Centralized explainable scoring weights (sum of positive weights = 1.0)
  private readonly WEIGHT_COMPETENCY_RELEVANCE = 0.35;
  private readonly WEIGHT_GAP_PRIORITY = 0.25;
  private readonly WEIGHT_LEVEL_FIT = 0.20;
  private readonly WEIGHT_MANDATORY_ROLE = 0.20;

  // Penalties
  private readonly PENALTY_ALREADY_COMPLETED = 0.45;
  private readonly PENALTY_UNMET_PREREQUISITE = 0.40;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to retrieve employee profile and role competency requirements.
   */
  private async getEmployeeProfile(userId: number) {
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        department: true,
        jobRole: {
          include: {
            requirements: {
              include: {
                competency: {
                  include: { domain: true },
                },
              },
            },
          },
        },
        competencies: true,
        enrollments: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Employee profile not found');
    }

    return profile;
  }

  /**
   * Calculates Level Fit score (0.0 - 1.0) comparing employee's current score
   * with the course difficulty level.
   */
  calculateLevelFit(currentScore: number | null, difficulty: CourseDifficulty): number {
    const score = currentScore !== null ? currentScore : 40; // Default prior

    if (score < 35) {
      // Novice / High Gap: Needs foundational or beginner courses
      switch (difficulty) {
        case CourseDifficulty.FOUNDATIONAL:
          return 1.0;
        case CourseDifficulty.BEGINNER:
          return 0.95;
        case CourseDifficulty.INTERMEDIATE:
          return 0.40;
        case CourseDifficulty.ADVANCED:
          return 0.10;
      }
    } else if (score <= 70) {
      // Intermediate practitioner: Best fit is Intermediate, then Advanced / Beginner
      switch (difficulty) {
        case CourseDifficulty.INTERMEDIATE:
          return 1.0;
        case CourseDifficulty.ADVANCED:
          return 0.75;
        case CourseDifficulty.BEGINNER:
          return 0.60;
        case CourseDifficulty.FOUNDATIONAL:
          return 0.30;
      }
    } else {
      // Proficient / Master: Needs Advanced specialization
      switch (difficulty) {
        case CourseDifficulty.ADVANCED:
          return 1.0;
        case CourseDifficulty.INTERMEDIATE:
          return 0.80;
        case CourseDifficulty.BEGINNER:
          return 0.20;
        case CourseDifficulty.FOUNDATIONAL:
          return 0.05;
      }
    }
  }

  /**
   * Generates explainable recommendations based on the employee's real skill gaps.
   */
  async getRecommendationsForEmployee(
    userId: number,
    options?: {
      competencyId?: number;
      limit?: number;
    },
  ): Promise<CourseRecommendationDto[]> {
    const profile = await this.getEmployeeProfile(userId);
    const requirements = profile.jobRole?.requirements || [];
    const limit = options?.limit || 10;

    const empCompMap = new Map<number, any>();
    profile.competencies.forEach((ec) => empCompMap.set(ec.competencyId, ec));

    const completedCourseIds = new Set<number>(
      profile.enrollments
        .filter((e) => e.status === 'COMPLETED')
        .map((e) => e.courseId),
    );

    const enrolledCourseIds = new Set<number>(
      profile.enrollments.map((e) => e.courseId),
    );

    // Identify active skill gaps
    const gapItems: Array<{
      competencyId: number;
      competencyCode: string;
      competencyName: string;
      domainName: string;
      requiredScore: number;
      currentScore: number | null;
      gap: number;
      priorityWeight: number;
      isMandatory: boolean;
    }> = [];

    for (const req of requirements) {
      if (options?.competencyId && req.competencyId !== options.competencyId) {
        continue;
      }

      const ec = empCompMap.get(req.competencyId);
      const currentScore = ec && ec.currentScore !== null ? ec.currentScore : null;
      const gap = currentScore !== null ? Math.max(0, req.requiredScore - currentScore) : req.requiredScore;

      // Include all required competencies, with priority for positive gaps
      gapItems.push({
        competencyId: req.competencyId,
        competencyCode: req.competency.code,
        competencyName: req.competency.name,
        domainName: req.competency.domain.name,
        requiredScore: req.requiredScore,
        currentScore,
        gap,
        priorityWeight: req.priorityWeight || 1.0,
        isMandatory: req.isMandatory,
      });
    }

    if (gapItems.length === 0) {
      return [];
    }

    // Load candidate courses mapped to these competencies
    const compIds = gapItems.map((g) => g.competencyId);
    const candidateMappings = await this.prisma.courseCompetency.findMany({
      where: {
        competencyId: { in: compIds },
        status: MappingStatus.APPROVED,
        course: { isActive: true },
      },
      include: {
        course: {
          include: {
            provider: true,
            prerequisites: true,
          },
        },
        competency: {
          include: { domain: true },
        },
      },
    });

    const gapMap = new Map<number, (typeof gapItems)[0]>();
    gapItems.forEach((g) => gapMap.set(g.competencyId, g));

    const scoredRecommendations: Array<{
      score: number;
      levelFit: number;
      reasons: string[];
      mapping: (typeof candidateMappings)[0];
      gapInfo: (typeof gapItems)[0];
    }> = [];

    for (const mapping of candidateMappings) {
      const gapInfo = gapMap.get(mapping.competencyId)!;
      const course = mapping.course;

      // 1. Competency Relevance Component (0 - 1)
      const compRelevance = mapping.relevanceScore;

      // 2. Normalized Gap Priority Component (0 - 1)
      const normalizedGap = Math.min(1.0, (gapInfo.gap / 50) * gapInfo.priorityWeight);

      // 3. Difficulty Level Fit (0 - 1)
      const levelFit = this.calculateLevelFit(
        gapInfo.currentScore,
        course.difficultyLevel as CourseDifficulty,
      );

      // 4. Role Mandate (1.0 for mandatory, 0.5 for optional)
      const roleMandate = gapInfo.isMandatory ? 1.0 : 0.5;

      // Positive weighted sum
      let rawScore =
        this.WEIGHT_COMPETENCY_RELEVANCE * compRelevance +
        this.WEIGHT_GAP_PRIORITY * normalizedGap +
        this.WEIGHT_LEVEL_FIT * levelFit +
        this.WEIGHT_MANDATORY_ROLE * roleMandate;

      // Penalties & Modifiers
      const isCompleted = completedCourseIds.has(course.id);
      if (isCompleted) {
        rawScore -= this.PENALTY_ALREADY_COMPLETED;
      }

      // Check prerequisites
      let hasUnmetPrereq = false;
      if (course.prerequisites && course.prerequisites.length > 0) {
        for (const prereq of course.prerequisites) {
          if (prereq.prerequisiteCourseId && !completedCourseIds.has(prereq.prerequisiteCourseId)) {
            hasUnmetPrereq = true;
          }
          if (prereq.prerequisiteCompetencyId && prereq.minimumCompetencyScore) {
            const userScore = empCompMap.get(prereq.prerequisiteCompetencyId)?.currentScore || 0;
            if (userScore < prereq.minimumCompetencyScore) {
              hasUnmetPrereq = true;
            }
          }
        }
      }

      if (hasUnmetPrereq) {
        rawScore -= this.PENALTY_UNMET_PREREQUISITE;
      }

      const finalScore = Math.min(0.99, Math.max(0.05, Math.round(rawScore * 100) / 100));

      // Generate explainable decision reasons
      const reasons: string[] = [];

      if (gapInfo.gap > 0) {
        reasons.push(
          `Addresses a ${Math.round(gapInfo.gap)} pt skill gap in ${gapInfo.competencyName} (Current: ${gapInfo.currentScore ?? 'Unassessed'}%, Target: ${gapInfo.requiredScore}%).`,
        );
      } else {
        reasons.push(`Maintains role proficiency for ${gapInfo.competencyName}.`);
      }

      if (gapInfo.isMandatory) {
        reasons.push(`${gapInfo.competencyName} is a mandatory requirement for your job role.`);
      }

      if (compRelevance >= 0.70) {
        reasons.push(`High syllabus alignment (${Math.round(compRelevance * 100)}% match) verified by semantic intelligence.`);
      }

      if (levelFit >= 0.85) {
        reasons.push(`Ideal difficulty level (${course.difficultyLevel}) tailored to your current competency level.`);
      } else if (levelFit <= 0.40) {
        reasons.push(`Advanced content — recommended after completing foundational preparation.`);
      }

      if (isCompleted) {
        reasons.push(`Course previously completed — available for refresher review.`);
      }

      scoredRecommendations.push({
        score: finalScore,
        levelFit,
        reasons,
        mapping,
        gapInfo,
      });
    }

    // Sort descending by explainable composite score
    scoredRecommendations.sort((a, b) => b.score - a.score);
    const topScored = scoredRecommendations.slice(0, limit);

    // Build DTOs and log recommendation events
    const results: CourseRecommendationDto[] = [];

    for (let i = 0; i < topScored.length; i++) {
      const item = topScored[i];
      const course = item.mapping.course;
      const rank = i + 1;

      // Asynchronously log recommendation event to database for future ML training
      this.prisma.courseRecommendation
        .create({
          data: {
            employeeProfileId: profile.id,
            courseId: course.id,
            competencyId: item.gapInfo.competencyId,
            recommendationScore: item.score,
            rankingPosition: rank,
            reasons: item.reasons as any,
            preCompetencyScore: item.gapInfo.currentScore,
          },
        })
        .catch((err) => {
          this.logger.warn(`Failed to log recommendation event: ${err.message}`);
        });

      results.push({
        courseId: course.id,
        externalId: course.externalId,
        title: course.title,
        description: course.description,
        providerCode: course.provider.code,
        providerName: course.providerName || course.provider.name,
        durationMinutes: course.durationMinutes,
        difficultyLevel: course.difficultyLevel as CourseDifficulty,
        courseUrl: course.courseUrl,
        thumbnailUrl: course.thumbnailUrl,
        tags: (course.tags as string[]) || [],
        competencyId: item.gapInfo.competencyId,
        competencyCode: item.gapInfo.competencyCode,
        competencyName: item.gapInfo.competencyName,
        domainName: item.gapInfo.domainName,
        currentCompetencyScore: item.gapInfo.currentScore,
        requiredScore: item.gapInfo.requiredScore,
        skillGap: item.gapInfo.gap,
        isMandatory: item.gapInfo.isMandatory,
        recommendationScore: item.score,
        rankingPosition: rank,
        levelFitScore: Math.round(item.levelFit * 100),
        reasons: item.reasons,
        isEnrolled: enrolledCourseIds.has(course.id),
        isCompleted: completedCourseIds.has(course.id),
      });
    }

    return results;
  }
}
