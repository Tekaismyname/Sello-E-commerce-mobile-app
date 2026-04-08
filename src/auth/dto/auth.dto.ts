import { AuthPurpose, OtpDeliveryMethod } from '../types/auth.types';

export class RegisterDto {
  fullName!: string;
  email!: string;
  phone!: string;
  password!: string;
  confirmPassword!: string;
  deliveryMethod!: OtpDeliveryMethod;
}

export class VerifyOtpDto {
  targetValue!: string;
  purpose!: AuthPurpose;
  otpCode!: string;
}

export class LoginDto {
  identifier!: string;
  password!: string;
}

export class ForgotPasswordDto {
  identifier!: string;
  deliveryMethod!: OtpDeliveryMethod;
}

export class ResetPasswordDto {
  identifier!: string;
  targetValue!: string;
  otpCode!: string;
  newPassword!: string;
  confirmNewPassword!: string;
}
