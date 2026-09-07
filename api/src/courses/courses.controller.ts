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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SystemRole } from '../generated/prisma/client';
import { GetCoursesQueryDto } from './dto/get-courses-query.dto';
import { UpdateCourseMappingDto } from './dto/update-mapping.dto';
import { MappingStatus } from './types/course.types';

@Controller()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  /**
   * GET /courses - Public / Authenticated Course Catalog Search & Filtering
   */
  @Get('courses')
  async getCourses(@Query() query: GetCoursesQueryDto) {
    const result = await this.coursesService.getCourses(query);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * GET /courses/providers - Provider integration statuses & capability matrices
   */
  @Get('courses/providers')
  async getProviders() {
    const providers = await this.coursesService.getProvidersStatus();
    return {
      success: true,
      data: providers,
    };
  }

  /**
   * GET /courses/:id - Single Course Details
   */
  @Get('courses/:id')
  async getCourseById(@Param('id', ParseIntPipe) id: number) {
    const course = await this.coursesService.getCourseById(id);
    return {
      success: true,
      data: course,
    };
  }

  /**
   * POST /admin/course-providers/:idOrCode/sync - Trigger Idempotent Catalog Sync
   */
  @Post('admin/course-providers/:idOrCode/sync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ADMIN)
  async syncProviderCatalog(@Param('idOrCode') idOrCode: string) {
    const result = await this.coursesService.syncProviderCatalog(idOrCode);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * GET /admin/course-mappings - List all AI & Human mappings for review
   */
  @Get('admin/course-mappings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ADMIN, SystemRole.TRAINER)
  async getCourseMappings(
    @Query('status') status?: MappingStatus,
    @Query('competencyId') competencyId?: number,
    @Query('providerCode') providerCode?: string,
  ) {
    const mappings = await this.coursesService.getCourseMappings({
      status,
      competencyId: competencyId ? Number(competencyId) : undefined,
      providerCode,
    });
    return {
      success: true,
      data: mappings,
    };
  }

  /**
   * PATCH /admin/course-mappings/:id - Human-in-the-loop Approve / Reject / Override
   */
  @Patch('admin/course-mappings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ADMIN, SystemRole.TRAINER)
  async updateCourseMapping(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseMappingDto,
    @CurrentUser() user: { id: number },
  ) {
    const result = await this.coursesService.updateCourseMapping(id, dto, user.id);
    return {
      success: true,
      data: result,
    };
  }
}
