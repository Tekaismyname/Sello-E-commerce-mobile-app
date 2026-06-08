export type UserRole = 'admin' | 'customer';
export type AdminLevel = 1 | 2 | 3;

export type UserStatus = 'active' | 'inactive' | 'blocked';

export type AuthPurpose = 'register' | 'reset_password';
export type OtpDeliveryMethod = 'email' | 'phone';

export type RefreshTokenStatus = 'active' | 'revoked';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  adminLevel: AdminLevel | null;
  status: UserStatus;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserOtp {
  id: number;
  userId: number;
  purpose: AuthPurpose;
  targetValue: string;
  otpCode: string;
  expiredAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

export interface RefreshTokenRecord {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  status: RefreshTokenStatus;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  adminLevel?: AdminLevel | null;
  status: UserStatus;
  isVerified: boolean;
}

export interface CreateOtpInput {
  userId: number;
  purpose: AuthPurpose;
  targetValue: string;
  otpCode: string;
  expiredAt: Date;
}

export interface CreateRefreshTokenInput {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
}

export interface JwtPayload {
  sub: number;
  role: UserRole;
  type: string;
  adminLevel?: AdminLevel | null;
  email?: string;
  phone?: string;
  permissions?: string[];
  iss?: string;
  iat?: number;
  exp?: number;
}

export type RolePermissionMap = Record<UserRole, string[]>;
