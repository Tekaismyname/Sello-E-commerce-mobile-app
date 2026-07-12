import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthUser, LoginResponse } from "@/types/auth";
import { authService } from "@/services/auth.service";
import { notificationStore } from "@/utils/notification-store";
import { wishlistStore } from "@/utils/wishlist-store";

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

        // Refresh role/permissions from the server so admin gating uses the
        // latest data. /auth/me recomputes permissions from the DB, so a
        // successful call always carries the full set for the user's adminLevel.
        if (accessToken && user) {
          try {
            const { user: fresh } = await authService.me(accessToken);
            const mergedUser: AuthUser = {
              ...user,
              role: fresh.role ?? user.role,
              // adminLevel: null is meaningful (customer / unleveled admin),
              // so only fall back when the field is absent entirely.
              adminLevel:
                fresh.adminLevel !== undefined ? fresh.adminLevel : user.adminLevel,
              // Never downgrade to an empty list on a successful response —
              // keep the permissions from the last login instead, so admin
              // write buttons don't vanish because of a partial payload.
              permissions:
                Array.isArray(fresh.permissions) && fresh.permissions.length > 0
                  ? fresh.permissions
                  : user.permissions,
            };
            await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(mergedUser));
            setState((prev) => ({ ...prev, user: mergedUser }));
          } catch (error: any) {
            // /auth/me failed — expired access token (1h lifetime, no refresh
            // flow), offline, or server down. Keep the cached user AND the
            // permissions from the last successful login instead of wiping
            // them; the fail-closed check in use-permissions still protects
            // users that never had permissions. Do NOT sign out here: an
            // expired token after 1h is the normal case, not an attack.
            console.warn(
              "[auth] Could not refresh role/permissions from /auth/me — keeping cached values.",
              error?.message ?? error,
            );
          }
        }
      } catch {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    })();
  }, []);

  const signIn = useCallback(async (loginResponse: LoginResponse) => {
    const { tokens, user } = loginResponse;

    // Badge counts belong to a session: clear leftovers from the previous
    // account right away instead of waiting for the background poll.
    notificationStore.reset();
    wishlistStore.reset();

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
    notificationStore.reset();
    wishlistStore.reset();

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
