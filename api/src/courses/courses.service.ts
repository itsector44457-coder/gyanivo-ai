import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SemanticMappingService } from './semantic-mapping.service';
import { ICourseProvider } from './providers/course-provider.interface';
import { IGOTCourseProvider } from './providers/igot-course.provider';
import { NSSTACourseProvider } from './providers/nssta-course.provider';
import { LocalDevelopmentCourseProvider } from './providers/local-dev-course.provider';
import {
  NormalizedCourseDto,
  ProviderCapabilities,
  CourseDifficulty,
  DifficultySource,
  MappingMethod,
  MappingStatus,
  ProviderStatus,
  SyncStatus,
} from './types/course.types';
import { GetCoursesQueryDto } from './dto/get-courses-query.dto';
import { UpdateCourseMappingDto } from './dto/update-mapping.dto';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);
  private readonly providers = new Map<string, ICourseProvider>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly semanticMapper: SemanticMappingService,
    igotProvider: IGOTCourseProvider,
    nsstaProvider: NSSTACourseProvider,
    localDevProvider: LocalDevelopmentCourseProvider,
  ) {
    this.registerProvider(igotProvider);
    this.registerProvider(nsstaProvider);
    this.registerProvider(localDevProvider);
  }

  private registerProvider(provider: ICourseProvider) {
    this.providers.set(provider.providerCode.toUpperCase(), provider);
  }

  /**
   * Returns registered provider instance by code.
   */
  getProvider(code: string): ICourseProvider | undefined {
    return this.providers.get(code.toUpperCase());
  }

  /**
   * Retrieves all provider statuses and capability matrices.
   */
  async getProvidersStatus(): Promise<
    Array<{
      id?: number;
      code: string;
      name: string;
      providerType: string;
      status: ProviderStatus;
      capabilities: ProviderCapabilities;
      courseCount: number;
      lastSyncAt: Date | null;
    }>
  > {
    const dbProviders = await this.prisma.courseProvider.findMany({
      include: {
        _count: { select: { courses: true } },
      },
    });

    const dbMap = new Map<string, any>();
    dbProviders.forEach((p) => dbMap.set(p.code.toUpperCase(), p));

    const results: Array<{
      id?: number;
      code: string;
      name: string;
      providerType: string;
      status: ProviderStatus;
      capabilities: ProviderCapabilities;
      courseCount: number;
      lastSyncAt: Date | null;
    }> = [];

    for (const [code, provider] of this.providers.entries()) {
      const dbRec = dbMap.get(code);
      const capabilities = provider.getCapabilities();

      results.push({
        id: dbRec?.id,
        code,
        name: dbRec?.name || provider.providerName,
        providerType: dbRec?.providerType || provider.providerType,
        status: (dbRec?.status as ProviderStatus) || ProviderStatus.ACTIVE,
        capabilities,
        courseCount: dbRec?._count?.courses || 0,
        lastSyncAt: dbRec?.lastSyncAt || null,
      });
    }

    return results;
  }

  /**
   * Idempotently syncs course catalog from a provider and generates automatic semantic mappings.
   */
  async syncProviderCatalog(providerCodeOrId: string | number): Promise<{
    success: boolean;
    providerCode: string;
    itemsFetched: number;
    itemsCreated: number;
    itemsUpdated: number;
    mappingsCreated: number;
    durationMs: number;
  }> {
    const startTime = Date.now();

    // Resolve provider entity
    let providerRecord;
    if (typeof providerCodeOrId === 'number' || !isNaN(Number(providerCodeOrId))) {
      providerRecord = await this.prisma.courseProvider.findUnique({
        where: { id: Number(providerCodeOrId) },
      });
    } else {
      providerRecord = await this.prisma.courseProvider.findUnique({
        where: { code: String(providerCodeOrId).toUpperCase() },
      });
    }

    let code = providerRecord?.code;
    if (!code && typeof providerCodeOrId === 'string') {
      code = providerCodeOrId.toUpperCase();
    }

    if (!code) {
      throw new NotFoundException(`Course provider '${providerCodeOrId}' not found`);
    }

    const providerInstance = this.getProvider(code);
    if (!providerInstance) {
      throw new BadRequestException(`No active provider implementation registered for code '${code}'`);
    }

    // Ensure CourseProvider record exists in PostgreSQL
    if (!providerRecord) {
      providerRecord = await this.prisma.courseProvider.upsert({
        where: { code },
        update: {
          name: providerInstance.providerName,
          providerType: providerInstance.providerType,
          status: ProviderStatus.ACTIVE,
          capabilities: providerInstance.getCapabilities() as any,
        },
        create: {
          code,
          name: providerInstance.providerName,
          providerType: providerInstance.providerType,
          status: ProviderStatus.ACTIVE,
          capabilities: providerInstance.getCapabilities() as any,
        },
      });
    }

    // Fetch raw catalog from provider
    const rawCourses = await providerInstance.fetchCatalog();
    let createdCount = 0;
    let updatedCount = 0;
    let mappingsCount = 0;

    // Load active competencies for semantic mapping
    const competencies = await this.prisma.competency.findMany({
      where: { isActive: true },
      include: { domain: true },
    });

    for (const raw of rawCourses) {
      // 1. Idempotently upsert course
      const existingCourse = await this.prisma.course.findUnique({
        where: {
          providerId_externalId: {
            providerId: providerRecord.id,
            externalId: raw.externalId,
          },
        },
      });

      let courseId: number;

      if (existingCourse) {
        const updated = await this.prisma.course.update({
          where: { id: existingCourse.id },
          data: {
            title: raw.title,
            description: raw.description || null,
            providerName: raw.providerName,
            durationMinutes: raw.durationMinutes,
            language: raw.language,
            difficultyLevel: raw.difficultyLevel,
            difficultySource: raw.difficultySource,
            courseUrl: raw.courseUrl || null,
            thumbnailUrl: raw.thumbnailUrl || null,
            learningOutcomes: raw.learningOutcomes || [],
            tags: raw.tags || [],
            prerequisitesText: raw.prerequisitesText || null,
            sourceUpdatedAt: raw.sourceUpdatedAt || null,
            lastSyncedAt: new Date(),
            isActive: true,
          },
        });
        courseId = updated.id;
        updatedCount++;
      } else {
        const created = await this.prisma.course.create({
          data: {
            providerId: providerRecord.id,
            externalId: raw.externalId,
            title: raw.title,
            description: raw.description || null,
            providerName: raw.providerName,
            durationMinutes: raw.durationMinutes,
            language: raw.language,
            difficultyLevel: raw.difficultyLevel,
            difficultySource: raw.difficultySource,
            courseUrl: raw.courseUrl || null,
            thumbnailUrl: raw.thumbnailUrl || null,
            learningOutcomes: raw.learningOutcomes || [],
            tags: raw.tags || [],
            prerequisitesText: raw.prerequisitesText || null,
            sourceUpdatedAt: raw.sourceUpdatedAt || null,
            lastSyncedAt: new Date(),
            isActive: true,
          },
        });
        courseId = created.id;
        createdCount++;
      }

      // 2. Automatic Semantic Competency Mapping
      const matches = await this.semanticMapper.mapCourseToCompetencies(
        {
          courseId,
          externalId: raw.externalId,
          title: raw.title,
          description: raw.description,
          learningOutcomes: raw.learningOutcomes,
          tags: raw.tags,
        },
        competencies,
      );

      for (const m of matches) {
        // Check if an existing human override exists (human review takes precedence)
        const existingMapping = await this.prisma.courseCompetency.findUnique({
          where: {
            courseId_competencyId: {
              courseId,
              competencyId: m.competencyId,
            },
          },
        });

        if (existingMapping && existingMapping.mappingMethod === MappingMethod.HUMAN_OVERRIDE) {
          // Preserve human decision
          continue;
        }

        await this.prisma.courseCompetency.upsert({
          where: {
            courseId_competencyId: {
              courseId,
              competencyId: m.competencyId,
            },
          },
          update: {
            relevanceScore: m.semanticSimilarity,
            mappingMethod: MappingMethod.SEMANTIC,
            mappingReliability: m.mappingReliability,
            evidence: m.evidence,
            status: m.mappingStatus,
          },
          create: {
            courseId,
            competencyId: m.competencyId,
            relevanceScore: m.semanticSimilarity,
            mappingMethod: MappingMethod.SEMANTIC,
            mappingReliability: m.mappingReliability,
            evidence: m.evidence,
            status: m.mappingStatus,
          },
        });

        mappingsCount++;
      }
    }

    const durationMs = Date.now() - startTime;

    // 3. Record CourseSyncRun audit entry
    await this.prisma.courseSyncRun.create({
      data: {
        providerId: providerRecord.id,
        completedAt: new Date(),
        status: SyncStatus.SUCCESS,
        itemsFetched: rawCourses.length,
        itemsCreated: createdCount,
        itemsUpdated: updatedCount,
        itemsFailed: 0,
        errorSummary: null,
      },
    });

    await this.prisma.courseProvider.update({
      where: { id: providerRecord.id },
      data: { lastSyncAt: new Date() },
    });

    this.logger.log(
      `Catalog sync complete for ${code}: ${rawCourses.length} fetched, ${createdCount} created, ${updatedCount} updated, ${mappingsCount} mapped in ${durationMs}ms`,
    );

    return {
      success: true,
      providerCode: code,
      itemsFetched: rawCourses.length,
      itemsCreated: createdCount,
      itemsUpdated: updatedCount,
      mappingsCreated: mappingsCount,
      durationMs,
    };
  }

  /**
   * Retrieves paginated, filterable normalized course records.
   */
  async getCourses(query: GetCoursesQueryDto): Promise<{
    items: NormalizedCourseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { title: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
        { externalId: { contains: s, mode: 'insensitive' } },
      ];
    }

    if (query.providerCode) {
      where.provider = { code: query.providerCode.toUpperCase() };
    }

    if (query.difficulty) {
      where.difficultyLevel = query.difficulty;
    }

    if (query.competencyCode || query.competencyId) {
      where.competencyMappings = {
        some: {
          competency: {
            ...(query.competencyCode ? { code: query.competencyCode } : {}),
            ...(query.competencyId ? { id: query.competencyId } : {}),
          },
          ...(query.mappingStatus ? { status: query.mappingStatus } : { status: MappingStatus.APPROVED }),
        },
      };
    }

    const [total, courses] = await Promise.all([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        include: {
          provider: true,
          competencyMappings: {
            include: {
              competency: {
                include: { domain: true },
              },
            },
          },
        },
        orderBy: { title: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    const items: NormalizedCourseDto[] = courses.map((c) => ({
      id: c.id,
      providerId: c.providerId,
      providerCode: c.provider.code,
      providerName: c.providerName || c.provider.name,
      externalId: c.externalId,
      title: c.title,
      description: c.description,
      durationMinutes: c.durationMinutes,
      language: c.language,
      difficultyLevel: c.difficultyLevel as CourseDifficulty,
      difficultySource: c.difficultySource as DifficultySource,
      courseUrl: c.courseUrl,
      thumbnailUrl: c.thumbnailUrl,
      learningOutcomes: (c.learningOutcomes as string[]) || [],
      tags: (c.tags as string[]) || [],
      prerequisitesText: c.prerequisitesText,
      isActive: c.isActive,
      lastSyncedAt: c.lastSyncedAt,
      competencyMappings: c.competencyMappings.map((cm) => ({
        competencyId: cm.competencyId,
        competencyCode: cm.competency.code,
        competencyName: cm.competency.name,
        domainName: cm.competency.domain.name,
        relevanceScore: cm.relevanceScore,
        mappingMethod: cm.mappingMethod as MappingMethod,
        mappingReliability: cm.mappingReliability,
        status: cm.status as MappingStatus,
        evidence: cm.evidence,
      })),
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Retrieves single course with full competency mappings and prerequisites.
   */
  async getCourseById(id: number): Promise<NormalizedCourseDto> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        provider: true,
        competencyMappings: {
          include: {
            competency: {
              include: { domain: true },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with id ${id} not found`);
    }

    return {
      id: course.id,
      providerId: course.providerId,
      providerCode: course.provider.code,
      providerName: course.providerName || course.provider.name,
      externalId: course.externalId,
      title: course.title,
      description: course.description,
      durationMinutes: course.durationMinutes,
      language: course.language,
      difficultyLevel: course.difficultyLevel as CourseDifficulty,
      difficultySource: course.difficultySource as DifficultySource,
      courseUrl: course.courseUrl,
      thumbnailUrl: course.thumbnailUrl,
      learningOutcomes: (course.learningOutcomes as string[]) || [],
      tags: (course.tags as string[]) || [],
      prerequisitesText: course.prerequisitesText,
      isActive: course.isActive,
      lastSyncedAt: course.lastSyncedAt,
      competencyMappings: course.competencyMappings.map((cm) => ({
        competencyId: cm.competencyId,
        competencyCode: cm.competency.code,
        competencyName: cm.competency.name,
        domainName: cm.competency.domain.name,
        relevanceScore: cm.relevanceScore,
        mappingMethod: cm.mappingMethod as MappingMethod,
        mappingReliability: cm.mappingReliability,
        status: cm.status as MappingStatus,
        evidence: cm.evidence,
      })),
    };
  }

  /**
   * Admin: List all course competency mappings for review and auditing.
   */
  async getCourseMappings(query?: {
    status?: MappingStatus;
    competencyId?: number;
    providerCode?: string;
  }) {
    const where: any = {};

    if (query?.status) {
      where.status = query.status;
    }
    if (query?.competencyId) {
      where.competencyId = query.competencyId;
    }
    if (query?.providerCode) {
      where.course = {
        provider: { code: query.providerCode.toUpperCase() },
      };
    }

    const mappings = await this.prisma.courseCompetency.findMany({
      where,
      include: {
        course: {
          include: { provider: true },
        },
        competency: {
          include: { domain: true },
        },
        approvedByUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: [{ status: 'asc' }, { relevanceScore: 'desc' }],
    });

    return mappings.map((m) => ({
      id: m.id,
      courseId: m.courseId,
      courseTitle: m.course.title,
      courseExternalId: m.course.externalId,
      providerCode: m.course.provider.code,
      providerName: m.course.provider.name,
      difficultyLevel: m.course.difficultyLevel,
      competencyId: m.competencyId,
      competencyCode: m.competency.code,
      competencyName: m.competency.name,
      domainName: m.competency.domain.name,
      relevanceScore: m.relevanceScore,
      mappingMethod: m.mappingMethod,
      mappingReliability: m.mappingReliability,
      evidence: m.evidence,
      status: m.status,
      approvedByUser: m.approvedByUser
        ? `${m.approvedByUser.firstName} ${m.approvedByUser.lastName}`
        : null,
      approvedAt: m.approvedAt,
    }));
  }

  /**
   * Admin: Human-in-the-loop approval, rejection, or manual competency override.
   */
  async updateCourseMapping(
    mappingId: number,
    dto: UpdateCourseMappingDto,
    userId: number,
  ) {
    const mapping = await this.prisma.courseCompetency.findUnique({
      where: { id: mappingId },
      include: { course: true, competency: true },
    });

    if (!mapping) {
      throw new NotFoundException(`Course mapping with id ${mappingId} not found`);
    }

    const updateData: any = {
      approvedByUserId: userId,
      approvedAt: new Date(),
    };

    if (dto.status) {
      updateData.status = dto.status;
    }

    if (dto.relevanceScore !== undefined) {
      updateData.relevanceScore = dto.relevanceScore;
    }

    if (dto.overrideCompetencyId && dto.overrideCompetencyId !== mapping.competencyId) {
      // Validate new competency exists
      const targetComp = await this.prisma.competency.findUnique({
        where: { id: dto.overrideCompetencyId },
      });
      if (!targetComp) {
        throw new NotFoundException(`Target competency ${dto.overrideCompetencyId} not found`);
      }

      updateData.competencyId = dto.overrideCompetencyId;
      updateData.mappingMethod = MappingMethod.HUMAN_OVERRIDE;
      updateData.mappingReliability = 1.0;
      updateData.evidence = `Manual administrative override by cadre reviewer. ${dto.notes || ''}`.trim();
      updateData.status = MappingStatus.APPROVED;
    } else if (dto.status === MappingStatus.APPROVED) {
      updateData.mappingMethod = mapping.mappingMethod;
      updateData.evidence = `${mapping.evidence || ''} (Approved by Admin)`.trim();
    } else if (dto.status === MappingStatus.REJECTED) {
      updateData.evidence = `Rejected by Administrator: ${dto.notes || 'Irrelevant course content.'}`.trim();
    }

    const updated = await this.prisma.courseCompetency.update({
      where: { id: mappingId },
      data: updateData,
      include: {
        course: true,
        competency: { include: { domain: true } },
      },
    });

    return {
      success: true,
      mapping: {
        id: updated.id,
        courseTitle: updated.course.title,
        competencyCode: updated.competency.code,
        competencyName: updated.competency.name,
        status: updated.status,
        mappingMethod: updated.mappingMethod,
        relevanceScore: updated.relevanceScore,
        evidence: updated.evidence,
        approvedAt: updated.approvedAt,
      },
    };
  }
}
