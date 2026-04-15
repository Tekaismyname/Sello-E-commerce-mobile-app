import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { URL } from 'node:url';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/auth.dto';
import { LogoutDto } from './dto/logout.dto';
import { OtpDeliveryMethod, User, UserOtp } from './types/auth.types';
import { JwtTokenService } from './services/jwt-token.service';
import { MySqlDatabaseService } from './services/mysql-database.service';
import { OtpService } from './services/otp.service';
import { PasswordService } from './services/password.service';

type AuthLoginResult = {
  message: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
  };
  user: {
    id: number;
    fullName: string;
    email: string;
    phone: string | null;
    role: string;
    adminLevel: number | null;
    status: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    permissions: ReturnType<MySqlDatabaseService['getPermissionsForUser']>;
  };
};

type AuthRedirectState = {
  appRedirectUri?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly database: MySqlDatabaseService,
    private readonly otpService: OtpService,
    private readonly passwordService: PasswordService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async register(payload: RegisterDto) {
    this.validateRegisterPayload(payload);

    const existingUser = await this.database.findUserByEmailOrPhone(
      payload.email,
      payload.phone,
    );

    if (existingUser) {
      throw new BadRequestException('Email or phone already exists');
    }

    const user = await this.database.createUser({
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      passwordHash: this.passwordService.hash(payload.password),
      role: 'customer',
      adminLevel: null,
      status: 'active',
      isVerified: false,
    });

    if (!user) {
      throw new BadRequestException('Failed to create user');
    }

    const otpRecord = await this.otpService.issueOtp({
      targetValue: this.resolveOtpTargetValue(
        payload.deliveryMethod,
        user.email,
        user.phone,
      ),
      purpose: 'register',
      userId: user.id,
      deliveryMethod: payload.deliveryMethod,
      recipientEmail: user.email,
      recipientPhone: user.phone,
    });

    return {
      message: 'Registration successful, please verify OTP',
      user: this.toSafeUser(user),
      otp: this.toOtpResponse(otpRecord),
    };
  }

  async verifyOtp(payload: VerifyOtpDto) {
    this.validateVerifyOtpPayload(payload);

    const otpRecord = await this.database.findLatestOtp(
      payload.targetValue,
      payload.purpose,
    );

    if (!otpRecord || !this.otpService.isOtpUsable(otpRecord, payload.otpCode)) {
      throw new BadRequestException('OTP is invalid or expired');
    }

    await this.database.markOtpAsUsed(otpRecord.id);

    if (payload.purpose === 'register') {
      const user = await this.database.findUserById(otpRecord.userId);

      if (!user) {
        throw new NotFoundException('User to verify was not found');
      }

      await this.database.updateUser(user.id, { isVerified: true });

      return {
        message: 'Account verification successful',
        user: this.toSafeUser((await this.database.findUserById(user.id))!),
      };
    }

    return {
      message: 'OTP is valid',
    };
  }

  async login(payload: LoginDto): Promise<AuthLoginResult> {
    this.validateLoginPayload(payload);

    const user = await this.database.findUserByIdentifier(payload.identifier);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('User is blocked');
    }

    if (!this.passwordService.verify(payload.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid password');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('User has not verified OTP');
    }

    const permissions = this.database.getPermissionsForUser(user);
    const accessToken = this.jwtTokenService.sign({
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      adminLevel: user.adminLevel,
      permissions,
      type: 'access',
    });
    const refreshToken = this.jwtTokenService.sign(
      {
        sub: user.id,
        role: user.role,
        adminLevel: user.adminLevel,
        type: 'refresh',
      },
      7 * 24 * 60 * 60,
    );

    await this.database.createRefreshToken({
      userId: user.id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: this.getRefreshTokenExpiryDate(refreshToken),
    });

    return {
      message: 'Login successful',
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
      },
      user: {
        ...this.toSafeUser(user),
        permissions,
      },
    };
  }

  async oAuthLogin(userPayload: any): Promise<AuthLoginResult> {
    if (!userPayload || !userPayload.email) {
      throw new BadRequestException('Invalid OAuth payload');
    }

    let user = await this.database.findUserByIdentifier(userPayload.email);

    if (!user) {
      user = await this.database.createUser({
        fullName: userPayload.fullName || 'OAuth User',
        email: userPayload.email,
        phone: undefined as any, // Bỏ qua số điện thoại vì user đăng nhập bằng Google
        passwordHash: '', // User đăng nhập qua OAuth không có password
        role: 'customer',
        adminLevel: null,
        status: 'active',
        isVerified: true, // User từ Google đã được xác thực email
      });

      if (!user) {
        throw new BadRequestException('Failed to create user from OAuth');
      }
    } else if (!user.isVerified) {
      await this.database.updateUser(user.id, { isVerified: true });
      user = (await this.database.findUserById(user.id))!;
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('User is blocked');
    }

    const permissions = this.database.getPermissionsForUser(user);
    const accessToken = this.jwtTokenService.sign({
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      adminLevel: user.adminLevel,
      permissions,
      type: 'access',
    });
    const refreshToken = this.jwtTokenService.sign(
      {
        sub: user.id,
        role: user.role,
        adminLevel: user.adminLevel,
        type: 'refresh',
      },
      7 * 24 * 60 * 60,
    );

    await this.database.createRefreshToken({
      userId: user.id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: this.getRefreshTokenExpiryDate(refreshToken),
    });

    return {
      message: 'OAuth Login successful',
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
      },
      user: {
        ...this.toSafeUser(user),
        permissions,
      },
    };
  }

  extractRedirectUriFromState(stateValue: string | string[] | undefined) {
    if (typeof stateValue !== 'string' || !stateValue.trim()) {
      return null;
    }

    try {
      const parsedState = JSON.parse(
        Buffer.from(stateValue, 'base64url').toString('utf8'),
      ) as AuthRedirectState;

      return this.resolveOAuthRedirectUri(parsedState.appRedirectUri);
    } catch {
      return null;
    }
  }

  buildOAuthSuccessRedirectUrl(
    loginResponse: AuthLoginResult,
    requestedRedirectUri?: string | null,
  ) {
    const redirectUri = this.resolveOAuthRedirectUri(requestedRedirectUri);

    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set(
      'accessToken',
      loginResponse.tokens.accessToken,
    );
    redirectUrl.searchParams.set(
      'refreshToken',
      loginResponse.tokens.refreshToken,
    );
    redirectUrl.searchParams.set('tokenType', loginResponse.tokens.tokenType);
    redirectUrl.searchParams.set('message', loginResponse.message);
    redirectUrl.searchParams.set('user', JSON.stringify(loginResponse.user));

    return redirectUrl.toString();
  }

  async logout(payload: LogoutDto) {
    this.validateRefreshToken(payload.refreshToken);

    const decodedToken = this.jwtTokenService.decode(payload.refreshToken);

    if (!decodedToken || decodedToken.type !== 'refresh') {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    const tokenRecord = await this.database.findActiveRefreshToken(
      this.hashToken(payload.refreshToken),
    );

    if (!tokenRecord || tokenRecord.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException(
        'Logout failed because refresh token is invalid or already revoked',
      );
    }

    await this.database.revokeRefreshToken(tokenRecord.id);

    return {
      message: 'Logout successful',
      clearTokens: true,
    };
  }

  async deleteUser(userId: number) {
    const user = await this.database.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.database.deleteUser(userId);

    return {
      message: 'User deleted successfully',
      userId,
    };
  }

  async forgotPassword(payload: ForgotPasswordDto) {
    this.validateIdentifier(payload.identifier);
    this.validateDeliveryMethod(payload.deliveryMethod);

    const user = await this.database.findUserByIdentifier(payload.identifier);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otpRecord = await this.otpService.issueOtp({
      targetValue: this.resolveForgotPasswordTargetValue(
        payload.deliveryMethod,
        user.email,
        user.phone,
      ),
      purpose: 'reset_password',
      userId: user.id,
      deliveryMethod: payload.deliveryMethod,
      recipientEmail: user.email,
      recipientPhone: user.phone,
    });

    return {
      message: 'Reset password OTP sent successfully',
      user: this.toSafeUser(user),
      otp: this.toOtpResponse(otpRecord),
    };
  }

  async resetPassword(payload: ResetPasswordDto) {
    this.validateResetPasswordPayload(payload);

    const user = await this.database.findUserByIdentifier(payload.identifier);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otpRecord = await this.database.findLatestOtp(
      payload.targetValue,
      'reset_password',
    );

    if (!otpRecord || !this.otpService.isOtpUsable(otpRecord, payload.otpCode)) {
      throw new BadRequestException('OTP is invalid or expired');
    }

    await this.database.updateUser(user.id, {
      passwordHash: this.passwordService.hash(payload.newPassword),
    });
    await this.database.markOtpAsUsed(otpRecord.id);

    return {
      message: 'Password reset successful',
      user: this.toSafeUser((await this.database.findUserById(user.id))!),
    };
  }

  private toSafeUser(user: User) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      adminLevel: user.adminLevel,
      status: user.status,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toOtpResponse(otpRecord: UserOtp) {
    return {
      purpose: otpRecord.purpose,
      targetValue: otpRecord.targetValue,
      expiredAt: otpRecord.expiredAt,
      otpCodePreview: otpRecord.otpCode,
    };
  }

  private validateRegisterPayload(payload: RegisterDto) {
    if (!payload.fullName?.trim()) {
      throw new BadRequestException('Full name is required');
    }

    this.validateEmail(payload.email);
    this.validatePhone(payload.phone);
    this.validatePassword(payload.password);
    this.validateDeliveryMethod(payload.deliveryMethod);

    if (payload.password !== payload.confirmPassword) {
      throw new BadRequestException('Password confirmation does not match');
    }
  }

  private validateVerifyOtpPayload(payload: VerifyOtpDto) {
    this.validateIdentifier(payload.targetValue);
    this.validateOtpCode(payload.otpCode);

    if (!['register', 'reset_password'].includes(payload.purpose)) {
      throw new BadRequestException('OTP purpose is invalid');
    }
  }

  private validateLoginPayload(payload: LoginDto) {
    this.validateIdentifier(payload.identifier);
    this.validatePassword(payload.password);
  }

  private validateResetPasswordPayload(payload: ResetPasswordDto) {
    this.validateIdentifier(payload.identifier);
    this.validateIdentifier(payload.targetValue);
    this.validateOtpCode(payload.otpCode);
    this.validatePassword(payload.newPassword);

    if (payload.newPassword !== payload.confirmNewPassword) {
      throw new BadRequestException(
        'New password confirmation does not match',
      );
    }
  }

  private validateIdentifier(identifier: string) {
    if (!identifier?.trim()) {
      throw new BadRequestException('Email or phone is required');
    }
  }

  private validateEmail(email: string) {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email ?? '');

    if (!isValidEmail) {
      throw new BadRequestException('Email is invalid');
    }
  }

  private validatePhone(phone: string) {
    const isValidPhone = /^[0-9]{9,15}$/.test(phone ?? '');

    if (!isValidPhone) {
      throw new BadRequestException('Phone number is invalid');
    }
  }

  private validatePassword(password: string) {
    if (!password || password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
  }

  private validateOtpCode(otpCode: string) {
    if (!/^[0-9]{6}$/.test(otpCode ?? '')) {
      throw new BadRequestException('OTP must contain 6 digits');
    }
  }

  private validateDeliveryMethod(deliveryMethod: OtpDeliveryMethod) {
    if (!['email', 'phone'].includes(deliveryMethod)) {
      throw new BadRequestException('OTP delivery method is invalid');
    }
  }

  private resolveOtpTargetValue(
    deliveryMethod: OtpDeliveryMethod,
    email: string,
    phone: string,
  ) {
    if (deliveryMethod === 'email') {
      return email;
    }

    return phone;
  }

  private resolveForgotPasswordTargetValue(
    deliveryMethod: OtpDeliveryMethod,
    email: string,
    phone: string,
  ) {
    return this.resolveOtpTargetValue(deliveryMethod, email, phone);
  }

  private validateRefreshToken(refreshToken: string) {
    if (!refreshToken?.trim()) {
      throw new BadRequestException('Refresh token is required');
    }
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private getRefreshTokenExpiryDate(token: string) {
    const payload = this.jwtTokenService.decode(token);
    const exp = typeof payload?.exp === 'number' ? payload.exp : null;

    if (!exp) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    return new Date(exp * 1000);
  }

  private resolveOAuthRedirectUri(redirectUri?: string | null) {
    const fallbackRedirectUri =
      process.env.APP_AUTH_REDIRECT_URI?.trim() ||
      'selloecommerce://auth/callback';
    const candidateUri = redirectUri?.trim() || fallbackRedirectUri;

    try {
      const parsedUrl = new URL(candidateUri);
      const allowedProtocols = new Set(['selloecommerce:', 'exp:', 'exps:']);

      if (!allowedProtocols.has(parsedUrl.protocol)) {
        return fallbackRedirectUri;
      }

      return parsedUrl.toString();
    } catch {
      return fallbackRedirectUri;
    }
  }
}
