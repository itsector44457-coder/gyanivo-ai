import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isObservable, lastValueFrom } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

@Injectable()
export class RoleProtectedGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtAuthGuard: JwtAuthGuard,
    private readonly rolesGuard: RolesGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<(string | unknown)[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Routes without @Roles() keep their existing public/auth behavior.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Any route declaring @Roles() must first establish an authenticated user.
    const authResult = this.jwtAuthGuard.canActivate(context);
    const authenticated = isObservable(authResult)
      ? await lastValueFrom(authResult)
      : await Promise.resolve(authResult);

    if (!authenticated) {
      return false;
    }

    return this.rolesGuard.canActivate(context);
  }
}
