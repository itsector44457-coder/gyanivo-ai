import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: number) {
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            systemRole: true,
            lastLoginAt: true,
          },
        },
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
        competencies: {
          include: {
            competency: {
              include: {
                domain: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Employee profile not found for current user');
    }

    return profile;
  }
}
