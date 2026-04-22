import { useCallback, useEffect, useState } from "react";
import { notificationService } from "@/services/customer.service";
import { Notification } from "@/types/customer";

export function useNotificationsView(token: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setError("Vui long dang nhap de xem thong bao.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getNotifications(token);
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

  const markRead = useCallback(
    async (notificationId: number) => {
      if (!token) return;
      setSaving(true);

      try {
        await notificationService.markNotificationRead(token, notificationId);
        await fetchNotifications();
      } finally {
        setSaving(false);
      }
    },
    [fetchNotifications, token],
  );

  const markAllRead = useCallback(async () => {
    if (!token) return;
    setSaving(true);

    try {
      await notificationService.markAllNotificationsRead(token);
      await fetchNotifications();
    } finally {
      setSaving(false);
    }
  }, [fetchNotifications, token]);

  return {
    notifications,
    loading,
    saving,
    error,
    fetchNotifications,
    markRead,
    markAllRead,
  };
}
