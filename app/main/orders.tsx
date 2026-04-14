import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { SelloHeader } from "@/components/main/sello-header";
import { orderService } from "@/services/customer.service";
import { Order, OrderStatus } from "@/types/customer";
import { useAuth } from "@/contexts/auth-context";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Cho xu ly",
  confirmed: "Da xac nhan",
  packed: "Da dong goi",
  shipping: "Dang giao",
  delivered: "Da giao",
  cancelled: "Da huy",
  returned: "Da tra",
};

const statusColors: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: "bg-[#FFF3E0]", text: "text-[#E65100]" },
  confirmed: { bg: "bg-[#E3F2FD]", text: "text-[#1565C0]" },
  packed: { bg: "bg-[#F3E8FF]", text: "text-[#873DA6]" },
  shipping: { bg: "bg-[#E0F7FA]", text: "text-[#00838F]" },
  delivered: { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]" },
  cancelled: { bg: "bg-[#FFEBEE]", text: "text-[#C62828]" },
  returned: { bg: "bg-[#FFF8E1]", text: "text-[#F57F17]" },
};

export default function OrdersScreen() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
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
      const res = await orderService.getMyOrders(token);
      setOrders(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancel = (order: Order) => {
    if (order.status !== "pending") return;

    Alert.alert("Huy don hang", `Ban co chac muon huy don #${order.id}?`, [
      { text: "Khong", style: "cancel" },
      {
        text: "Huy don",
        style: "destructive",
        onPress: async () => {
          if (!token) {
            Alert.alert("Loi", "Phien dang nhap da het han.");
            return;
          }

          try {
            await orderService.cancelOrder(token, order.id);
            fetchOrders();
          } catch (err: any) {
            Alert.alert("Loi", err.message);
          }
        },
      },
    ]);
  };

  const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

  return (
    <SafeAreaView className="flex-1 bg-[#f6f8fc]" edges={["top"]}>
      <SelloHeader />
      <ScrollView className="flex-1" contentContainerClassName="px-4 py-4">
        <Text className="text-[30px] font-extrabold text-[#1f2934]">Don hang</Text>

        {loading && (
          <View className="mt-10 items-center">
            <ActivityIndicator size="large" color="#006397" />
            <Text className="mt-3 text-[13px] text-[#7d8896]">Dang tai don hang...</Text>
          </View>
        )}

        {!loading && error && (
          <View className="mt-6 rounded-[14px] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#465362]">{error}</Text>
          </View>
        )}

        {!loading && !error && orders.length === 0 && (
          <View className="mt-6 rounded-[14px] bg-white p-6 items-center">
            <Feather name="package" size={48} color="#c5cdd6" />
            <Text className="mt-3 text-[15px] font-semibold text-[#465362]">Chua co don hang</Text>
            <Text className="mt-1 text-[12px] text-[#7d8896]">Don hang cua ban se hien thi tai day.</Text>
          </View>
        )}

        {!loading && !error && orders.length > 0 && (
          <View className="mt-4 gap-3">
            {orders.map((order) => {
              const colors = statusColors[order.status] || statusColors.pending;
              return (
                <View key={order.id} className="rounded-[14px] bg-white p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[15px] font-bold text-[#1f2934]">Don #{order.id}</Text>
                    <View className={`px-3 py-1 rounded-full ${colors.bg}`}>
                      <Text className={`text-[11px] font-bold ${colors.text}`}>
                        {statusLabels[order.status] || order.status}
                      </Text>
                    </View>
                  </View>

                  <Text className="mt-2 text-[12px] text-[#7d8896]">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")} · {order.items?.length || 0} san pham
                  </Text>

                  <View className="mt-2 flex-row items-center justify-between">
                    <Text className="text-[16px] font-bold text-[#006397]">{formatPrice(order.totalAmount)}</Text>

                    {order.status === "pending" && (
                      <Pressable
                        className="px-4 py-2 rounded-[8px] border border-[#BA1A1A]"
                        onPress={() => handleCancel(order)}
                      >
                        <Text className="text-[12px] font-bold text-[#BA1A1A]">Huy don</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
