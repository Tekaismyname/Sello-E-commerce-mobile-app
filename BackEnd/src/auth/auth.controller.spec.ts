import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  VerifyOtpDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { LogoutDto } from './dto/logout.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AdminLevelGuard } from './guards/admin-level.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

const mockAuthService = {
  register: jest.fn().mockImplementation((dto: RegisterDto) =>
    Promise.resolve({ status: 'success', user: { email: dto.email } }),
  ),
  verifyOtp: jest.fn().mockImplementation((dto: VerifyOtpDto) =>
    Promise.resolve({ status: 'success', message: 'OTP verified' }),
  ),
  login: jest.fn().mockImplementation((dto: LoginDto) =>
    Promise.resolve({ status: 'success', tokens: { accessToken: 'token' } }),
  ),
  forgotPassword: jest.fn().mockImplementation((dto: ForgotPasswordDto) =>
    Promise.resolve({ status: 'success', message: 'OTP sent' }),
  ),
  resetPassword: jest.fn().mockImplementation((dto: ResetPasswordDto) =>
    Promise.resolve({ status: 'success', message: 'Password reset successful' }),
  ),
  logout: jest.fn().mockImplementation((dto: LogoutDto) =>
    Promise.resolve({ status: 'success', message: 'Logged out' }),
  ),
  deleteUser: jest.fn().mockImplementation((id: number) =>
    Promise.resolve({ status: 'success', message: `User ${id} deleted` }),
  ),
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminLevelGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(GoogleAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto: RegisterDto = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '0987654321',
        password: 'Password123',
        confirmPassword: 'Password123',
      };
      const result = await authController.register(dto);
      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ status: 'success', user: { email: 'john@example.com' } });
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP successfully', async () => {
      const dto: VerifyOtpDto = {
        targetValue: '0987654321',
        purpose: 'register',
        otpCode: '123456',
      };
      const result = await authController.verifyOtp(dto);
      expect(authService.verifyOtp).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ status: 'success', message: 'OTP verified' });
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const dto: LoginDto = {
        identifier: 'john@example.com',
        password: 'Password123',
      };
      const result = await authController.login(dto);
      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ status: 'success', tokens: { accessToken: 'token' } });
    });
  });

  describe('forgotPassword', () => {
    it('should request forgot password OTP', async () => {
      const dto: ForgotPasswordDto = {
        identifier: 'john@example.com',
      };
      const result = await authController.forgotPassword(dto);
      expect(authService.forgotPassword).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ status: 'success', message: 'OTP sent' });
    });
  });

  describe('resetPassword', () => {
    it('should reset user password', async () => {
      const dto: ResetPasswordDto = {
        identifier: 'john@example.com',
        otpCode: '123456',
        newPassword: 'NewPassword123',
        confirmNewPassword: 'NewPassword123',
      };
      const result = await authController.resetPassword(dto);
      expect(authService.resetPassword).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ status: 'success', message: 'Password reset successful' });
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      const dto: LogoutDto = {
        refreshToken: 'refresh-token',
      };
      const result = await authController.logout(dto);
      expect(authService.logout).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ status: 'success', message: 'Logged out' });
    });
  });

  describe('me', () => {
    it('should return current authenticated user info', () => {
      const mockReq = {
        user: { userId: 1, email: 'john@example.com', role: 'customer' },
      } as any;
      const result = authController.me(mockReq);
      expect(result).toEqual({
        message: 'Current authenticated user',
        user: mockReq.user,
      });
    });
  });

  describe('adminPing', () => {
    it('should ping admin successfully', () => {
      const mockReq = {
        user: { userId: 2, email: 'admin@example.com', role: 'admin' },
      } as any;
      const result = authController.adminPing(mockReq);
      expect(result).toEqual({
        message: 'Admin access granted',
        user: mockReq.user,
      });
    });
  });

  describe('adminOperationsPing', () => {
    it('should ping operations admin successfully', () => {
      const mockReq = {
        user: { userId: 2, email: 'admin@example.com', role: 'admin' },
      } as any;
      const result = authController.adminOperationsPing(mockReq);
      expect(result).toEqual({
        message: 'Operations admin access granted',
        user: mockReq.user,
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by id', async () => {
      const result = await authController.deleteUser(5);
      expect(authService.deleteUser).toHaveBeenCalledWith(5);
      expect(result).toEqual({ status: 'success', message: 'User 5 deleted' });
    });
  });
});
