import { useCallback, useEffect, useMemo, useState } from "react";
import { adminService } from "@/services/admin.service";
import { AdminOrder } from "@/types/admin";

export type AdminOrderFilter = "all" | "pending" | "shipping";

const STATUS_FILTER_MAP: Record<Exclude<AdminOrderFilter, "all">, AdminOrder["orderStatus"][]> = {
  pending: ["pending", "confirmed", "packed"],
  shipping: ["shipping"],
};

export function useAdminOrdersView(
  token: string,
  enabled = true,
  noPermissionMessage = "Ban khong co quyen xem danh sach don hang.",
) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState<AdminOrderFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!enabled) {
      setError(noPermissionMessage);
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Vui long dang nhap tai khoan admin.");
      setLoading(false);
      return;
    }

    try {
      const response = await adminService.listOrders(token);
      setOrders(response.data ?? []);
    } catch (err: any) {
      setError(err.message ?? "Khong the tai danh sach don hang.");
    } finally {
      setLoading(false);
    }
  }, [enabled, noPermissionMessage, token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchText =
        !keyword ||
        order.orderCode.toLowerCase().includes(keyword) ||
        order.user.fullName.toLowerCase().includes(keyword) ||
        order.user.email.toLowerCase().includes(keyword);

      const matchStatus =
        filter === "all" ? true : STATUS_FILTER_MAP[filter].includes(order.orderStatus);

      return matchText && matchStatus;
    });
  }, [filter, orders, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);

  const pagedOrders = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSize, safePage]);

  const metrics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((order) =>
      STATUS_FILTER_MAP.pending.includes(order.orderStatus),
    ).length;
    const shipping = orders.filter((order) => order.orderStatus === "shipping").length;
    const monthlyRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      total,
      pending,
      shipping,
      monthlyRevenue,
    };
  }, [orders]);

  useEffect(() => {
    if (safePage !== page) {
      setPage(safePage);
    }
  }, [page, safePage]);

  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  return {
    orders,
    pagedOrders,
    filter,
    search,
    page: safePage,
    pageCount,
    pageSize,
    loading,
    error,
    metrics,
    setFilter,
    setSearch,
    setPage,
    fetchOrders,
  };
}
