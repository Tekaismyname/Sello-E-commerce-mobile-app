import { useCallback, useEffect, useMemo, useState } from "react";
import { adminService } from "@/services/admin.service";
import { AdminVoucher, CreateAdminVoucherPayload, UpdateAdminVoucherPayload } from "@/types/admin";

export function useAdminVouchersView(token: string) {
  const [vouchers, setVouchers] = useState<AdminVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchVouchers = useCallback(async () => {
    if (!token) {
      setError("Vui long dang nhap tai khoan admin.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await adminService.listVouchers(token);
      setVouchers(response.data ?? []);
    } catch (err: any) {
      setError(err.message ?? "Khong the tai danh sach voucher.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const createVoucher = useCallback(
    async (payload: CreateAdminVoucherPayload) => {
      if (!token) return null;
      setSaving(true);
      try {
        const response = await adminService.createVoucher(token, payload);
        await fetchVouchers();
        return response.data;
      } finally {
        setSaving(false);
      }
    },
    [fetchVouchers, token],
  );

  const updateVoucher = useCallback(
    async (voucherId: number, payload: UpdateAdminVoucherPayload) => {
      if (!token) return null;
      setSaving(true);
      try {
        const response = await adminService.updateVoucher(token, voucherId, payload);
        await fetchVouchers();
        return response.data;
      } finally {
        setSaving(false);
      }
    },
    [fetchVouchers, token],
  );

  const updateVoucherStatus = useCallback(
    async (voucherId: number, isActive: boolean) => {
      if (!token) return null;
      setSaving(true);
      try {
        const response = await adminService.updateVoucherStatus(token, voucherId, isActive);
        await fetchVouchers();
        return response.data;
      } finally {
        setSaving(false);
      }
    },
    [fetchVouchers, token],
  );

  const deleteVoucher = useCallback(
    async (voucherId: number) => {
      if (!token) return null;
      setSaving(true);
      try {
        const response = await adminService.deleteVoucher(token, voucherId);
        await fetchVouchers();
        return response.data;
      } finally {
        setSaving(false);
      }
    },
    [fetchVouchers, token],
  );

  const filteredVouchers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return vouchers;

    return vouchers.filter((item) => {
      return (
        item.code.toLowerCase().includes(keyword) ||
        item.name.toLowerCase().includes(keyword) ||
        String(item.id).includes(keyword)
      );
    });
  }, [search, vouchers]);

  return {
    vouchers,
    filteredVouchers,
    loading,
    saving,
    error,
    search,
    setSearch,
    fetchVouchers,
    createVoucher,
    updateVoucher,
    updateVoucherStatus,
    deleteVoucher,
  };
}
