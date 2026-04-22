import { OrderTimeline } from "@/components/main/orders/order-timeline";
import { useAuth } from "@/contexts/auth-context";
import { orderService } from "@/services/customer.service";
import { OrderTracking } from "@/types/customer";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { token } = useAuth();
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(orderId);

    if (!token || !id) {
      setError("Khong tim thay thong tin van chuyen.");
      setLoading(false);
      return;
    }

    orderService
      .getOrderTracking(token, id)
      .then((response) => setTracking(response.data))
      .catch((err: any) => setError(err.message ?? "Khong the tai hanh trinh don hang."))
      .finally(() => setLoading(false));
  }, [orderId, token]);

  const latestStatus = useMemo(
    () => tracking?.timeline[tracking.timeline.length - 1]?.status ?? "Dang cap nhat",
    [tracking?.timeline],
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top", "bottom"]}>
      <View className="h-[56px] flex-row items-center px-4">
        <Pressable className="h-10 w-10 items-center justify-center" onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#1F2934" />
        </Pressable>
        <Text className="ml-1 text-[20px] font-extrabold text-[#1F2934]">Theo doi don hang</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0369A1" />
        </View>
      ) : error || !tracking ? (
        <View className="px-4 py-4">
          <Text className="text-[14px] font-semibold text-[#BA1A1A]">{error ?? "Khong co du lieu"}</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8 pt-2" showsVerticalScrollIndicator={false}>
          <View className="rounded-[16px] bg-white p-4">
            <View className="flex-row items-center justify-between">
              <View className="rounded-full bg-[#DBEBFA] px-3 py-1">
                <Text className="text-[12px] font-bold text-[#0369A1]">
                  #{tracking.shipment?.trackingCode ?? "DANG CAP NHAT"}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Feather name="check-circle" size={16} color="#15803D" />
                <Text className="ml-2 text-[16px] font-extrabold text-[#15803D]">{latestStatus}</Text>
              </View>
            </View>

            <Text className="mt-3 text-[20px] font-extrabold leading-[28px] text-[#1F2934]">Kien hang dang toi</Text>
            <Text className="mt-1 text-[14px] text-[#4B5563]">
              Du kien giao:{" "}
              <Text className="font-bold">
                {tracking.shipment?.estimatedDeliveryAt
                  ? new Date(tracking.shipment.estimatedDeliveryAt).toLocaleString("vi-VN")
                  : "Hom nay"}
              </Text>
            </Text>
            {!!tracking.shipment?.driverPhone && (
              <Text className="mt-1 text-[13px] text-[#4B5563]">Lien he tai xe: {tracking.shipment.driverPhone}</Text>
            )}

            <View className="mt-3 overflow-hidden rounded-[14px]">
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1569336415962-a4bd9f69c07a?auto=format&fit=crop&w=1200&q=80",
                }}
                className="h-[220px] w-full"
              />
              <View className="absolute bottom-3 left-3 right-3 rounded-[12px] bg-white p-3 flex-row items-center justify-between">
                <View>
                  <Text className="text-[13px] text-[#64748B]">Tai xe hien tai</Text>
                  <Text className="text-[15px] font-extrabold text-[#1F2934]">
                    {tracking.shipment?.driverName ?? "Dang cap nhat"}{" "}
                    {tracking.shipment?.vehicleNumber ? `• ${tracking.shipment.vehicleNumber}` : ""}
                  </Text>
                </View>
                <View className="h-9 w-9 items-center justify-center rounded-full bg-[#E8F3FC]">
                  <Feather name="phone-call" size={16} color="#0369A1" />
                </View>
              </View>
            </View>
          </View>

          <View className="mt-3">
            <OrderTimeline timeline={tracking.timeline} currentStatus={latestStatus} />
          </View>

          <View className="mt-3 rounded-[16px] bg-white p-4">
            <View className="flex-row items-center">
              <Feather name="truck" size={16} color="#0369A1" />
              <Text className="ml-2 text-[17px] font-extrabold text-[#1F2934]">Don vi van chuyen</Text>
            </View>
            <Text className="mt-3 text-[17px] font-extrabold text-[#1F2934]">
              {tracking.shipment?.carrierName ?? "Dang cap nhat"}
            </Text>
            <View className="mt-2 flex-row justify-between">
              <Text className="text-[14px] text-[#4B5563]">Ma van don</Text>
              <Text className="text-[14px] font-semibold text-[#1F2934]">
                {tracking.shipment?.trackingCode ?? "N/A"}
              </Text>
            </View>
            <View className="mt-1 flex-row justify-between">
              <Text className="text-[14px] text-[#4B5563]">Hinh thuc</Text>
              <Text className="text-[14px] font-semibold text-[#1F2934]">
                {tracking.shipment?.shippingType ?? "Giao tieu chuan"}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
