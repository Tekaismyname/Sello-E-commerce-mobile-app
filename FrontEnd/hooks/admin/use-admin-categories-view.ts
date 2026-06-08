import { useCallback, useEffect, useMemo, useState } from "react";
import { adminService } from "@/services/admin.service";
import { AdminCategory, CreateAdminCategoryPayload, UpdateAdminCategoryPayload } from "@/types/admin";

export function useAdminCategoriesView(token: string) {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchCategories = useCallback(async () => {
    if (!token) {
      setError("Vui long dang nhap tai khoan admin.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await adminService.listCategories(token);
      setCategories(response.data ?? []);
    } catch (err: any) {
      setError(err.message ?? "Khong the tai danh sach danh muc.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = useCallback(
    async (payload: CreateAdminCategoryPayload) => {
      if (!token) return null;
      setSaving(true);
      try {
        const response = await adminService.createCategory(token, payload);
        await fetchCategories();
        return response.data;
      } finally {
        setSaving(false);
      }
    },
    [fetchCategories, token],
  );

  const updateCategory = useCallback(
    async (categoryId: number, payload: UpdateAdminCategoryPayload) => {
      if (!token) return null;
      setSaving(true);
      try {
        const response = await adminService.updateCategory(token, categoryId, payload);
        await fetchCategories();
        return response.data;
      } finally {
        setSaving(false);
      }
    },
    [fetchCategories, token],
  );

  const updateCategoryStatus = useCallback(
    async (categoryId: number, status: "active" | "inactive") => {
      if (!token) return null;
      setSaving(true);
      try {
        const response = await adminService.updateCategoryStatus(token, categoryId, status);
        await fetchCategories();
        return response.data;
      } finally {
        setSaving(false);
      }
    },
    [fetchCategories, token],
  );

  const deleteCategory = useCallback(
    async (categoryId: number) => {
      if (!token) return null;
      setSaving(true);
      try {
        const response = await adminService.deleteCategory(token, categoryId);
        await fetchCategories();
        return response.data;
      } finally {
        setSaving(false);
      }
    },
    [fetchCategories, token],
  );

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return categories;

    return categories.filter((item) => {
      return (
        item.name.toLowerCase().includes(keyword) ||
        (item.slug ?? "").toLowerCase().includes(keyword) ||
        String(item.id).includes(keyword)
      );
    });
  }, [categories, search]);

  return {
    categories,
    filteredCategories,
    loading,
    saving,
    error,
    search,
    setSearch,
    fetchCategories,
    createCategory,
    updateCategory,
    updateCategoryStatus,
    deleteCategory,
  };
}
