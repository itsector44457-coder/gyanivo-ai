import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecommendationEngineService } from './recommendation-engine.service';
import {
  PersonalizedLearningPathDto,
  LearningPathMilestone,
} from './types/recommendation.types';
import { CourseDifficulty } from '../generated/prisma/client';

@Injectable()
export class LearningPathService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recommendationEngine: RecommendationEngineService,
  ) {}

  /**
   * Generates a multi-stage personalized learning roadmap interleaving priority gaps.
   */
  async generateLearningPath(userId: number): Promise<PersonalizedLearningPathDto> {
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { userId },
      include: {
        user: true,
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
      },
    });

    if (!profile) {
      throw new NotFoundException('Employee profile not found');
    }

    const recommendations = await this.recommendationEngine.getRecommendationsForEmployee(
      userId,
      { limit: 20 },
    );

    // Group recommendations by competency
    const compRecs = new Map<number, typeof recommendations>();
    for (const rec of recommendations) {
      if (!compRecs.has(rec.competencyId)) {
        compRecs.set(rec.competencyId, []);
      }
      compRecs.get(rec.competencyId)!.push(rec);
    }

    // Sort competencies by largest skill gap / priority
    const sortedCompEntries = Array.from(compRecs.entries()).sort((a, b) => {
      const gapA = a[1][0]?.skillGap || 0;
      const gapB = b[1][0]?.skillGap || 0;
      return gapB - gapA;
    });

    const milestones: LearningPathMilestone[] = [];
    let stepCount = 1;
    let totalMinutes = 0;
    let primaryFocus = 'General Professional Competencies';

    if (sortedCompEntries.length > 0) {
      primaryFocus = sortedCompEntries[0][1][0]?.competencyName || primaryFocus;
    }

    // Interleave courses across priority gaps: Foundation -> Intermediate/Advanced -> Reassessment
    for (const [compId, recs] of sortedCompEntries) {
      const topGap = recs[0];
      if (!topGap) continue;

      // Sort courses by difficulty order: FOUNDATIONAL -> BEGINNER -> INTERMEDIATE -> ADVANCED
      const difficultyOrder: Record<CourseDifficulty, number> = {
        [CourseDifficulty.FOUNDATIONAL]: 1,
        [CourseDifficulty.BEGINNER]: 2,
        [CourseDifficulty.INTERMEDIATE]: 3,
        [CourseDifficulty.ADVANCED]: 4,
      };

      const sortedByLevel = [...recs].sort(
        (a, b) => difficultyOrder[a.difficultyLevel] - difficultyOrder[b.difficultyLevel],
      );

      // Add up to 2 progressive courses for this competency
      const selectedCourses = sortedByLevel.slice(0, 2);

      for (const c of selectedCourses) {
        milestones.push({
          stepNumber: stepCount++,
          type: 'COURSE',
          title: c.title,
          description: `Targeted training module for ${c.competencyName}. ${c.reasons[0] || ''}`,
          competencyCode: c.competencyCode,
          competencyName: c.competencyName,
          difficultyLevel: c.difficultyLevel,
          durationMinutes: c.durationMinutes,
          courseId: c.courseId,
          courseUrl: c.courseUrl,
          providerName: c.providerName,
          estimatedScoreGain: c.difficultyLevel === CourseDifficulty.ADVANCED ? 15 : 10,
          targetCompetencyScore: c.requiredScore,
          isCompleted: c.isCompleted,
        });

        totalMinutes += c.durationMinutes;
      }

      // Add diagnostic re-assessment milestone checkpoint after course completion
      milestones.push({
        stepNumber: stepCount++,
        type: 'REASSESSMENT',
        title: `Adaptive Diagnostic Re-Assessment: ${topGap.competencyName}`,
        description: `Verify mastery progression and calibrate updated score in ${topGap.competencyName} against the ${topGap.requiredScore}% role requirement.`,
        competencyCode: topGap.competencyCode,
        competencyName: topGap.competencyName,
        durationMinutes: 15,
        targetCompetencyScore: topGap.requiredScore,
      });

      totalMinutes += 15;
    }

    // Final Goal Milestone
    if (milestones.length > 0) {
      milestones.push({
        stepNumber: stepCount++,
        type: 'GOAL',
        title: `Role Competency Benchmark Achieved (${profile.jobRole?.name || 'Statistical Cadre'})`,
        description: `All identified skill gap deficits resolved. Eligible for advanced operational statistical deployments and cadre progression.`,
        competencyCode: 'ROLE_BENCHMARK',
        competencyName: profile.jobRole?.name || 'Enterprise Cadre Standard',
        targetCompetencyScore: 100,
      });
    }

    return {
      employeeId: profile.id,
      employeeName: `${profile.user.firstName} ${profile.user.lastName}`,
      jobRole: profile.jobRole?.name || 'Statistical Officer',
      totalGapsIdentified: sortedCompEntries.length,
      primaryFocusCompetency: primaryFocus,
      estimatedTotalHours: Math.round((totalMinutes / 60) * 10) / 10,
      milestones,
    };
  }
}
