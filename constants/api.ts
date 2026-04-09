import Constants from "expo-constants";
import { Platform } from "react-native";

const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

const isLocalhostUrl = (value: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(value);

const replaceHostKeepingPort = (url: string, host: string) => {
  try {
    const parsed = new URL(url);
    parsed.hostname = host;
    return trimTrailingSlash(parsed.toString());
  } catch {
    return trimTrailingSlash(url);
  }
};

const resolveExpoDevHost = () => {
  const hostUriFromConfig = Constants.expoConfig?.hostUri;
  const maybeHostUri =
    typeof hostUriFromConfig === "string" && hostUriFromConfig
      ? hostUriFromConfig
      : undefined;

  if (!maybeHostUri) {
    return null;
  }

  const host = maybeHostUri.split(":")[0]?.trim();

  if (!host || host === "localhost" || host === "127.0.0.1") {
    return null;
  }

  return host;
};

const resolveApiBaseUrl = () => {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (envBaseUrl) {
    if (Platform.OS === "android" && isLocalhostUrl(envBaseUrl)) {
      return replaceHostKeepingPort(envBaseUrl, "10.0.2.2");
    }

    return trimTrailingSlash(envBaseUrl);
  }

  if (Platform.OS !== "web") {
    const expoDevHost = resolveExpoDevHost();

    if (expoDevHost) {
      return `http://${expoDevHost}:3000`;
    }
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }

  return "http://127.0.0.1:3000";
};

export const API_BASE_URL = resolveApiBaseUrl();

export const API_ENDPOINTS = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    forgotPassword: "/auth/forgot-password",
    verifyOtp: "/auth/verify-otp",
    resetPassword: "/auth/reset-password",
  },
  main: {
    home: "/home",
  },
} as const;
