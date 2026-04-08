import { Injectable } from '@nestjs/common';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

@Injectable()
export class PasswordService {
  hash(value: string) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = scryptSync(value, salt, 64).toString('hex');

    return `${salt}:${derivedKey}`;
  }

  verify(value: string, storedHash: string) {
    const [salt, existingHash] = storedHash.split(':');

    if (!salt || !existingHash) {
      return false;
    }

    const derivedKey = scryptSync(value, salt, 64);
    const existingBuffer = Buffer.from(existingHash, 'hex');

    if (derivedKey.length !== existingBuffer.length) {
      return false;
    }

    return timingSafeEqual(derivedKey, existingBuffer);
  }
}
