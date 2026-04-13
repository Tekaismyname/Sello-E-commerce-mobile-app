import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ADMIN_LEVELS_KEY } from '../decorators/admin-levels.decorator';
import { AdminLevel, JwtPayload } from '../types/auth.types';

type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};

@Injectable()
export class AdminLevelGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredLevels = this.reflector.getAllAndOverride<AdminLevel[]>(
      ADMIN_LEVELS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredLevels?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (user?.role !== 'admin') {
      throw new ForbiddenException('Admin access is required');
    }

    if (!user.adminLevel || !requiredLevels.includes(user.adminLevel)) {
      throw new ForbiddenException(
        'Your admin level cannot access this resource',
      );
    }

    return true;
  }
}
