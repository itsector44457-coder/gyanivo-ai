import { Controller, Get, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get('me/profile')
  async getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.employeesService.getMyProfile(user.id);
    return {
      success: true,
      profile,
    };
  }
}
