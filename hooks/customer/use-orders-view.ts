import { useCallback, useEffect, useMemo, useState } from "react";
import { orderService } from "@/services/customer.service";
import { Order, OrderStatus } from "@/types/customer";

export type CustomerOrderFilter = "all" | "pending" | "shipping" | "delivered" | "cancelled";

export function useOrdersView(token: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<CustomerOrderFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Vui long dang nhap de xem don hang.");
      setLoading(false);
      return;
    }

    try {
      const response = await orderService.getMyOrders(token);
      setOrders(response.data);
    } catch (err: any) {
      setError(err.message ?? "Khong the tai danh sach don hang.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;

    if (filter === "shipping") {
      return orders.filter(
        (order) =>
          order.status === "shipping" ||
          order.status === "packed" ||
          order.status === "confirmed",
      );
    }

    return orders.filter((order) => order.status === (filter as OrderStatus));
  }, [filter, orders]);

  return {
    orders,
    filteredOrders,
    filter,
    loading,
    error,
    setFilter,
    fetchOrders,
  };
}
