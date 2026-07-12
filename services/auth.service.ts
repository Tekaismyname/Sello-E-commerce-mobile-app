import { API_BASE_URL_CANDIDATES, API_ENDPOINTS } from "@/constants/api";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
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

const GOOGLE_CALLBACK_PATH = "auth/callback";
const APP_SCHEME = "selloecommerce";

function isRunningInExpoGo() {
  return Constants.executionEnvironment === "storeClient";
}

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
      const idx = API_BASE_URL_CANDIDATES.indexOf(baseUrl);
      if (idx > 0) {
        API_BASE_URL_CANDIDATES.splice(idx, 1);
        API_BASE_URL_CANDIDATES.unshift(baseUrl);
      }
      break;
    } catch {
      continue;
    }
  }

  if (!response) {
    throw new Error(`Khong the ket noi backend. Da thu: ${triedBaseUrls.join(", ")}.`);
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
    const message =
      typeof payload.message === "string" ? payload.message : "Yeu cau that bai";
    throw new Error(message);
  }

  return payload as T;
}

async function resolveReachableBaseUrl(): Promise<string> {
  for (const baseUrl of API_BASE_URL_CANDIDATES) {
    try {
      const response = await fetch(`${baseUrl}/home`, { method: "GET" });
      if (response.ok) {
        const idx = API_BASE_URL_CANDIDATES.indexOf(baseUrl);
        if (idx > 0) {
          API_BASE_URL_CANDIDATES.splice(idx, 1);
          API_BASE_URL_CANDIDATES.unshift(baseUrl);
        }
        return baseUrl;
      }
    } catch {
      continue;
    }
  }

  throw new Error(
    `Khong the ket noi backend de dang nhap Google. Da thu: ${API_BASE_URL_CANDIDATES.join(", ")}`,
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
    const message =
      typeof payload.message === "string" ? payload.message : "Yeu cau that bai";
    throw new Error(message);
  }

  return payload as T;
}

function buildGoogleRedirectUrl() {
  if (isRunningInExpoGo()) {
    return Linking.createURL(GOOGLE_CALLBACK_PATH);
  }

  return Linking.createURL(GOOGLE_CALLBACK_PATH, {
    scheme: APP_SCHEME,
  });
}

function appendGoogleRedirectParams(authUrl: string, redirectUrl: string) {
  try {
    const parsed = new URL(authUrl);

    // Support both the new Expo Go param name and a few compatible fallbacks.
    parsed.searchParams.set("appRedirectUri", redirectUrl);
    parsed.searchParams.set("redirect_uri", redirectUrl);
    parsed.searchParams.set("redirectUrl", redirectUrl);
    parsed.searchParams.set("callbackUrl", redirectUrl);

    return parsed.toString();
  } catch {
    return authUrl;
  }
}

function parseBooleanParam(value: string | null) {
  if (!value) {
    return false;
  }

  return value === "true" || value === "1";
}

function parseGoogleLoginResponseFromRedirect(url: string): LoginResponse | null {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }

  const accessToken =
    parsedUrl.searchParams.get("accessToken") ?? parsedUrl.searchParams.get("access_token");
  const refreshToken =
    parsedUrl.searchParams.get("refreshToken") ?? parsedUrl.searchParams.get("refresh_token");

  if (!accessToken || !refreshToken) {
    return null;
  }

  const userParam = parsedUrl.searchParams.get("user");
  let user: LoginResponse["user"] | null = null;

  if (userParam) {
    try {
      user = JSON.parse(userParam) as LoginResponse["user"];
    } catch {
      user = null;
    }
  }

  if (!user) {
    user = {
      id: Number(parsedUrl.searchParams.get("id") ?? 0),
      fullName:
        parsedUrl.searchParams.get("fullName") ??
        parsedUrl.searchParams.get("full_name") ??
        "",
      email: parsedUrl.searchParams.get("email") ?? "",
      phone: parsedUrl.searchParams.get("phone") ?? "",
      role: parsedUrl.searchParams.get("role") ?? "customer",
      status: parsedUrl.searchParams.get("status") ?? "active",
      isVerified: parseBooleanParam(
        parsedUrl.searchParams.get("isVerified") ?? parsedUrl.searchParams.get("is_verified"),
      ),
    };
  }

  return {
    message: parsedUrl.searchParams.get("message") ?? "Login success",
    tokens: {
      accessToken,
      refreshToken,
      tokenType:
        parsedUrl.searchParams.get("tokenType") ??
        parsedUrl.searchParams.get("token_type") ??
        "Bearer",
    },
    user,
  };
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
    return request<{ message: string; clearTokens: boolean }>(API_ENDPOINTS.auth.logout, {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },

  me(accessToken: string) {
    return request<{
      message: string;
      user: {
        id: number;
        fullName: string;
        email: string;
        phone: string;
        role: string;
        adminLevel: number | null;
        status: string;
        isVerified: boolean;
        permissions: string[];
      };
    }>(API_ENDPOINTS.auth.me, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  async loginWithGoogle() {
    const baseUrl = await resolveReachableBaseUrl();
    const appRedirectUrl = buildGoogleRedirectUrl();
    const backendCallbackUrl = `${baseUrl}/auth/google/callback`;
    const authUrl = appendGoogleRedirectParams(
      `${baseUrl}${API_ENDPOINTS.auth.google}`,
      appRedirectUrl,
    );

    const result = await WebBrowser.openAuthSessionAsync(authUrl, appRedirectUrl);

    if (result.type !== "success") {
      throw new Error("Ban da huy dang nhap Google.");
    }

    if (!result.url) {
      throw new Error("Khong nhan duoc callback Google hop le.");
    }

    const redirectPayload = parseGoogleLoginResponseFromRedirect(result.url);
    if (redirectPayload) {
      return redirectPayload;
    }

    if (result.url.startsWith(backendCallbackUrl)) {
      const callbackResponse = await fetch(result.url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      return parseJsonResponse<LoginResponse>(callbackResponse);
    }

    throw new Error("Khong nhan duoc callback Google hop le tu backend hoac app.");
  },
};
