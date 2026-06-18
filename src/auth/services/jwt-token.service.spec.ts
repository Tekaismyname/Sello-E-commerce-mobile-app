import { Test, TestingModule } from '@nestjs/testing';
import { JwtTokenService } from './jwt-token.service';

describe('JwtTokenService', () => {
  let service: JwtTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtTokenService],
    }).compile();

    service = module.get<JwtTokenService>(JwtTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('should sign and produce a valid 3-part JWT token', () => {
      const payload = { sub: 1, role: 'customer', type: 'access' };
      const token = service.sign(payload);
      expect(token).toBeDefined();
      const parts = token.split('.');
      expect(parts.length).toBe(3);
    });

    it('should include issue date and expiration date in payload', () => {
      const payload = { sub: 1, role: 'customer', type: 'access' };
      const token = service.sign(payload, 300);
      const decoded = service.decode(token);
      expect(decoded).toBeDefined();
      expect(decoded.iss).toBe('sello-ecommerce-api');
      expect(decoded.sub).toBe(1);
      expect(decoded.role).toBe('customer');
      expect(decoded.type).toBe('access');
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBe((decoded.iat as number) + 300);
    });
  });

  describe('decode', () => {
    it('should decode a valid token correctly', () => {
      const payload = { test: 'data' };
      const token = service.sign(payload);
      const decoded = service.decode(token);
      expect(decoded).toBeDefined();
      expect(decoded.test).toBe('data');
    });

    it('should return null for a malformed token', () => {
      expect(service.decode('invalidtoken')).toBeNull();
      expect(service.decode('invalid.token')).toBeNull();
      expect(service.decode('invalid.token.extra.part')).toBeNull();
    });

    it('should return null if token payload is invalid JSON base64url', () => {
      expect(service.decode('header.invalidbase64url.signature')).toBeNull();
    });
  });

  describe('verify', () => {
    it('should verify and return payload for a valid token containing sub, role, type', () => {
      const payload = { sub: 1, role: 'customer', type: 'access' };
      const token = service.sign(payload);
      const result = service.verify(token);
      expect(result).toBeDefined();
      expect(result.sub).toBe(1);
      expect(result.role).toBe('customer');
      expect(result.type).toBe('access');
    });

    it('should return null for an expired token', () => {
      const payload = { sub: 1, role: 'customer', type: 'access' };
      // Expire immediately (expiresInSeconds = -10)
      const token = service.sign(payload, -10);
      const result = service.verify(token);
      expect(result).toBeNull();
    });

    it('should return null if signature is tampered with', () => {
      const payload = { sub: 1, role: 'customer', type: 'access' };
      const token = service.sign(payload);
      const parts = token.split('.');
      const tamperedToken = `${parts[0]}.${parts[1]}.tamperedsignature`;
      const result = service.verify(tamperedToken);
      expect(result).toBeNull();
    });

    it('should return null for wrong issuer', () => {
      // We will sign a token with a custom payload that manually overwrites iss
      const payload = { sub: 1, role: 'customer', type: 'access', iss: 'wrong-issuer' };
      const token = service.sign(payload);
      const result = service.verify(token);
      expect(result).toBeNull();
    });

    it('should return null if sub, role, or type are missing or of incorrect type', () => {
      // sub not a number
      const token1 = service.sign({ sub: '1', role: 'customer', type: 'access' });
      expect(service.verify(token1)).toBeNull();

      // role not a string
      const token2 = service.sign({ sub: 1, role: 123, type: 'access' });
      expect(service.verify(token2)).toBeNull();

      // type not a string
      const token3 = service.sign({ sub: 1, role: 'customer', type: true });
      expect(service.verify(token3)).toBeNull();

      // missing fields
      const token4 = service.sign({ sub: 1, role: 'customer' });
      expect(service.verify(token4)).toBeNull();
    });
  });
});
