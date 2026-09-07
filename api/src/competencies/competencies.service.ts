import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompetencyEngineService } from './competency-engine.service';
import {
  CompetencyEvaluationResult,
  EmployeeDashboardSummary,
  GapSeverity,
  CompetencyStatus,
} from './types/competency-engine.types';
import { UpdateRoleCompetenciesDto } from './dto/update-role-requirement.dto';

@Injectable()
export class CompetenciesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: CompetencyEngineService,
  ) {}

  /**
   * Fetches raw evaluation context for the authenticated employee.
   */
  private async getEmployeeEvaluationContext(userId: number) {
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { userId },
      include: {
        department: true,
        jobRole: {
          include: {
            requirements: {
              include: {
                competency: {
                  include: {
                    domain: true,
                  },
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

    const roleName = profile.jobRole?.name || 'Statistical Officer';
    const requirements = profile.jobRole?.requirements || [];
    const employeeCompetencies = profile.competencies || [];

    const evaluations = this.engine.evaluateCompetencies(
      requirements,
      employeeCompetencies,
      roleName,
    );

    const overallScore = this.engine.calculateOverallScore(evaluations);

    return {
      profile,
      roleName,
      evaluations,
      overallScore,
    };
  }

  /**
   * GET /employees/me/competencies
   */
  async getMyCompetencies(userId: number) {
    const { profile, roleName, evaluations, overallScore } =
      await this.getEmployeeEvaluationContext(userId);

    return {
      success: true,
      data: {
        employee: {
          id: profile.id,
          employeeCode: profile.employeeCode,
          designation: profile.designation,
          department: profile.department?.name,
          jobRole: roleName,
        },
        overallScore,
        totalRequired: evaluations.length,
        metRequirements: evaluations.filter(
          (e) => e.gap === 0 && e.status !== CompetencyStatus.NOT_ASSESSED,
        ).length,
        belowRequirements: evaluations.filter(
          (e) => e.gap > 0 || e.status === CompetencyStatus.NOT_ASSESSED,
        ).length,
        competencies: evaluations,
      },
    };
  }

  /**
   * GET /employees/me/skill-gaps
   */
  async getMySkillGaps(userId: number, includeSatisfied = false) {
    const { profile, roleName, evaluations, overallScore } =
      await this.getEmployeeEvaluationContext(userId);

    const filtered = includeSatisfied
      ? evaluations
      : evaluations.filter(
          (e) => e.gap > 0 || e.status === CompetencyStatus.NOT_ASSESSED,
        );

    return {
      success: true,
      data: {
        employee: {
          id: profile.id,
          jobRole: roleName,
        },
        overallScore,
        totalGapsCount: filtered.length,
        criticalGapsCount: filtered.filter(
          (e) => e.severity === GapSeverity.CRITICAL,
        ).length,
        highGapsCount: filtered.filter((e) => e.severity === GapSeverity.HIGH)
          .length,
        gaps: filtered,
      },
    };
  }

  /**
   * GET /employees/me/dashboard
   */
  async getMyDashboard(userId: number): Promise<{ success: boolean; data: EmployeeDashboardSummary }> {
    const { profile, evaluations, overallScore } =
      await this.getEmployeeEvaluationContext(userId);

    const topGaps = evaluations
      .filter((e) => e.gap > 0 || e.status === CompetencyStatus.NOT_ASSESSED)
      .slice(0, 4);

    const history = await this.prisma.competencyHistory.findMany({
      where: { employeeProfileId: profile.id },
      include: { competency: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentHistory = history.map((h) => ({
      id: h.id,
      competencyName: h.competency.name,
      competencyCode: h.competency.code,
      previousScore: h.previousScore,
      newScore: h.newScore,
      changeReason: h.changeReason,
      sourceType: h.sourceType,
      createdAt: h.createdAt,
    }));

    const totalRequired = evaluations.length;
    const met = evaluations.filter(
      (e) => e.gap === 0 && e.status !== CompetencyStatus.NOT_ASSESSED,
    ).length;
    const unassessed = evaluations.filter(
      (e) => e.status === CompetencyStatus.NOT_ASSESSED,
    ).length;

    return {
      success: true,
      data: {
        overallScore,
        totalRequiredCompetencies: totalRequired,
        competenciesMeetingTarget: met,
        competenciesBelowTarget: totalRequired - met,
        unassessedCompetencies: unassessed,
        criticalGapsCount: evaluations.filter(
          (e) => e.severity === GapSeverity.CRITICAL,
        ).length,
        highGapsCount: evaluations.filter(
          (e) => e.severity === GapSeverity.HIGH,
        ).length,
        topPriorityGaps: topGaps,
        recentHistory,
      },
    };
  }

  /**
   * GET /employees/me/competencies/:id/history
   */
  async getCompetencyHistory(userId: number, competencyId: number) {
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Employee profile not found');
    }

    const history = await this.prisma.competencyHistory.findMany({
      where: {
        employeeProfileId: profile.id,
        competencyId,
      },
      include: {
        competency: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      history,
    };
  }

  /**
   * GET /competencies (Catalog)
   */
  async getCompetenciesCatalog(domainCode?: string, search?: string) {
    const where: any = { isActive: true };

    if (domainCode) {
      where.domain = { code: domainCode };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const competencies = await this.prisma.competency.findMany({
      where,
      include: {
        domain: true,
      },
      orderBy: [{ domainId: 'asc' }, { name: 'asc' }],
    });

    const domains = await this.prisma.competencyDomain.findMany({
      include: {
        _count: {
          select: { competencies: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      success: true,
      domains,
      competencies,
    };
  }

  /**
   * GET /competencies/:id
   */
  async getCompetencyById(id: number) {
    const competency = await this.prisma.competency.findUnique({
      where: { id },
      include: {
        domain: true,
        parentCompetency: true,
        childCompetencies: true,
      },
    });

    if (!competency) {
      throw new NotFoundException(`Competency with id ${id} not found`);
    }

    return {
      success: true,
      competency,
    };
  }

  /**
   * GET /admin/job-roles
   */
  async getJobRoles() {
    const roles = await this.prisma.jobRole.findMany({
      where: { isActive: true },
      include: {
        department: true,
        _count: {
          select: { requirements: true, employees: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      success: true,
      roles,
    };
  }

  /**
   * GET /admin/job-roles/:id/competencies
   */
  async getJobRoleCompetencies(jobRoleId: number) {
    const role = await this.prisma.jobRole.findUnique({
      where: { id: jobRoleId },
      include: {
        department: true,
        requirements: {
          include: {
            competency: {
              include: {
                domain: true,
              },
            },
          },
          orderBy: { requiredScore: 'desc' },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Job role with id ${jobRoleId} not found`);
    }

    return {
      success: true,
      role,
    };
  }

  /**
   * PUT /admin/job-roles/:id/competencies
   * Persists updated role requirements into PostgreSQL.
   */
  async updateJobRoleCompetencies(
    jobRoleId: number,
    dto: UpdateRoleCompetenciesDto,
  ) {
    const role = await this.prisma.jobRole.findUnique({
      where: { id: jobRoleId },
    });

    if (!role) {
      throw new NotFoundException(`Job role with id ${jobRoleId} not found`);
    }

    if (!dto.requirements || !Array.isArray(dto.requirements)) {
      throw new BadRequestException('Requirements array is required');
    }

    // Process all updates in an atomic transaction
    await this.prisma.$transaction(async (tx) => {
      // Delete existing requirements for this role
      await tx.roleCompetencyRequirement.deleteMany({
        where: { jobRoleId },
      });

      // Insert new requirements
      if (dto.requirements.length > 0) {
        await tx.roleCompetencyRequirement.createMany({
          data: dto.requirements.map((r) => ({
            jobRoleId,
            competencyId: r.competencyId,
            requiredScore: r.requiredScore,
            priorityWeight: r.priorityWeight ?? 1.0,
            isMandatory: r.isMandatory ?? true,
            minimumScore: r.minimumScore,
            sourceReference: r.sourceReference ?? 'MoSPI Admin Matrix 2026',
            approvedAt: new Date(),
          })),
        });
      }
    });

    return this.getJobRoleCompetencies(jobRoleId);
  }
}
