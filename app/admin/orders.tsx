import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/services/admin.service";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AdminOrderItem = {
  id: number;
  orderCode: string;
  user: {
    id: number;
    fullName: string;
    email: string;
  };
  paymentMethodName: string;
  totalAmount: number;
  orderStatus:
    | "pending"
    | "confirmed"
    | "packed"
    | "shipping"
    | "delivered"
    | "cancelled"
    | "returned";
  paymentStatus: string;
  placedAt: string;
};

const nextStatusMap: Record<
  AdminOrderItem["orderStatus"],
  AdminOrderItem["orderStatus"]
> = {
  pending: "confirmed",
  confirmed: "packed",
  packed: "shipping",
  shipping: "delivered",
  delivered: "delivered",
  cancelled: "cancelled",
  returned: "returned",
};

export default function AdminOrdersScreen() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Vui lòng đăng nhập tài khoản admin.");
      setLoading(false);
      return;
    }

    try {
      const res = await adminService.listOrders(token);
      setOrders((res.data ?? []) as AdminOrderItem[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (order: AdminOrderItem) => {
    if (!token) return;

    const nextStatus = nextStatusMap[order.orderStatus] ?? order.orderStatus;
    if (nextStatus === order.orderStatus) {
      Alert.alert(
        "Thông báo",
        "Đơn hàng này không thể chuyển tiếp trạng thái.",
      );
      return;
    }

    try {
      await adminService.updateOrderStatus(
        token,
        order.id,
        nextStatus,
        `Cập nhật từ ${order.orderStatus} -> ${nextStatus}`,
      );
      fetchOrders();
    } catch (err: any) {
      Alert.alert("Lỗi", err.message);
    }
  };

  const formatPrice = (value: number) =>
    `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={["top", "bottom"]}>
      <AdminHeader title="Đơn hàng" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-4 pb-24"
      >
        <Text className="text-[22px] font-extrabold text-[#191C1F]">
          Quản lý đơn hàng
        </Text>

        {loading && (
          <View className="mt-10 items-center">
            <ActivityIndicator size="large" color="#006397" />
          </View>
        )}

        {!loading && error && (
          <View className="mt-4 rounded-[12px] bg-white p-4">
            <Text className="text-[14px] font-medium text-[#b3261e]">
              {error}
            </Text>
          </View>
        )}

        {!loading && !error && (
          <View className="mt-4 gap-3">
            {orders.map((order) => (
              <View key={order.id} className="rounded-[14px] bg-white p-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[15px] font-bold text-[#191C1F]">
                    #{order.orderCode || order.id}
                  </Text>
                  <Text className="text-[12px] font-semibold text-[#006397]">
                    {order.orderStatus}
                  </Text>
                </View>

                <Text className="mt-2 text-[13px] text-[#3d4651]">
                  {order.user?.fullName}
                </Text>
                <Text className="text-[12px] text-[#6b7682]">
                  {order.user?.email}
                </Text>
                <Text className="mt-1 text-[12px] text-[#6b7682]">
                  Thanh toán: {order.paymentStatus} - {order.paymentMethodName}
                </Text>
                <Text className="text-[12px] text-[#6b7682]">
                  Đặt lúc: {new Date(order.placedAt).toLocaleString("vi-VN")}
                </Text>
                <Text className="mt-2 text-[16px] font-bold text-[#1f2934]">
                  {formatPrice(order.totalAmount)}
                </Text>

                <Pressable
                  onPress={() => handleUpdateStatus(order)}
                  className="mt-3 items-center justify-center rounded-[10px] bg-[#006397] py-2"
                >
                  <Text className="text-[12px] font-bold text-white">
                    Chuyển sang trạng thái tiếp theo
                  </Text>
                </Pressable>
              </View>
            ))}

            {orders.length === 0 && (
              <View className="items-center rounded-[14px] bg-white p-6">
                <Text className="text-[14px] text-[#5b6470]">
                  Không có dữ liệu đơn hàng.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
