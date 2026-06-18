import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';
import { MySqlDatabaseService } from './mysql-database.service';
import { EmailService } from './email.service';
import { UserOtp } from '../types/auth.types';

describe('OtpService', () => {
  let service: OtpService;
  let databaseMock: jest.Mocked<Partial<MySqlDatabaseService>>;
  let emailServiceMock: jest.Mocked<Partial<EmailService>>;

  beforeEach(async () => {
    databaseMock = {
      createOtp: jest.fn(),
    };
    emailServiceMock = {
      sendOtpEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: MySqlDatabaseService,
          useValue: databaseMock,
        },
        {
          provide: EmailService,
          useValue: emailServiceMock,
        },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('issueOtp', () => {
    const defaultInput = {
      targetType: 'email' as const,
      targetValue: 'test@example.com',
      purpose: 'register' as const,
      deliveryMethod: 'email' as const,
      recipientEmail: 'test@example.com',
    };

    it('should generate a 6-digit OTP code, save it to database and send via email', async () => {
      const mockOtpRecord: UserOtp = {
        id: 1,
        targetType: 'email',
        targetValue: 'test@example.com',
        otpCode: '123456',
        purpose: 'register',
        isUsed: false,
        expiredAt: new Date(Date.now() + 5 * 60 * 1000),
        createdAt: new Date(),
      };

      databaseMock.createOtp.mockResolvedValue(mockOtpRecord);
      emailServiceMock.sendOtpEmail.mockResolvedValue({ delivered: true });

      const result = await service.issueOtp(defaultInput);

      expect(databaseMock.createOtp).toHaveBeenCalledWith(
        expect.objectContaining({
          targetType: 'email',
          targetValue: 'test@example.com',
          purpose: 'register',
          otpCode: expect.any(String),
          expiredAt: expect.any(Date),
        }),
      );

      // Verify OTP is 6 digits
      const createOtpCallArgs = databaseMock.createOtp.mock.calls[0][0];
      expect(createOtpCallArgs.otpCode).toMatch(/^\d{6}$/);

      // Verify expiry is ~5 mins from now
      const timeDiff = createOtpCallArgs.expiredAt.getTime() - Date.now();
      expect(timeDiff).toBeGreaterThan(4 * 60 * 1000);
      expect(timeDiff).toBeLessThanOrEqual(5 * 60 * 1000);

      expect(emailServiceMock.sendOtpEmail).toHaveBeenCalledWith({
        to: 'test@example.com',
        otpCode: createOtpCallArgs.otpCode,
        purpose: 'register',
        expiredAt: createOtpCallArgs.expiredAt,
      });

      expect(result).toEqual(mockOtpRecord);
    });

    it('should handle SMS delivery warning when deliveryMethod is phone', async () => {
      const mockOtpRecord: UserOtp = {
        id: 2,
        targetType: 'phone',
        targetValue: '+84987654321',
        otpCode: '654321',
        purpose: 'register',
        isUsed: false,
        expiredAt: new Date(Date.now() + 5 * 60 * 1000),
        createdAt: new Date(),
      };

      databaseMock.createOtp.mockResolvedValue(mockOtpRecord);

      const result = await service.issueOtp({
        targetType: 'phone',
        targetValue: '+84987654321',
        purpose: 'register',
        deliveryMethod: 'phone',
        recipientPhone: '+84987654321',
      });

      expect(databaseMock.createOtp).toHaveBeenCalled();
      expect(emailServiceMock.sendOtpEmail).not.toHaveBeenCalled();
      expect(result).toEqual(mockOtpRecord);
    });

    it('should skip email/phone delivery if recipient details are missing', async () => {
      const mockOtpRecord: UserOtp = {
        id: 3,
        targetType: 'email',
        targetValue: 'test@example.com',
        otpCode: '111111',
        purpose: 'register',
        isUsed: false,
        expiredAt: new Date(),
        createdAt: new Date(),
      };

      databaseMock.createOtp.mockResolvedValue(mockOtpRecord);

      await service.issueOtp({
        targetType: 'email',
        targetValue: 'test@example.com',
        purpose: 'register',
        deliveryMethod: 'email', // but recipientEmail is missing
      });

      expect(emailServiceMock.sendOtpEmail).not.toHaveBeenCalled();
    });

    it('should throw an error if database fails to create OTP record', async () => {
      databaseMock.createOtp.mockResolvedValue(null);

      await expect(service.issueOtp(defaultInput)).rejects.toThrow(
        'Failed to create OTP record',
      );
    });
  });

  describe('isOtpUsable', () => {
    const createMockOtp = (overrides: Partial<UserOtp> = {}): UserOtp => ({
      id: 1,
      targetType: 'email',
      targetValue: 'test@example.com',
      otpCode: '123456',
      purpose: 'register',
      isUsed: false,
      expiredAt: new Date(Date.now() + 5 * 60 * 1000),
      createdAt: new Date(),
      ...overrides,
    });

    it('should return true for a valid, unused, and unexpired OTP code', () => {
      const record = createMockOtp();
      expect(service.isOtpUsable(record, '123456')).toBe(true);
    });

    it('should return false if the OTP code does not match', () => {
      const record = createMockOtp();
      expect(service.isOtpUsable(record, '999999')).toBe(false);
    });

    it('should return false if the OTP is already used', () => {
      const record = createMockOtp({ isUsed: true });
      expect(service.isOtpUsable(record, '123456')).toBe(false);
    });

    it('should return false if the OTP is expired', () => {
      const record = createMockOtp({
        expiredAt: new Date(Date.now() - 1000), // 1 second ago
      });
      expect(service.isOtpUsable(record, '123456')).toBe(false);
    });
  });
});
