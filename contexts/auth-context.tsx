import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthUser, LoginResponse } from "@/types/auth";

// ─── Storage Keys ─────────────────────────────────────────
const STORAGE_KEYS = {
  accessToken: "@sello/access_token",
  refreshToken: "@sello/refresh_token",
  user: "@sello/user",
} as const;

// ─── Context Types ────────────────────────────────────────
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  /** Call after a successful login/register — persists tokens + user. */
  signIn: (loginResponse: LoginResponse) => Promise<void>;
  /** Clears all stored auth data. */
  signOut: () => Promise<void>;
  /** Alias for accessToken for convenience. */
  token: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    refreshToken: null,
    user: null,
    isLoading: true,
  });

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const [accessToken, refreshToken, userJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.accessToken),
          AsyncStorage.getItem(STORAGE_KEYS.refreshToken),
          AsyncStorage.getItem(STORAGE_KEYS.user),
        ]);

        let user: AuthUser | null = null;

        if (userJson) {
          try {
            user = JSON.parse(userJson) as AuthUser;
          } catch {
            user = null;
          }
        }

        setState({
          accessToken: accessToken ?? null,
          refreshToken: refreshToken ?? null,
          user,
          isLoading: false,
        });
      } catch {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    })();
  }, []);

  const signIn = useCallback(async (loginResponse: LoginResponse) => {
    const { tokens, user } = loginResponse;

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken),
      AsyncStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken),
      AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user)),
    ]);

    setState({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
      isLoading: false,
    });
  }, []);

  const signOut = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.accessToken),
      AsyncStorage.removeItem(STORAGE_KEYS.refreshToken),
      AsyncStorage.removeItem(STORAGE_KEYS.user),
    ]);

    setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoading: false,
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      token: state.accessToken ?? "",
      signIn,
      signOut,
    }),
    [state, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }

  return ctx;
}
