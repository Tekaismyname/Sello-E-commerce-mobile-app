import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should hash a password with salt and derivedKey separated by a colon', () => {
      const password = 'mySecretPassword';
      const hash = service.hash(password);
      expect(hash).toContain(':');
      const parts = hash.split(':');
      expect(parts.length).toBe(2);
      expect(parts[0]).toHaveLength(32); // hex of 16 bytes is 32 chars
      expect(parts[1]).toHaveLength(128); // hex of 64 bytes is 128 chars
    });

    it('should produce different hashes for the same password due to random salt', () => {
      const password = 'mySecretPassword';
      const hash1 = service.hash(password);
      const hash2 = service.hash(password);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verify', () => {
    it('should return true for a correct password and valid hash', () => {
      const password = 'mySecretPassword';
      const hash = service.hash(password);
      const result = service.verify(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for an incorrect password', () => {
      const password = 'mySecretPassword';
      const wrongPassword = 'wrongPassword';
      const hash = service.hash(password);
      const result = service.verify(wrongPassword, hash);
      expect(result).toBe(false);
    });

    it('should return false for a malformed stored hash', () => {
      const result = service.verify('password', 'invalidhashformat');
      expect(result).toBe(false);
    });

    it('should return false when salt or hash is missing', () => {
      expect(service.verify('password', ':hash')).toBe(false);
      expect(service.verify('password', 'salt:')).toBe(false);
    });
  });
});
