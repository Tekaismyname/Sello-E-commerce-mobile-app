import { useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";

const normalize = (value: string) => value.trim().toLowerCase();

const hasWildcardMatch = (granted: string, expected: string) => {
  if (granted === "*") return true;
  if (!granted.endsWith(":*")) return false;

  const prefix = granted.slice(0, -1);
  return expected.startsWith(prefix);
};

export function usePermissions() {
  const { user } = useAuth();

  const role = user?.role ?? "";
  const normalizedRole = normalize(role);
  const isAdmin = normalizedRole.includes("admin");
  const permissions = useMemo(
    () => (user?.permissions ?? []).map(normalize),
    [user?.permissions],
  );

  const hasPermission = (permission: string) => {
    if (!permission.trim()) return true;
    if (!isAdmin) return false;
    // Fail closed: an admin whose permission list is missing/empty (e.g. a stale
    // cached user) gets no privileged actions rather than all of them. Fresh
    // permissions are re-fetched on app start via authService.me().
    if (!permissions.length) return false;

    const expected = normalize(permission);
    return permissions.some(
      (granted) => granted === expected || hasWildcardMatch(granted, expected),
    );
  };

  return {
    isAdmin,
    role,
    permissions,
    hasPermission,
  };
}
