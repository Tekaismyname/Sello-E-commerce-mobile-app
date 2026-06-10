import { useAuth } from "@/contexts/auth-context";
import { orderService } from "@/services/customer.service";
import { OrderDetail, OrderStatus, OrderTracking } from "@/types/customer";
import { Feather } from "@expo/vector-icons";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Awaiting processing",
  confirmed: "Confirmed",
  packed: "Packed",
  shipping: "Shipping",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
  return_requested: "Return requested",
};

const statusColors: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: "bg-[#FFF3E0]", text: "text-[#E65100]" },
  confirmed: { bg: "bg-[#E3F2FD]", text: "text-[#1565C0]" },
  packed: { bg: "bg-[#F3E8FF]", text: "text-[#873DA6]" },
  shipping: { bg: "bg-[#E0F7FA]", text: "text-[#00838F]" },
  delivered: { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]" },
  cancelled: { bg: "bg-[#FFEBEE]", text: "text-[#C62828]" },
  returned: { bg: "bg-[#FFF8E1]", text: "text-[#F57F17]" },
  return_requested: { bg: "bg-[#FFEBEE]", text: "text-[#DC2626]" },
};

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

const getPaymentLabel = (order: OrderDetail) => {
  const methodCode = order.payment?.methodCode?.toUpperCase();
  const methodName = order.payment?.methodName;

  if (methodCode === "COD") {
    return `Cash on delivery - ${order.paymentStatus ?? "unpaid"}`;
  }
  if (methodCode === "MOMO") {
    return `${order.paymentStatus === "paid" ? "Paid" : "Status"} via MoMo`;
  }
  if (methodCode === "CARD") {
    return `${order.paymentStatus === "paid" ? "Paid" : "Status"} via card`;
  }

  return methodName
    ? `${order.paymentStatus === "paid" ? "Paid" : "Status"} via ${methodName}`
    : order.payment?.paymentStatus ?? order.paymentStatus ?? "pending";
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const orderId = Number(Array.isArray(id) ? id[0] : id);

  const fetchOrder = useCallback(async () => {
    if (!token) {
      setError("Please sign in to view order details.");
      setLoading(false);
      return;
    }

    if (!orderId || Number.isNaN(orderId)) {
      setError("Invalid order ID.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [detailResponse, trackingResponse] = await Promise.all([
        orderService.getOrderDetail(token, orderId),
        orderService.getOrderTracking(token, orderId),
      ]);

      setOrder(detailResponse.data);
      setTracking(trackingResponse.data);
    } catch (nextError: any) {
      setError(nextError.message);
    } finally {
      setLoading(false);
    }
  }, [orderId, token]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancel = async () => {
    if (!order || !token) {
      return;
    }

    Alert.alert("Cancel order", `Are you sure you want to cancel order #${order.orderCode}?`, [
      { text: "No", style: "cancel" },
      {
        text: "Cancel order",
        style: "destructive",
        onPress: async () => {
          setCancelLoading(true);

          try {
            const response = await orderService.cancelOrder(token, order.id);
            setOrder(response.data);
            const trackingResponse = await orderService.getOrderTracking(token, order.id);
            setTracking(trackingResponse.data);
          } catch (nextError: any) {
            Alert.alert("Error", nextError.message ?? "Unable to cancel the order.");
          } finally {
            setCancelLoading(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F6F8FC]" edges={["top"]}>
        <ActivityIndicator size="large" color="#006397" />
        <Text className="mt-3 text-[13px] text-[#607080]">Loading order details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView className="flex-1 bg-[#F6F8FC]" edges={["top"]}>
        <View className="flex-row items-center gap-3 px-4 py-4">
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/main/orders" as Href))}
          >
            <Feather name="arrow-left" size={18} color="#1F2934" />
          </Pressable>
          <Text className="text-[18px] font-bold text-[#1F2934]">Order details</Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-[15px] font-semibold text-[#465362]">
            {error || "Order not found"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const colors = statusColors[order.status] ?? statusColors.pending;
  const canCancel = order.status === "pending" || order.status === "confirmed";
  const timeline = tracking?.timeline?.length ? tracking.timeline : order.statusHistory ?? [];

  return (
    <SafeAreaView className="flex-1 bg-[#F6F8FC]" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-4">
        <View className="flex-row items-center gap-3">
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/main/orders" as Href))}
          >
            <Feather name="arrow-left" size={18} color="#1F2934" />
          </Pressable>
          <View>
            <Text className="text-[18px] font-bold text-[#1F2934]">Order details</Text>
            <Text className="text-[12px] text-[#607080]">#{order.orderCode}</Text>
          </View>
        </View>

        <View className={`rounded-full px-3 py-1 ${colors.bg}`}>
          <Text className={`text-[11px] font-bold ${colors.text}`}>
            {statusLabels[order.status] || order.status}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-10">
        <View className="rounded-[16px] bg-white p-4">
          <Text className="text-[13px] font-semibold text-[#607080]">Order date</Text>
          <Text className="mt-1 text-[16px] font-bold text-[#102033]">
            {new Date(order.createdAt).toLocaleString("en-US")}
          </Text>

          <View className="mt-4 flex-row items-start justify-between">
            <View>
              <Text className="text-[13px] font-semibold text-[#607080]">Payment</Text>
              <Text className="mt-1 text-[15px] font-bold text-[#102033]">
                {getPaymentLabel(order)}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-[13px] font-semibold text-[#607080]">Total amount</Text>
              <Text className="mt-1 text-[18px] font-extrabold text-[#0F6CBD]">
                {formatPrice(order.totalAmount)}
              </Text>
            </View>
          </View>

          {order.note ? (
            <View className="mt-4 rounded-[12px] bg-[#F7FAFD] p-3">
              <Text className="text-[12px] font-semibold text-[#607080]">Note</Text>
              <Text className="mt-1 text-[13px] text-[#334A5C]">{order.note}</Text>
            </View>
          ) : null}

          {order.status === "cancelled" && (
            <View className="mt-4 rounded-[12px] border border-[#FFCDD2] bg-[#FFEBEE] p-3">
              <Text className="text-[12px] font-bold text-[#C62828]">Cancellation reason</Text>
              <Text className="mt-1 text-[13px] font-medium text-[#C62828]">
                {timeline.find((item) => item.status === "cancelled")?.description || "Automatically cancelled due to payment timeout"}
              </Text>
            </View>
          )}

          {canCancel ? (
            <Pressable
              className="mt-4 items-center justify-center rounded-[12px] border border-[#BA1A1A] py-3"
              disabled={cancelLoading}
              onPress={handleCancel}
            >
              {cancelLoading ? (
                <ActivityIndicator color="#BA1A1A" />
              ) : (
                <Text className="text-[13px] font-bold text-[#BA1A1A]">Cancel order</Text>
              )}
            </Pressable>
          ) : null}
        </View>

        <View className="mt-4 rounded-[16px] bg-white p-4">
          <Text className="text-[16px] font-bold text-[#102033]">Products</Text>

          <View className="mt-3 gap-3">
            {order.items.map((item) => (
              <View key={item.id} className="rounded-[14px] border border-[#EEF3F7] bg-[#FAFCFE] p-3">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-[14px] font-semibold text-[#1F2934]">{item.productName}</Text>
                    {item.variantLabel ? (
                      <Text className="mt-1 text-[12px] text-[#607080]">{item.variantLabel}</Text>
                    ) : null}
                  </View>

                  <Text className="text-[14px] font-bold text-[#102033]">x{item.quantity}</Text>
                </View>

                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="text-[13px] text-[#607080]">{formatPrice(item.price)} / item</Text>
                  <Text className="text-[15px] font-bold text-[#0F6CBD]">
                    {formatPrice(item.lineTotal ?? item.price * item.quantity)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-4 rounded-[16px] bg-white p-4">
          <Text className="text-[16px] font-bold text-[#102033]">Payment details</Text>

          <View className="mt-3 gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-[13px] text-[#607080]">Subtotal</Text>
              <Text className="text-[13px] font-semibold text-[#102033]">{formatPrice(order.subtotal ?? 0)}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-[13px] text-[#607080]">Shipping fee</Text>
              <Text className="text-[13px] font-semibold text-[#102033]">
                {formatPrice(order.shippingFee ?? 0)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-[13px] text-[#607080]">Discount</Text>
              <Text className="text-[13px] font-semibold text-[#102033]">-{formatPrice(order.discount ?? 0)}</Text>
            </View>
            <View className="mt-2 h-px bg-[#EEF3F7]" />
            <View className="flex-row items-center justify-between">
              <Text className="text-[14px] font-bold text-[#102033]">Total</Text>
              <Text className="text-[18px] font-extrabold text-[#0F6CBD]">{formatPrice(order.totalAmount)}</Text>
            </View>
          </View>
        </View>

        {tracking?.shipment || order.shipment ? (
          <View className="mt-4 rounded-[16px] bg-white p-4">
            <Text className="text-[16px] font-bold text-[#102033]">Shipping</Text>

            <View className="mt-3 gap-2">
              <Text className="text-[13px] text-[#334A5C]">
                Carrier: {tracking?.shipment?.carrierName ?? order.shipment?.carrierName ?? "Updating"}
              </Text>
              <Text className="text-[13px] text-[#334A5C]">
                Tracking number: {tracking?.shipment?.trackingCode ?? order.shipment?.trackingCode ?? "Not available yet"}
              </Text>
              <Text className="text-[13px] text-[#334A5C]">
                Status: {tracking?.shipment?.shipmentStatus ?? order.shipment?.shipmentStatus ?? "pending"}
              </Text>
            </View>
          </View>
        ) : null}

        <View className="mt-4 rounded-[16px] bg-white p-4">
          <Text className="text-[16px] font-bold text-[#102033]">Status history</Text>

          <View className="mt-4 gap-4">
            {timeline.map((event, index) => (
              <View key={`${event.status}-${event.timestamp}-${index}`} className="flex-row gap-3">
                <View className="items-center">
                  <View className="h-3 w-3 rounded-full bg-[#0F6CBD]" />
                  {index < timeline.length - 1 ? <View className="mt-1 h-10 w-px bg-[#D8E2EC]" /> : null}
                </View>

                <View className="flex-1 pb-1">
                  <Text className="text-[14px] font-bold text-[#102033]">
                    {statusLabels[(event.status as OrderStatus) ?? "pending"] || event.status}
                  </Text>
                  <Text className="mt-1 text-[13px] text-[#334A5C]">{event.description}</Text>
                  <Text className="mt-1 text-[12px] text-[#607080]">
                    {new Date(event.timestamp).toLocaleString("en-US")}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
