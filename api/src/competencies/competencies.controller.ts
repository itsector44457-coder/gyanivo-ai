import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompetenciesService } from './competencies.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller()
export class CompetenciesController {
  constructor(private readonly competenciesService: CompetenciesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('employees/me/competencies')
  async getMyCompetencies(@CurrentUser() user: AuthenticatedUser) {
    return this.competenciesService.getMyCompetencies(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('employees/me/skill-gaps')
  async getMySkillGaps(
    @CurrentUser() user: AuthenticatedUser,
    @Query('includeSatisfied') includeSatisfied?: string,
  ) {
    const isSatisfiedIncluded = includeSatisfied === 'true';
    return this.competenciesService.getMySkillGaps(user.id, isSatisfiedIncluded);
  }

  @UseGuards(JwtAuthGuard)
  @Get('employees/me/dashboard')
  async getMyDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.competenciesService.getMyDashboard(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('employees/me/competencies/:id/history')
  async getCompetencyHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) competencyId: number,
  ) {
    return this.competenciesService.getCompetencyHistory(user.id, competencyId);
  }

  @Public()
  @Get('competencies')
  async getCompetenciesCatalog(
    @Query('domain') domainCode?: string,
    @Query('search') search?: string,
  ) {
    return this.competenciesService.getCompetenciesCatalog(domainCode, search);
  }

  @Public()
  @Get('competencies/:id')
  async getCompetencyById(@Param('id', ParseIntPipe) id: number) {
    return this.competenciesService.getCompetencyById(id);
  }
}
