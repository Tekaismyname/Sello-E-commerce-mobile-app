import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

type GoogleAuthRequest = Request & {
  query: Record<string, string | string[] | undefined>;
  route?: {
    path?: string;
  };
};

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<GoogleAuthRequest>();
    const routePath = request.route?.path ?? '';

    if (routePath === 'google/callback') {
      return undefined;
    }

    const appRedirectUri = request.query.appRedirectUri;
    const redirectUri =
      typeof appRedirectUri === 'string' ? appRedirectUri.trim() : '';

    if (!redirectUri) {
      return {
        prompt: 'select_account',
      };
    }

    return {
      prompt: 'select_account',
      state: Buffer.from(
        JSON.stringify({
          appRedirectUri: redirectUri,
        }),
      ).toString('base64url'),
    };
  }
}
