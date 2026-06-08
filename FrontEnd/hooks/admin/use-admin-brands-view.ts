import { useCallback, useEffect, useMemo, useState } from "react";
import { adminService } from "@/services/admin.service";
import { AdminBrand, CreateAdminBrandPayload, UpdateAdminBrandPayload } from "@/types/admin";

export function useAdminBrandsView(token: string) {
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchBrands = useCallback(async () => {
    if (!token) {
      setError("Vui long dang nhap tai khoan admin.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await adminService.listBrands(token);
      setBrands(response.data ?? []);
    } catch (err: any) {
      setError(err.message ?? "Khong the tai danh sach brand.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const createBrand = useCallback(
    async (payload: CreateAdminBrandPayload) => {
      if (!token) return null;
      setSaving(true);
      try {
        const response = await adminService.createBrand(token, payload);
        await fetchBrands();
        return response.data;
      } finally {
        setSaving(false);
      }
    },
    [fetchBrands, token],
  );

  const updateBrand = useCallback(
    async (brandId: number, payload: UpdateAdminBrandPayload) => {
      if (!token) return null;
      setSaving(true);
      try {
        const response = await adminService.updateBrand(token, brandId, payload);
        await fetchBrands();
        return response.data;
      } finally {
        setSaving(false);
      }
    },
    [fetchBrands, token],
  );

  const updateBrandStatus = useCallback(
    async (brandId: number, status: "active" | "inactive") => {
      if (!token) return null;
      setSaving(true);
      try {
        const response = await adminService.updateBrandStatus(token, brandId, status);
        await fetchBrands();
        return response.data;
      } finally {
        setSaving(false);
      }
    },
    [fetchBrands, token],
  );

  const filteredBrands = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return brands;

    return brands.filter((item) => {
      return (
        item.name.toLowerCase().includes(keyword) ||
        (item.slug ?? "").toLowerCase().includes(keyword) ||
        String(item.id).includes(keyword)
      );
    });
  }, [brands, search]);

  return {
    brands,
    filteredBrands,
    loading,
    saving,
    error,
    search,
    setSearch,
    fetchBrands,
    createBrand,
    updateBrand,
    updateBrandStatus,
  };
}
