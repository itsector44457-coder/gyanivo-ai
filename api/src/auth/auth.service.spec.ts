import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    email: 'employee.demo@local.test',
    passwordHash: '',
    firstName: 'Rahul',
    lastName: 'Sharma',
    systemRole: 'EMPLOYEE',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    authSession: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock.jwt.token'),
  };

  beforeAll(async () => {
    mockUser.passwordHash = await bcrypt.hash('DemoPassword123!', 10);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should validate and return user without passwordHash if credentials are valid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser('employee.demo@local.test', 'DemoPassword123!');
      expect(result).toBeDefined();
      expect(result.email).toBe('employee.demo@local.test');
      expect((result as any).passwordHash).toBeUndefined();
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.validateUser('employee.demo@local.test', 'WrongPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.validateUser('nonexistent@local.test', 'DemoPassword123!'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should issue an accessToken and refreshToken on successful login', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.authSession.create.mockResolvedValue({ id: 'session-uuid-1' });
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'employee.demo@local.test',
        password: 'DemoPassword123!',
      });

      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe('employee.demo@local.test');
      expect(mockPrismaService.authSession.create).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should mark session as revoked', async () => {
      mockPrismaService.authSession.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.logout('session-uuid-1');
      expect(result.success).toBe(true);
      expect(mockPrismaService.authSession.updateMany).toHaveBeenCalledWith({
        where: { id: 'session-uuid-1', revokedAt: null },
        data: expect.objectContaining({ revokedAt: expect.any(Date) }),
      });
    });
  });
});
