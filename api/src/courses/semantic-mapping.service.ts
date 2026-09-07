import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  MappingMethod,
  MappingStatus,
} from './types/course.types';

export interface SemanticCompetencyMatch {
  competencyId: number;
  competencyCode: string;
  competencyName: string;
  domain: string;
  semanticSimilarity: number;
  mappingReliability: number;
  mappingStatus: MappingStatus;
  evidence: string;
}

@Injectable()
export class SemanticMappingService {
  private readonly logger = new Logger(SemanticMappingService.name);
  private readonly mlServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.mlServiceUrl =
      this.configService.get<string>('ML_SERVICE_URL') ||
      'http://localhost:8000';
  }

  /**
   * Calls the FastAPI Semantic Mapping service to compute cosine similarity between
   * course text and the enterprise competency framework.
   */
  async mapCourseToCompetencies(
    course: {
      courseId?: number;
      externalId?: string;
      title: string;
      description?: string;
      learningOutcomes?: string[];
      tags?: string[];
    },
    competencies: Array<{
      id: number;
      code: string;
      name: string;
      description?: string | null;
      domain?: { name: string } | null;
    }>,
  ): Promise<SemanticCompetencyMatch[]> {
    if (competencies.length === 0) return [];

    const compPayload = competencies.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      description: c.description || undefined,
      domain: c.domain?.name || undefined,
    }));

    try {
      const response = await axios.post(
        `${this.mlServiceUrl}/courses/map-competencies`,
        {
          course: {
            courseId: course.courseId,
            externalId: course.externalId,
            title: course.title,
            description: course.description,
            learningOutcomes: course.learningOutcomes || [],
            tags: course.tags || [],
          },
          competencies: compPayload,
          minSimilarityThreshold: 0.35,
          topK: 3,
        },
        { timeout: 5000 },
      );

      if (response.data && Array.isArray(response.data.topMatches)) {
        return response.data.topMatches.map((m: any) => ({
          competencyId: m.competencyId,
          competencyCode: m.competencyCode,
          competencyName: m.competencyName,
          domain: m.domain,
          semanticSimilarity: m.semanticSimilarity,
          mappingReliability: m.mappingReliability,
          mappingStatus:
            m.mappingStatus === 'APPROVED'
              ? MappingStatus.APPROVED
              : m.mappingStatus === 'PENDING_REVIEW'
              ? MappingStatus.PENDING_REVIEW
              : MappingStatus.REJECTED,
          evidence: m.evidence,
        }));
      }
    } catch (error) {
      this.logger.warn(
        `ML Service semantic mapping unavailable, using local deterministic fallback: ${
          error instanceof Error ? error.message : error
        }`,
      );
    }

    // Local deterministic keyword / Jaccard token fallback
    return this.calculateLocalTokenFallback(course, competencies);
  }

  private calculateLocalTokenFallback(
    course: {
      title: string;
      description?: string;
      learningOutcomes?: string[];
      tags?: string[];
    },
    competencies: Array<{
      id: number;
      code: string;
      name: string;
      description?: string | null;
      domain?: { name: string } | null;
    }>,
  ): SemanticCompetencyMatch[] {
    const courseText = [
      course.title,
      course.description || '',
      ...(course.learningOutcomes || []),
      ...(course.tags || []),
    ]
      .join(' ')
      .toLowerCase();

    const courseTokens = new Set(
      courseText
        .replace(/[^a-z0-9_]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 2),
    );

    const matches: SemanticCompetencyMatch[] = [];

    for (const comp of competencies) {
      const compText = [
        comp.name,
        comp.code,
        comp.description || '',
        comp.domain?.name || '',
      ]
        .join(' ')
        .toLowerCase();

      const compTokens = new Set(
        compText
          .replace(/[^a-z0-9_]/g, ' ')
          .split(/\s+/)
          .filter((t) => t.length > 2),
      );

      let intersection = 0;
      for (const t of compTokens) {
        if (courseTokens.has(t)) intersection++;
      }

      const union = new Set([...courseTokens, ...compTokens]).size;
      const jaccard = union > 0 ? intersection / union : 0;
      
      // Token overlap score scaled to similarity range
      const sim = Math.min(0.95, Math.round(jaccard * 4.5 * 100) / 100);

      if (sim >= 0.35) {
        const status =
          sim >= 0.65
            ? MappingStatus.APPROVED
            : MappingStatus.PENDING_REVIEW;

        matches.push({
          competencyId: comp.id,
          competencyCode: comp.code,
          competencyName: comp.name,
          domain: comp.domain?.name || 'General',
          semanticSimilarity: sim,
          mappingReliability: Math.round(sim * 0.9 * 100) / 100,
          mappingStatus: status,
          evidence: `Local token overlap similarity (${Math.round(sim * 100)}%). Matches key terms in competency syllabus.`,
        });
      }
    }

    return matches.sort((a, b) => b.semanticSimilarity - a.semanticSimilarity).slice(0, 3);
  }
}
