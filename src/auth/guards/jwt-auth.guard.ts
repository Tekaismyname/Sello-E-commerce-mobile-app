import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtTokenService } from '../services/jwt-token.service';
import { JwtPayload } from '../types/auth.types';

type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Access token is required');
    }

    const accessToken = authorizationHeader.slice(7).trim();
    const payload = this.jwtTokenService.verify(accessToken);

    if (!payload || payload.type !== 'access') {
      throw new UnauthorizedException('Access token is invalid');
    }

    request.user = payload;
    return true;
  }
}
