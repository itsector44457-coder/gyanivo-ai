import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CompetenciesService } from './competencies.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SystemRole } from '../common/enums/system-role.enum';
import { UpdateRoleCompetenciesDto } from './dto/update-role-requirement.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminRoleMatrixController {
  constructor(private readonly competenciesService: CompetenciesService) {}

  @Get('job-roles')
  @Roles(SystemRole.ADMIN, SystemRole.TRAINER)
  async getJobRoles() {
    return this.competenciesService.getJobRoles();
  }

  @Get('job-roles/:id/competencies')
  @Roles(SystemRole.ADMIN, SystemRole.TRAINER)
  async getJobRoleCompetencies(@Param('id', ParseIntPipe) id: number) {
    return this.competenciesService.getJobRoleCompetencies(id);
  }

  @Put('job-roles/:id/competencies')
  @Roles(SystemRole.ADMIN)
  async updateJobRoleCompetencies(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleCompetenciesDto,
  ) {
    return this.competenciesService.updateJobRoleCompetencies(id, dto);
  }
}
