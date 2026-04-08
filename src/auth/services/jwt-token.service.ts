import { Injectable } from '@nestjs/common';
import { timingSafeEqual, createHmac } from 'node:crypto';
import { JwtPayload } from '../types/auth.types';

@Injectable()
export class JwtTokenService {
  private readonly secret = process.env.JWT_SECRET ?? 'sello-local-secret';
  private readonly issuer = 'sello-ecommerce-api';

  sign(payload: Record<string, unknown>, expiresInSeconds = 60 * 60) {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const body = {
      iss: this.issuer,
      iat: now,
      exp: now + expiresInSeconds,
      ...payload,
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(body));
    const signature = this.createSignature(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  decode(token: string) {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    try {
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf8'),
      ) as Record<string, unknown>;

      return payload;
    } catch {
      return null;
    }
  }

  verify(token: string): JwtPayload | null {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = this.createSignature(
      `${encodedHeader}.${encodedPayload}`,
    );

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const payload = this.decode(token);

    if (!payload) {
      return null;
    }

    if (payload.iss !== this.issuer) {
      return null;
    }

    if (typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()) {
      return null;
    }

    if (
      typeof payload.sub !== 'number' ||
      typeof payload.role !== 'string' ||
      typeof payload.type !== 'string'
    ) {
      return null;
    }

    return payload as unknown as JwtPayload;
  }

  private createSignature(value: string) {
    return createHmac('sha256', this.secret)
      .update(value)
      .digest('base64url');
  }

  private base64UrlEncode(value: string) {
    return Buffer.from(value).toString('base64url');
  }
}
