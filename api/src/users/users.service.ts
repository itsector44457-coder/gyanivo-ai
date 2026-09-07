import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        systemRole: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        systemRole: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        profile: {
          select: {
            employeeCode: true,
            designation: true,
            department: {
              select: { code: true, name: true },
            },
            jobRole: {
              select: { code: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
