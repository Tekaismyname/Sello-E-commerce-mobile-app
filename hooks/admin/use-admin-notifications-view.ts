import { useCallback, useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import { AdminNotification, CreateAdminNotificationPayload } from "@/types/admin";

export function useAdminNotificationsView(token: string) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setError("Vui long dang nhap tai khoan admin.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await adminService.listNotifications(token);
      setNotifications(response.data ?? []);
    } catch (err: any) {
      setError(err.message ?? "Khong the tai thong bao.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const createNotification = useCallback(
    async (payload: CreateAdminNotificationPayload) => {
      if (!token) return null;
      setSubmitting(true);
      try {
        const response = await adminService.createNotification(token, payload);
        await fetchNotifications();
        return response.data;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchNotifications, token],
  );

  return {
    notifications,
    loading,
    submitting,
    error,
    fetchNotifications,
    createNotification,
  };
}
