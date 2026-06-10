import { OrderHeroStatusCard } from "@/components/main/orders/order-hero-status-card";
import { OrderTimeline } from "@/components/main/orders/order-timeline";
import { useAuth } from "@/contexts/auth-context";
import { orderService } from "@/services/customer.service";
import { Order } from "@/types/customer";
import { Feather } from "@expo/vector-icons";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

const getPaymentLabel = (order: Order) => {
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
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const loadData = (showSpinner = true) => {
    const id = Number(orderId);
    if (!token || !id) {
      setError("Order not found.");
      setLoading(false);
      return;
    }

    if (showSpinner) setLoading(true);
    orderService
      .getOrderDetail(token, id)
      .then((response) => setOrder(response.data))
      .catch((err: any) => setError(err.message ?? "Unable to load order details."))
      .finally(() => {
        if (showSpinner) setLoading(false);
      });
  };

  useEffect(() => {
    loadData(true);
  }, [orderId, token]);

  const handleRequestReturn = async () => {
    const id = Number(orderId);
    if (!token || !id || !returnReason.trim()) return;

    try {
      setSubmittingReturn(true);
      await orderService.requestOrderReturn(token, id, returnReason.trim());
      Alert.alert("Success", "Your return request has been sent successfully. Please wait for Sello to respond.");
      setShowReturnModal(false);
      setReturnReason("");
      loadData(false);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Unable to submit the return request.");
    } finally {
      setSubmittingReturn(false);
    }
  };

  const timeline = useMemo(() => {
    if (!order?.statusHistory?.length) {
      return [
        {
          id: 1,
          status: "pending",
          description: "Awaiting update",
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
        <Text className="ml-1 text-[20px] font-extrabold text-[#2563EB]">Order details</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0369A1" />
        </View>
      ) : error || !order ? (
        <View className="px-4 py-4">
          <Text className="text-[14px] font-semibold text-[#BA1A1A]">{error ?? "Order not found"}</Text>
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
                <Text className="ml-2 text-[17px] font-extrabold text-[#1F2934]">Shipping information</Text>
              </View>
              <View className="mt-3 rounded-[12px] bg-[#F8FAFD] p-3">
                <Text className="text-[15px] font-extrabold text-[#1F2934]">{order.shippingAddress ?? "Updating"}</Text>
              </View>
            </View>

            <View className="mt-3 rounded-[16px] bg-white p-4">
              <Text className="text-[17px] font-extrabold text-[#1F2934]">Selected items</Text>
              <View className="mt-3 gap-3">
                {order.items.map((item) => {
                  const imgSource =
                    item.productImage && item.productImage.trim()
                      ? item.productImage
                      : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80";
                  return (
                    <View key={item.id} className="flex-row rounded-[12px] bg-[#F8FAFD] p-3">
                      <Image source={{ uri: imgSource }} className="h-16 w-16 rounded-[8px] bg-gray-200" />
                      <View className="ml-3 flex-1 justify-center">
                        <Text className="text-[15px] font-extrabold text-[#1F2934]" numberOfLines={1}>
                          {item.productName}
                        </Text>
                        {!!item.variantSnapshot && (
                          <Text className="mt-0.5 text-[12px] text-[#64748B]">Variant: {item.variantSnapshot}</Text>
                        )}
                        <View className="mt-1 flex-row items-center justify-between">
                          <Text className="text-[14px] font-extrabold text-[#0369A1]">
                            {formatPrice(item.lineTotal ?? item.unitPrice ?? item.price ?? 0)}
                          </Text>
                          <Text className="text-[12px] text-[#64748B]">x{item.quantity}</Text>
                        </View>
                        {order.status === "delivered" && (
                          <View className="mt-2 flex-row justify-end">
                            <Pressable
                              className="rounded-full bg-[#0369A1] px-3.5 py-1.5 active:opacity-90"
                              onPress={() =>
                                router.push({
                                  pathname: "/product/write-review",
                                  params: {
                                    productId: item.productId,
                                    productName: item.productName,
                                    productImage: imgSource,
                                  },
                                } as any)
                              }
                            >
                              <Text className="text-[11px] font-bold text-white">Write review</Text>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            <View className="mt-3 rounded-[16px] bg-white p-4">
              <Text className="text-[17px] font-extrabold text-[#1F2934]">Payment details</Text>
              <View className="mt-3 gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[14px] text-[#4B5563]">Subtotal</Text>
                  <Text className="text-[14px] font-semibold text-[#1F2934]">{formatPrice(order.subtotal ?? 0)}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[14px] text-[#4B5563]">Shipping fee</Text>
                  <Text className="text-[14px] font-semibold text-[#1F2934]">{formatPrice(order.shippingFee ?? 0)}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[14px] text-[#4B5563]">Discount</Text>
                  <Text className="text-[14px] font-semibold text-[#12805C]">-{formatPrice(order.discount ?? 0)}</Text>
                </View>
                <View className="mt-1 h-[1px] bg-[#E5EBF2]" />
                <View className="flex-row items-center justify-between">
                  <Text className="text-[16px] font-extrabold text-[#1F2934]">Total</Text>
                  <Text className="text-[20px] font-extrabold text-[#0369A1]">{formatPrice(order.totalAmount)}</Text>
                </View>
                <View className="mt-3 rounded-[12px] bg-[#F8FAFD] p-3">
                  <Text className="text-[13px] text-[#64748B]">Payment status</Text>
                  <Text className="mt-1 text-[15px] font-extrabold text-[#1F2934]">{getPaymentLabel(order)}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View className="gap-2 border-t border-[#E1E7EF] bg-white px-4 py-3">
            {order.status === "delivered" && (
              <Pressable
                className="h-[52px] items-center justify-center rounded-[12px] bg-[#DC2626] active:opacity-90"
                onPress={() => setShowReturnModal(true)}
              >
                <Text className="text-[16px] font-extrabold text-white">Request return</Text>
              </Pressable>
            )}
            <Pressable
              className="h-[52px] items-center justify-center rounded-[12px] bg-[#2F95D2]"
              onPress={() => router.push((`/main/order-tracking?orderId=${order.id}` as unknown) as Href)}
            >
              <Text className="text-[16px] font-extrabold text-white">Track order</Text>
            </Pressable>
          </View>
        </>
      )}

      <Modal
        visible={showReturnModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReturnModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-5">
          <View className="w-full rounded-[24px] bg-white p-5 shadow-lg">
            <Text className="text-center text-[18px] font-extrabold text-[#1F2934]">Request return</Text>
            <Text className="mt-2 text-center text-[13px] text-[#4B5563]">
              Please enter the return reason in detail so Sello can support you as quickly as possible.
            </Text>

            <TextInput
              className="mt-4 min-h-[100px] rounded-[14px] bg-[#F3F5FA] p-3 text-[14px] text-[#1F2934]"
              multiline
              placeholder="Enter the return reason here..."
              placeholderTextColor="#9CA3AF"
              value={returnReason}
              onChangeText={setReturnReason}
              textAlignVertical="top"
            />

            <View className="mt-4 flex-row gap-3">
              <Pressable
                className="flex-1 h-11 items-center justify-center rounded-[12px] bg-[#F3F5FA] active:opacity-85"
                onPress={() => {
                  setShowReturnModal(false);
                  setReturnReason("");
                }}
                disabled={submittingReturn}
              >
                <Text className="text-[14px] font-bold text-[#4B5563]">Cancel</Text>
              </Pressable>

              <Pressable
                className="flex-1 h-11 items-center justify-center rounded-[12px] bg-[#DC2626] active:opacity-85 disabled:opacity-50"
                onPress={handleRequestReturn}
                disabled={submittingReturn || !returnReason.trim()}
              >
                <Text className="text-[14px] font-bold text-white">
                  {submittingReturn ? "Submitting..." : "Submit request"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
