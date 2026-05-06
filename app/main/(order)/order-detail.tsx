import { OrderHeroStatusCard } from "@/components/main/orders/order-hero-status-card";
import { OrderTimeline } from "@/components/main/orders/order-timeline";
import { useAuth } from "@/contexts/auth-context";
import { orderService } from "@/services/customer.service";
import { Order } from "@/types/customer";
import { Feather } from "@expo/vector-icons";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

const getPaymentLabel = (order: Order) => {
  const methodCode = order.payment?.methodCode?.toUpperCase();
  const methodName = order.payment?.methodName;

  if (methodCode === "COD") {
    return `Thanh toán bằng COD - ${order.paymentStatus ?? "unpaid"}`;
  }
  if (methodCode === "MOMO") {
    return `${order.paymentStatus === "paid" ? "Đã Thanh Toán" : "Trạng thái"} qua MoMo`;
  }
  if (methodCode === "CARD") {
    return `${order.paymentStatus === "paid" ? "Đã Thanh Toán" : "Trạng thái"} qua ngan hang`;
  }

  return methodName
    ? `${order.paymentStatus === "paid" ? "Đã Thanh Toán" : "Trạng thái"} qua ${methodName}`
    : order.payment?.paymentStatus ?? order.paymentStatus ?? "pending";
};

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(orderId);
    if (!token || !id) {
      setError("Không tìm thấy đơn hàng.");
      setLoading(false);
      return;
    }

    orderService
      .getOrderDetail(token, id)
      .then((response) => setOrder(response.data))
      .catch((err: any) => setError(err.message ?? "Không thể tải chi tiết đơn hàng."))
      .finally(() => setLoading(false));
  }, [orderId, token]);

  const timeline = useMemo(() => {
    if (!order?.statusHistory?.length) {
      return [
        {
          id: 1,
          status: "pending",
          description: "Chờ cập nhật",
          createdAt: order?.createdAt ?? new Date().toISOString(),
        },
      ];
    }

    return order.statusHistory.map((item, index) => ({
      id: item.id ?? index + 1,
      status: item.status,
      description: item.description ?? null,
      createdAt: item.createdAt,
    }));
  }, [order?.createdAt, order?.statusHistory]);

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top"]}>
      <View className="h-[56px] flex-row items-center px-4">
        <Pressable className="h-10 w-10 items-center justify-center" onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#334155" />
        </Pressable>
        <Text className="ml-1 text-[20px] font-extrabold text-[#2563EB]">Chi tiết đơn hàng</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0369A1" />
        </View>
      ) : error || !order ? (
        <View className="px-4 py-4">
          <Text className="text-[14px] font-semibold text-[#BA1A1A]">{error ?? "Không tìm thấy đơn hàng"}</Text>
        </View>
      ) : (
        <>
          <ScrollView className="flex-1" contentContainerClassName="px-4 pb-24 pt-2" showsVerticalScrollIndicator={false}>
            <OrderHeroStatusCard order={order} />

            <View className="mt-3">
              <OrderTimeline timeline={timeline} currentStatus={order.status} />
            </View>

            <View className="mt-3 rounded-[16px] bg-white p-4">
              <View className="flex-row items-center">
                <Feather name="map-pin" size={16} color="#0369A1" />
                <Text className="ml-2 text-[17px] font-extrabold text-[#1F2934]">Thông tin nhận hàng</Text>
              </View>
              <View className="mt-3 rounded-[12px] bg-[#F8FAFD] p-3">
                <Text className="text-[15px] font-extrabold text-[#1F2934]">{order.shippingAddress ?? "Đang cập nhật"}</Text>
              </View>
            </View>

            <View className="mt-3 rounded-[16px] bg-white p-4">
              <Text className="text-[17px] font-extrabold text-[#1F2934]">Sản phẩm đã chọn</Text>
              <View className="mt-3 gap-3">
                {order.items.map((item) => (
                  <View key={item.id} className="rounded-[12px] bg-[#F8FAFD] p-3">
                    <Text className="text-[16px] font-extrabold text-[#1F2934]">{item.productName}</Text>
                    {!!item.variantSnapshot && (
                      <Text className="mt-1 text-[13px] text-[#64748B]">Phân loại: {item.variantSnapshot}</Text>
                    )}
                    <View className="mt-2 flex-row items-center justify-between">
                      <Text className="text-[15px] font-extrabold text-[#0369A1]">
                        {formatPrice(item.lineTotal ?? item.unitPrice ?? item.price ?? 0)}
                      </Text>
                      <Text className="text-[13px] text-[#64748B]">x{item.quantity}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View className="mt-3 rounded-[16px] bg-white p-4">
              <Text className="text-[17px] font-extrabold text-[#1F2934]">Chi tiết thanh toán</Text>
              <View className="mt-3 gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[14px] text-[#4B5563]">Tổng tiền hàng</Text>
                  <Text className="text-[14px] font-semibold text-[#1F2934]">{formatPrice(order.subtotal ?? 0)}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[14px] text-[#4B5563]">Phí vận chuyển</Text>
                  <Text className="text-[14px] font-semibold text-[#1F2934]">{formatPrice(order.shippingFee ?? 0)}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[14px] text-[#4B5563]">Giảm giá</Text>
                  <Text className="text-[14px] font-semibold text-[#12805C]">-{formatPrice(order.discount ?? 0)}</Text>
                </View>
                <View className="mt-1 h-[1px] bg-[#E5EBF2]" />
                <View className="flex-row items-center justify-between">
                  <Text className="text-[16px] font-extrabold text-[#1F2934]">Tổng cộng</Text>
                  <Text className="text-[20px] font-extrabold text-[#0369A1]">{formatPrice(order.totalAmount)}</Text>
                </View>
                <View className="mt-3 rounded-[12px] bg-[#F8FAFD] p-3">
                  <Text className="text-[13px] text-[#64748B]">Trạng thái thanh toán</Text>
                  <Text className="mt-1 text-[15px] font-extrabold text-[#1F2934]">{getPaymentLabel(order)}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View className="border-t border-[#E1E7EF] bg-white px-4 py-3">
            <Pressable
              className="h-[52px] items-center justify-center rounded-[12px] bg-[#2F95D2]"
              onPress={() => router.push((`/main/order-tracking?orderId=${order.id}` as unknown) as Href)}
            >
              <Text className="text-[16px] font-extrabold text-white">Theo dõi đơn hàng</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
