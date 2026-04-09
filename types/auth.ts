export type OtpPurpose = "register" | "reset_password";
export type OtpDeliveryMethod = "email" | "phone";

export type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  deliveryMethod: OtpDeliveryMethod;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type ForgotPasswordPayload = {
  identifier: string;
  deliveryMethod: OtpDeliveryMethod;
};

export type VerifyOtpPayload = {
  targetValue: string;
  purpose: OtpPurpose;
  otpCode: string;
};

export type ResetPasswordPayload = {
  identifier: string;
  targetValue: string;
  otpCode: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  isVerified: boolean;
  permissions?: string[];
};

export type OtpIssueResponse = {
  message: string;
  user: AuthUser;
  otp: {
    purpose: OtpPurpose;
    targetValue: string;
    expiredAt: string;
    otpCodePreview?: string;
  };
};

export type RegisterResponse = OtpIssueResponse;
export type ForgotPasswordResponse = OtpIssueResponse;

export type VerifyOtpResponse = {
  message: string;
  user?: AuthUser;
};

export type LoginResponse = {
  message: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
  };
  user: AuthUser;
};

export type ResetPasswordResponse = {
  message: string;
  user: AuthUser;
};

