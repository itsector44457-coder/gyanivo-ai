import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

import { CoursesService } from './courses.service';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { SystemRole } from '../generated/prisma/client';

import { GetCoursesQueryDto } from './dto/get-courses-query.dto';
import { UpdateCourseMappingDto } from './dto/update-mapping.dto';

import { MappingStatus } from './types/course.types';

@Controller()
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
  ) { }

  /* =========================================================
     PUBLIC COURSE CATALOG
  ========================================================= */

  /**
   * GET /courses
   *
   * Public course catalog search & filtering.
   */
  @Public()
  @Get('courses')
  async getCourses(
    @Query() query: GetCoursesQueryDto,
  ) {
    const result =
      await this.coursesService.getCourses(
        query,
      );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * GET /courses/providers
   *
   * Public provider integration status.
   */
  @Public()
  @Get('courses/providers')
  async getProviders() {
    const providers =
      await this.coursesService.getProvidersStatus();

    return {
      success: true,
      data: providers,
    };
  }

  /**
   * GET /courses/:id
   *
   * Public course detail endpoint.
   */
  @Public()
  @Get('courses/:id')
  async getCourseById(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    const course =
      await this.coursesService.getCourseById(
        id,
      );

    return {
      success: true,
      data: course,
    };
  }

  /* =========================================================
     ADMIN / TRAINER COURSE MANAGEMENT
  ========================================================= */

  /**
   * POST /admin/course-providers/:idOrCode/sync
   *
   * ADMIN only.
   *
   * Triggers an idempotent provider
   * catalog synchronization.
   */
  @Post(
    'admin/course-providers/:idOrCode/sync',
  )
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(SystemRole.ADMIN)
  async syncProviderCatalog(
    @Param('idOrCode')
    idOrCode: string,
  ) {
    const result =
      await this.coursesService.syncProviderCatalog(
        idOrCode,
      );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * GET /admin/course-mappings
   *
   * ADMIN + TRAINER.
   *
   * Lists AI/human course competency
   * mappings for review.
   */
  @Get('admin/course-mappings')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    SystemRole.ADMIN,
    SystemRole.TRAINER,
  )
  async getCourseMappings(
    @Query('status')
    status?: MappingStatus,

    @Query('competencyId')
    competencyId?: number,

    @Query('providerCode')
    providerCode?: string,
  ) {
    const mappings =
      await this.coursesService.getCourseMappings(
        {
          status,

          competencyId:
            competencyId !== undefined
              ? Number(competencyId)
              : undefined,

          providerCode,
        },
      );

    return {
      success: true,
      data: mappings,
    };
  }

  /**
   * PATCH /admin/course-mappings/:id
   *
   * ADMIN + TRAINER.
   *
   * Human-in-the-loop mapping
   * approval / rejection / override.
   */
  @Patch(
    'admin/course-mappings/:id',
  )
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    SystemRole.ADMIN,
    SystemRole.TRAINER,
  )
  async updateCourseMapping(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateCourseMappingDto,

    @CurrentUser()
    user: { id: number },
  ) {
    const result =
      await this.coursesService.updateCourseMapping(
        id,
        dto,
        user.id,
      );

    return {
      success: true,
      data: result,
    };
  }
}