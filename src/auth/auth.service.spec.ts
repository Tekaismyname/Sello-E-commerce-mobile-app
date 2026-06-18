import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MySqlDatabaseService } from './services/mysql-database.service';
import { OtpService } from './services/otp.service';
import { PasswordService } from './services/password.service';
import { JwtTokenService } from './services/jwt-token.service';
import { RegisterDto, VerifyOtpDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { LogoutDto } from './dto/logout.dto';
import { User, UserOtp } from './types/auth.types';

const mockDatabase = {
  findUserByEmailOrPhone: jest.fn(),
  createUser: jest.fn(),
  findLatestOtp: jest.fn(),
  markOtpAsUsed: jest.fn(),
  findUserById: jest.fn(),
  updateUser: jest.fn(),
  findUserByIdentifier: jest.fn(),
  getPermissionsForUser: jest.fn(),
  createRefreshToken: jest.fn(),
  findActiveRefreshToken: jest.fn(),
  revokeRefreshToken: jest.fn(),
  deleteUser: jest.fn(),
};

const mockOtpService = {
  issueOtp: jest.fn(),
  isOtpUsable: jest.fn(),
};

const mockPasswordService = {
  hash: jest.fn().mockReturnValue('hashed_password'),
  verify: jest.fn(),
};

const mockJwtTokenService = {
  sign: jest.fn().mockReturnValue('signed_jwt_token'),
  decode: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let db: MySqlDatabaseService;
  let otp: OtpService;
  let pwd: PasswordService;
  let jwt: JwtTokenService;

  const sampleUser: User = {
    id: 1,
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '0987654321',
    passwordHash: 'hashed_password',
    role: 'customer',
    adminLevel: null,
    status: 'active',
    isVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sampleOtp: UserOtp = {
    id: 10,
    targetType: 'email',
    targetValue: 'john@example.com',
    otpCode: '123456',
    purpose: 'register',
    isUsed: false,
    expiredAt: new Date(Date.now() + 5 * 60 * 1000),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: MySqlDatabaseService, useValue: mockDatabase },
        { provide: OtpService, useValue: mockOtpService },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: JwtTokenService, useValue: mockJwtTokenService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    db = module.get<MySqlDatabaseService>(MySqlDatabaseService);
    otp = module.get<OtpService>(OtpService);
    pwd = module.get<PasswordService>(PasswordService);
    jwt = module.get<JwtTokenService>(JwtTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const defaultPayload: RegisterDto = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '0987654321',
      password: 'password123',
      confirmPassword: 'password123',
      deliveryMethod: 'email',
    };

    it('should successfully register a customer and issue an OTP', async () => {
      mockDatabase.findUserByEmailOrPhone.mockResolvedValue(null);
      mockDatabase.createUser.mockResolvedValue(sampleUser);
      mockOtpService.issueOtp.mockResolvedValue(sampleOtp);

      const result = await service.register(defaultPayload);

      expect(db.findUserByEmailOrPhone).toHaveBeenCalledWith(defaultPayload.email, defaultPayload.phone);
      expect(pwd.hash).toHaveBeenCalledWith(defaultPayload.password);
      expect(db.createUser).toHaveBeenCalledWith({
        fullName: defaultPayload.fullName,
        email: defaultPayload.email,
        phone: defaultPayload.phone,
        passwordHash: 'hashed_password',
        role: 'customer',
        adminLevel: null,
        status: 'active',
        isVerified: false,
      });
      expect(otp.issueOtp).toHaveBeenCalledWith({
        targetValue: 'john@example.com',
        purpose: 'register',
        userId: 1,
        deliveryMethod: 'email',
        recipientEmail: 'john@example.com',
        recipientPhone: '0987654321',
      });
      expect(result.message).toBe('Registration successful, please verify OTP');
      expect(result.user.id).toBe(1);
      expect(result.otp.otpCodePreview).toBe('123456');
    });

    it('should throw BadRequestException if fullName is missing', async () => {
      await expect(service.register({ ...defaultPayload, fullName: '' })).rejects.toThrow(
        new BadRequestException('Full name is required'),
      );
    });

    it('should throw BadRequestException if email is invalid', async () => {
      await expect(service.register({ ...defaultPayload, email: 'invalid-email' })).rejects.toThrow(
        new BadRequestException('Email is invalid'),
      );
    });

    it('should throw BadRequestException if phone number is invalid', async () => {
      await expect(service.register({ ...defaultPayload, phone: '123' })).rejects.toThrow(
        new BadRequestException('Phone number is invalid'),
      );
    });

    it('should throw BadRequestException if password is too short', async () => {
      await expect(service.register({ ...defaultPayload, password: 'short' })).rejects.toThrow(
        new BadRequestException('Password must be at least 8 characters'),
      );
    });

    it('should throw BadRequestException if confirmPassword does not match', async () => {
      await expect(service.register({ ...defaultPayload, confirmPassword: 'different' })).rejects.toThrow(
        new BadRequestException('Password confirmation does not match'),
      );
    });

    it('should throw BadRequestException if deliveryMethod is invalid', async () => {
      await expect(service.register({ ...defaultPayload, deliveryMethod: 'invalid' as any })).rejects.toThrow(
        new BadRequestException('OTP delivery method is invalid'),
      );
    });

    it('should throw BadRequestException if email or phone already exists', async () => {
      mockDatabase.findUserByEmailOrPhone.mockResolvedValue(sampleUser);
      await expect(service.register(defaultPayload)).rejects.toThrow(
        new BadRequestException('Email or phone already exists'),
      );
    });

    it('should throw BadRequestException if database fails to create user', async () => {
      mockDatabase.findUserByEmailOrPhone.mockResolvedValue(null);
      mockDatabase.createUser.mockResolvedValue(null);
      await expect(service.register(defaultPayload)).rejects.toThrow(
        new BadRequestException('Failed to create user'),
      );
    });
  });

  describe('verifyOtp', () => {
    const payload: VerifyOtpDto = {
      targetValue: 'john@example.com',
      otpCode: '123456',
      purpose: 'register',
    };

    it('should successfully verify OTP for registration, mark it as used and verify the user', async () => {
      mockDatabase.findLatestOtp.mockResolvedValue(sampleOtp);
      mockOtpService.isOtpUsable.mockReturnValue(true);
      mockDatabase.findUserById.mockResolvedValue(sampleUser);
      mockDatabase.updateUser.mockResolvedValue(undefined);

      const result = await service.verifyOtp(payload);

      expect(db.findLatestOtp).toHaveBeenCalledWith(payload.targetValue, payload.purpose);
      expect(otp.isOtpUsable).toHaveBeenCalledWith(sampleOtp, payload.otpCode);
      expect(db.markOtpAsUsed).toHaveBeenCalledWith(sampleOtp.id);
      expect(db.findUserById).toHaveBeenCalledWith(sampleOtp.userId);
      expect(db.updateUser).toHaveBeenCalledWith(sampleUser.id, { isVerified: true });
      expect(result.message).toBe('Account verification successful');
      expect(result.user.id).toBe(sampleUser.id);
    });

    it('should successfully verify OTP for reset_password without modifying user', async () => {
      mockDatabase.findLatestOtp.mockResolvedValue({ ...sampleOtp, purpose: 'reset_password' });
      mockOtpService.isOtpUsable.mockReturnValue(true);

      const result = await service.verifyOtp({ ...payload, purpose: 'reset_password' });

      expect(db.markOtpAsUsed).toHaveBeenCalled();
      expect(db.updateUser).not.toHaveBeenCalled();
      expect(result.message).toBe('OTP is valid');
    });

    it('should throw BadRequestException if OTP targetValue is empty', async () => {
      await expect(service.verifyOtp({ ...payload, targetValue: '' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if OTP code is not 6 digits', async () => {
      await expect(service.verifyOtp({ ...payload, otpCode: '123' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if OTP purpose is invalid', async () => {
      await expect(service.verifyOtp({ ...payload, purpose: 'invalid' as any })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if OTP record is missing or not usable', async () => {
      mockDatabase.findLatestOtp.mockResolvedValue(null);
      await expect(service.verifyOtp(payload)).rejects.toThrow(new BadRequestException('OTP is invalid or expired'));
    });

    it('should throw NotFoundException if user to verify is not found in database', async () => {
      mockDatabase.findLatestOtp.mockResolvedValue(sampleOtp);
      mockOtpService.isOtpUsable.mockReturnValue(true);
      mockDatabase.findUserById.mockResolvedValue(null);

      await expect(service.verifyOtp(payload)).rejects.toThrow(new NotFoundException('User to verify was not found'));
    });
  });

  describe('login', () => {
    const payload: LoginDto = {
      identifier: 'john@example.com',
      password: 'password123',
    };

    const verifiedUser = { ...sampleUser, isVerified: true };

    it('should login successfully and return access and refresh tokens', async () => {
      mockDatabase.findUserByIdentifier.mockResolvedValue(verifiedUser);
      mockPasswordService.verify.mockReturnValue(true);
      mockDatabase.getPermissionsForUser.mockReturnValue(['read:system']);
      mockJwtTokenService.sign.mockReturnValueOnce('access_token').mockReturnValueOnce('refresh_token');
      mockDatabase.createRefreshToken.mockResolvedValue(undefined);
      mockJwtTokenService.decode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 300 });

      const result = await service.login(payload);

      expect(db.findUserByIdentifier).toHaveBeenCalledWith(payload.identifier);
      expect(pwd.verify).toHaveBeenCalledWith(payload.password, verifiedUser.passwordHash);
      expect(db.getPermissionsForUser).toHaveBeenCalledWith(verifiedUser);
      expect(jwt.sign).toHaveBeenNthCalledWith(1, expect.objectContaining({ sub: verifiedUser.id, role: 'customer' }));
      expect(jwt.sign).toHaveBeenNthCalledWith(2, expect.objectContaining({ sub: verifiedUser.id, type: 'refresh' }), 604800);
      expect(db.createRefreshToken).toHaveBeenCalled();
      expect(result.message).toBe('Login successful');
      expect(result.tokens.accessToken).toBe('access_token');
      expect(result.tokens.refreshToken).toBe('refresh_token');
      expect(result.user.permissions).toEqual(['read:system']);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockDatabase.findUserByIdentifier.mockResolvedValue(null);
      await expect(service.login(payload)).rejects.toThrow(new NotFoundException('User not found'));
    });

    it('should throw UnauthorizedException if user status is blocked', async () => {
      mockDatabase.findUserByIdentifier.mockResolvedValue({ ...verifiedUser, status: 'blocked' });
      await expect(service.login(payload)).rejects.toThrow(new UnauthorizedException('User is blocked'));
    });

    it('should throw UnauthorizedException if password verify fails', async () => {
      mockDatabase.findUserByIdentifier.mockResolvedValue(verifiedUser);
      mockPasswordService.verify.mockReturnValue(false);
      await expect(service.login(payload)).rejects.toThrow(new UnauthorizedException('Invalid password'));
    });

    it('should throw UnauthorizedException if user has not verified OTP', async () => {
      mockDatabase.findUserByIdentifier.mockResolvedValue(sampleUser); // isVerified = false
      mockPasswordService.verify.mockReturnValue(true);
      await expect(service.login(payload)).rejects.toThrow(new UnauthorizedException('User has not verified OTP'));
    });
  });

  describe('oAuthLogin', () => {
    const oAuthPayload = {
      email: 'google@example.com',
      fullName: 'Google User',
    };

    it('should register and login a new OAuth user successfully', async () => {
      mockDatabase.findUserByIdentifier.mockResolvedValue(null);
      mockDatabase.createUser.mockResolvedValue({ ...sampleUser, email: 'google@example.com', isVerified: true });
      mockDatabase.getPermissionsForUser.mockReturnValue([]);
      mockJwtTokenService.sign.mockReturnValueOnce('access_token').mockReturnValueOnce('refresh_token');
      mockDatabase.createRefreshToken.mockResolvedValue(undefined);

      const result = await service.oAuthLogin(oAuthPayload);

      expect(db.findUserByIdentifier).toHaveBeenCalledWith(oAuthPayload.email);
      expect(db.createUser).toHaveBeenCalledWith({
        fullName: 'Google User',
        email: 'google@example.com',
        phone: undefined,
        passwordHash: '',
        role: 'customer',
        adminLevel: null,
        status: 'active',
        isVerified: true,
      });
      expect(result.tokens.accessToken).toBe('access_token');
    });

    it('should login an existing verified OAuth user successfully', async () => {
      const existingUser = { ...sampleUser, email: 'google@example.com', isVerified: true };
      mockDatabase.findUserByIdentifier.mockResolvedValue(existingUser);
      mockDatabase.getPermissionsForUser.mockReturnValue([]);

      const result = await service.oAuthLogin(oAuthPayload);

      expect(db.createUser).not.toHaveBeenCalled();
      expect(result.tokens.accessToken).toBeDefined();
    });

    it('should set an existing unverified user to verified on OAuth login', async () => {
      const existingUser = { ...sampleUser, email: 'google@example.com', isVerified: false };
      mockDatabase.findUserByIdentifier.mockResolvedValue(existingUser);
      mockDatabase.updateUser.mockResolvedValue(undefined);
      mockDatabase.findUserById.mockResolvedValue({ ...existingUser, isVerified: true });
      mockDatabase.getPermissionsForUser.mockReturnValue([]);

      await service.oAuthLogin(oAuthPayload);

      expect(db.updateUser).toHaveBeenCalledWith(existingUser.id, { isVerified: true });
    });

    it('should throw BadRequestException if OAuth payload is missing email', async () => {
      await expect(service.oAuthLogin({ fullName: 'No Email' })).rejects.toThrow(
        new BadRequestException('Invalid OAuth payload'),
      );
    });

    it('should throw UnauthorizedException if OAuth user is blocked', async () => {
      const blockedUser = { ...sampleUser, status: 'blocked' };
      mockDatabase.findUserByIdentifier.mockResolvedValue(blockedUser);
      mockDatabase.findUserById.mockResolvedValue(blockedUser);
      await expect(service.oAuthLogin(oAuthPayload)).rejects.toThrow(new UnauthorizedException('User is blocked'));
    });

    it('should throw BadRequestException if creating new user fails', async () => {
      mockDatabase.findUserByIdentifier.mockResolvedValue(null);
      mockDatabase.createUser.mockResolvedValue(null);
      await expect(service.oAuthLogin(oAuthPayload)).rejects.toThrow(new BadRequestException('Failed to create user from OAuth'));
    });
  });

  describe('logout', () => {
    const payload: LogoutDto = {
      refreshToken: 'valid_refresh_token',
    };

    it('should logout successfully by revoking token record', async () => {
      mockJwtTokenService.decode.mockReturnValue({ type: 'refresh' });
      mockDatabase.findActiveRefreshToken.mockResolvedValue({
        id: 50,
        userId: 1,
        tokenHash: 'hashed_token',
        expiresAt: new Date(Date.now() + 5000),
        isRevoked: false,
        createdAt: new Date(),
      });
      mockDatabase.revokeRefreshToken.mockResolvedValue(undefined);

      const result = await service.logout(payload);

      expect(jwt.decode).toHaveBeenCalledWith(payload.refreshToken);
      expect(db.findActiveRefreshToken).toHaveBeenCalled();
      expect(db.revokeRefreshToken).toHaveBeenCalledWith(50);
      expect(result).toEqual({ message: 'Logout successful', clearTokens: true });
    });

    it('should throw BadRequestException if refresh token is missing', async () => {
      await expect(service.logout({ refreshToken: '' })).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if token decode is null or wrong type', async () => {
      mockJwtTokenService.decode.mockReturnValue(null);
      await expect(service.logout(payload)).rejects.toThrow(new UnauthorizedException('Refresh token is invalid'));

      mockJwtTokenService.decode.mockReturnValue({ type: 'access' });
      await expect(service.logout(payload)).rejects.toThrow(new UnauthorizedException('Refresh token is invalid'));
    });

    it('should throw UnauthorizedException if token is expired or already revoked', async () => {
      mockJwtTokenService.decode.mockReturnValue({ type: 'refresh' });
      mockDatabase.findActiveRefreshToken.mockResolvedValue(null);
      await expect(service.logout(payload)).rejects.toThrow(UnauthorizedException);

      mockDatabase.findActiveRefreshToken.mockResolvedValue({
        expiresAt: new Date(Date.now() - 5000), // expired
      } as any);
      await expect(service.logout(payload)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('deleteUser', () => {
    it('should delete user from database successfully', async () => {
      mockDatabase.findUserById.mockResolvedValue(sampleUser);
      mockDatabase.deleteUser.mockResolvedValue(undefined);

      const result = await service.deleteUser(1);

      expect(db.findUserById).toHaveBeenCalledWith(1);
      expect(db.deleteUser).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'User deleted successfully', userId: 1 });
    });

    it('should throw NotFoundException if user to delete does not exist', async () => {
      mockDatabase.findUserById.mockResolvedValue(null);
      await expect(service.deleteUser(999)).rejects.toThrow(new NotFoundException('User not found'));
    });
  });

  describe('forgotPassword', () => {
    const payload: ForgotPasswordDto = {
      identifier: 'john@example.com',
      deliveryMethod: 'email',
    };

    it('should issue a forgot password OTP successfully', async () => {
      mockDatabase.findUserByIdentifier.mockResolvedValue(sampleUser);
      mockOtpService.issueOtp.mockResolvedValue({ ...sampleOtp, purpose: 'reset_password' });

      const result = await service.forgotPassword(payload);

      expect(db.findUserByIdentifier).toHaveBeenCalledWith(payload.identifier);
      expect(otp.issueOtp).toHaveBeenCalledWith(expect.objectContaining({
        purpose: 'reset_password',
        userId: sampleUser.id,
      }));
      expect(result.message).toBe('Reset password OTP sent successfully');
      expect(result.otp.purpose).toBe('reset_password');
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockDatabase.findUserByIdentifier.mockResolvedValue(null);
      await expect(service.forgotPassword(payload)).rejects.toThrow(new NotFoundException('User not found'));
    });
  });

  describe('resetPassword', () => {
    const payload: ResetPasswordDto = {
      identifier: 'john@example.com',
      targetValue: 'john@example.com',
      otpCode: '123456',
      newPassword: 'newPassword123',
      confirmNewPassword: 'newPassword123',
    };

    it('should reset the password successfully when OTP is usable', async () => {
      mockDatabase.findUserByIdentifier.mockResolvedValue(sampleUser);
      mockDatabase.findLatestOtp.mockResolvedValue({ ...sampleOtp, purpose: 'reset_password' });
      mockOtpService.isOtpUsable.mockReturnValue(true);
      mockDatabase.updateUser.mockResolvedValue(undefined);
      mockDatabase.findUserById.mockResolvedValue(sampleUser);
      mockDatabase.markOtpAsUsed.mockResolvedValue(undefined);

      const result = await service.resetPassword(payload);

      expect(db.findUserByIdentifier).toHaveBeenCalledWith(payload.identifier);
      expect(db.findLatestOtp).toHaveBeenCalledWith(payload.targetValue, 'reset_password');
      expect(otp.isOtpUsable).toHaveBeenCalled();
      expect(pwd.hash).toHaveBeenCalledWith(payload.newPassword);
      expect(db.updateUser).toHaveBeenCalledWith(sampleUser.id, { passwordHash: 'hashed_password' });
      expect(db.markOtpAsUsed).toHaveBeenCalledWith(sampleOtp.id);
      expect(result.message).toBe('Password reset successful');
    });

    it('should throw BadRequestException if passwords do not match', async () => {
      await expect(service.resetPassword({ ...payload, confirmNewPassword: 'different' })).rejects.toThrow(
        new BadRequestException('New password confirmation does not match'),
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockDatabase.findUserByIdentifier.mockResolvedValue(null);
      await expect(service.resetPassword(payload)).rejects.toThrow(new NotFoundException('User not found'));
    });

    it('should throw BadRequestException if OTP record is missing or not usable', async () => {
      mockDatabase.findUserByIdentifier.mockResolvedValue(sampleUser);
      mockDatabase.findLatestOtp.mockResolvedValue(null);

      await expect(service.resetPassword(payload)).rejects.toThrow(new BadRequestException('OTP is invalid or expired'));
    });
  });

  describe('OAuth redirect helper methods', () => {
    describe('extractRedirectUriFromState', () => {
      it('should extract redirect uri from valid base64url encoded state JSON', () => {
        const stateObj = { appRedirectUri: 'selloecommerce://custom/callback' };
        const stateString = Buffer.from(JSON.stringify(stateObj)).toString('base64url');
        const result = service.extractRedirectUriFromState(stateString);
        expect(result).toBe('selloecommerce://custom/callback');
      });

      it('should return null for malformed or missing state value', () => {
        expect(service.extractRedirectUriFromState('invalid_base64')).toBeNull();
        expect(service.extractRedirectUriFromState(undefined)).toBeNull();
      });

      it('should fall back if redirect uri protocol is not allowed', () => {
        const stateObj = { appRedirectUri: 'http://malicious.com' };
        const stateString = Buffer.from(JSON.stringify(stateObj)).toString('base64url');
        const result = service.extractRedirectUriFromState(stateString);
        // default fallback redirect uri
        expect(result).toBe('selloecommerce://auth/callback');
      });
    });

    describe('buildOAuthSuccessRedirectUrl', () => {
      it('should append tokens and user info query params to redirect uri', () => {
        const loginResponse = {
          message: 'OAuth Login successful',
          tokens: {
            accessToken: 'acc_token',
            refreshToken: 'ref_token',
            tokenType: 'Bearer',
          },
          user: { id: 1, email: 'john@example.com' },
        } as any;

        const url = service.buildOAuthSuccessRedirectUrl(loginResponse, 'selloecommerce://my/callback');
        expect(url).toContain('selloecommerce://my/callback');
        expect(url).toContain('accessToken=acc_token');
        expect(url).toContain('refreshToken=ref_token');
        expect(url).toContain('user=%7B%22id%22%3A1%2C%22email%22%3A%22john%40example.com%22%7D');
      });
    });
  });
});
