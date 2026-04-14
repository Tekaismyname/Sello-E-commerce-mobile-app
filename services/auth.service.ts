import { API_BASE_URL_CANDIDATES, API_ENDPOINTS } from "@/constants/api";
import * as WebBrowser from "expo-web-browser";
import {
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from "@/types/auth";

WebBrowser.maybeCompleteAuthSession();

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response | null = null;
  const triedBaseUrls: string[] = [];

  for (const baseUrl of API_BASE_URL_CANDIDATES) {
    triedBaseUrls.push(baseUrl);

    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
      });
      break;
    } catch {
      continue;
    }
  }

  if (!response) {
    throw new Error(
      `Không thể kết nối backend. Đã thử: ${triedBaseUrls.join(", ")}.`,
    );
  }

  const raw = await response.text();
  let payload: Record<string, unknown> = {};

  if (raw) {
    try {
      payload = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      payload = {};
    }
  }

  if (!response.ok) {
    const message = typeof payload.message === "string" ? payload.message : "Yêu cầu thất bại";
    throw new Error(message);
  }

  return payload as T;
}

async function resolveReachableBaseUrl(): Promise<string> {
  for (const baseUrl of API_BASE_URL_CANDIDATES) {
    try {
      const response = await fetch(`${baseUrl}/home`, { method: "GET" });
      if (response.ok) {
        return baseUrl;
      }
    } catch {
      continue;
    }
  }

  throw new Error(
    `Không thể kết nối backend để đăng nhập Google. Đã thử: ${API_BASE_URL_CANDIDATES.join(", ")}`,
  );
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  let payload: Record<string, unknown> = {};

  if (raw) {
    try {
      payload = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      payload = {};
    }
  }

  if (!response.ok) {
    const message = typeof payload.message === "string" ? payload.message : "Yêu cầu thất bại";
    throw new Error(message);
  }

  return payload as T;
}

export const authService = {
  register(payload: RegisterPayload) {
    return request<RegisterResponse>(API_ENDPOINTS.auth.register, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  login(payload: LoginPayload) {
    return request<LoginResponse>(API_ENDPOINTS.auth.login, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  forgotPassword(payload: ForgotPasswordPayload) {
    return request<ForgotPasswordResponse>(API_ENDPOINTS.auth.forgotPassword, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  verifyOtp(payload: VerifyOtpPayload) {
    return request<VerifyOtpResponse>(API_ENDPOINTS.auth.verifyOtp, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  resetPassword(payload: ResetPasswordPayload) {
    return request<ResetPasswordResponse>(API_ENDPOINTS.auth.resetPassword, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  logout(refreshToken: string) {
    return request<{ message: string; clearTokens: boolean }>(
      API_ENDPOINTS.auth.logout,
      {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      },
    );
  },

  me(accessToken: string) {
    return request<{ message: string; user: { sub: number; email: string; phone: string; role: string; adminLevel: number | null; permissions: string[] } }>(
      API_ENDPOINTS.auth.me,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
  },

  async loginWithGoogle() {
    const baseUrl = await resolveReachableBaseUrl();

    const authUrl = `${baseUrl}${API_ENDPOINTS.auth.google}`;
    const callbackPrefix = `${baseUrl}/auth/google/callback`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, callbackPrefix);

    if (result.type !== "success") {
      throw new Error("Bạn đã huỷ đăng nhập Google.");
    }

    if (!result.url?.startsWith(callbackPrefix)) {
      throw new Error("Không nhận được callback Google hợp lệ từ backend.");
    }

    const callbackResponse = await fetch(result.url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    return parseJsonResponse<LoginResponse>(callbackResponse);
  },
};
