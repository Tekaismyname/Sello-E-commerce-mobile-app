import { OrderTimeline } from "@/components/main/orders/order-timeline";
import { useAuth } from "@/contexts/auth-context";
import { orderService } from "@/services/customer.service";
import { OrderTracking } from "@/types/customer";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
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
      setError("Không tìm thấy thông tin vận chuyển.");
      setLoading(false);
      return;
    }

    orderService
      .getOrderTracking(token, id)
      .then((response) => setTracking(response.data))
      .catch((err: any) => setError(err.message ?? "Không thể tải hành trình đơn hàng."))
      .finally(() => setLoading(false));
  }, [orderId, token]);

  const latestStatus = useMemo(
    () => tracking?.timeline[tracking.timeline.length - 1]?.status ?? "Đang cập nhật",
    [tracking?.timeline],
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top", "bottom"]}>
      <View className="h-[56px] flex-row items-center px-4">
        <Pressable className="h-10 w-10 items-center justify-center" onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#1F2934" />
        </Pressable>
        <Text className="ml-1 text-[20px] font-extrabold text-[#1F2934]">Theo dõi đơn hàng</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0369A1" />
        </View>
      ) : error || !tracking ? (
        <View className="px-4 py-4">
          <Text className="text-[14px] font-semibold text-[#BA1A1A]">{error ?? "Không có dữ liệu"}</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8 pt-2" showsVerticalScrollIndicator={false}>
          <View className="rounded-[16px] bg-white p-4">
            <View className="flex-row items-center justify-between">
              <View className="rounded-full bg-[#DBEBFA] px-3 py-1">
                <Text className="text-[12px] font-bold text-[#0369A1]">
                  #{tracking.shipment?.trackingCode ?? "ĐANG CẬP NHẬT"}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Feather name="check-circle" size={16} color="#15803D" />
                <Text className="ml-2 text-[16px] font-extrabold text-[#15803D]">{latestStatus}</Text>
              </View>
            </View>

            <Text className="mt-3 text-[20px] font-extrabold leading-[28px] text-[#1F2934]">Kiện hàng đang tới</Text>
            <Text className="mt-1 text-[14px] text-[#4B5563]">
              Dự kiến ngày giao:{" "}
              <Text className="font-bold">
                {tracking.shipment?.estimatedDeliveryAt
                  ? new Date(tracking.shipment.estimatedDeliveryAt).toLocaleString("vi-VN")
                  : "Hôm nay"}
              </Text>
            </Text>
            {!!tracking.shipment?.driverPhone && (
              <Text className="mt-1 text-[13px] text-[#4B5563]">Liên hệ tài xế: {tracking.shipment.driverPhone}</Text>
            )}

            <View className="mt-3 h-[220px] overflow-hidden rounded-[14px] bg-[#EAF1F7]">
              <View className="absolute left-0 right-0 top-[48px] h-[1px] bg-[#D5E1EB]" />
              <View className="absolute left-0 right-0 top-[112px] h-[1px] bg-[#D5E1EB]" />
              <View className="absolute left-0 right-0 top-[176px] h-[1px] bg-[#D5E1EB]" />
              <View className="absolute bottom-0 top-0 left-[72px] w-[1px] bg-[#D5E1EB]" />
              <View className="absolute bottom-0 top-0 left-[170px] w-[1px] bg-[#D5E1EB]" />
              <View className="absolute bottom-0 top-0 right-[72px] w-[1px] bg-[#D5E1EB]" />
              <View className="absolute left-8 right-10 top-[96px] h-[5px] rotate-[-10deg] rounded-full bg-[#8CC5E8]" />
              <View className="absolute left-[54px] top-[74px] h-10 w-10 items-center justify-center rounded-full bg-[#0F6CBD]">
                <Feather name="truck" size={18} color="white" />
              </View>
              <View className="absolute right-[48px] top-[118px] h-10 w-10 items-center justify-center rounded-full bg-[#E53935]">
                <Feather name="map-pin" size={18} color="white" />
              </View>
              <View className="absolute bottom-3 left-3 right-3 rounded-[12px] bg-white p-3 flex-row items-center justify-between">
                <View>
                  <Text className="text-[13px] text-[#64748B]">Tài xế hiện tại</Text>
                  <Text className="text-[15px] font-extrabold text-[#1F2934]">
                    {tracking.shipment?.driverName ?? "Đang cập nhật"}{" "}
                    {tracking.shipment?.vehicleNumber ? ` ${tracking.shipment.vehicleNumber}` : ""}
                  </Text>
                </View>
                <View className="h-9 w-9 items-center justify-center rounded-full bg-[#E8F3FC]">
                  <Feather name="phone-call" size={16} color="#0369A1" />
                </View>
              </View>
            </View>
            {tracking.destination ? (
              <View className="mt-3 rounded-[12px] bg-[#F8FAFD] p-3">
                <View className="flex-row items-start">
                  <Feather name="map-pin" size={16} color="#BA1A1A" />
                  <View className="ml-2 flex-1">
                    <Text className="text-[13px] font-bold text-[#1F2934]">Diem giao hang</Text>
                    <Text className="mt-1 text-[13px] leading-[19px] text-[#4B5563]">
                      {tracking.destination.address}
                    </Text>
                  </View>
                </View>
                <View className="mt-2 flex-row items-center">
                  <Feather name="navigation" size={14} color="#0F6CBD" />
                  <Text className="ml-2 text-[12px] font-semibold text-[#64748B]">
                    Tai xe: {tracking.shipment?.latitude?.toFixed(5)}, {tracking.shipment?.longitude?.toFixed(5)}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          <View className="mt-3">
            <OrderTimeline timeline={tracking.timeline} currentStatus={latestStatus} />
          </View>

          <View className="mt-3 rounded-[16px] bg-white p-4">
            <View className="flex-row items-center">
              <Feather name="truck" size={16} color="#0369A1" />
              <Text className="ml-2 text-[17px] font-extrabold text-[#1F2934]">Đơn vị vận chuyển</Text>
            </View>
            <Text className="mt-3 text-[17px] font-extrabold text-[#1F2934]">
              {tracking.shipment?.carrierName ?? "Đang cập nhật"}
            </Text>
            <View className="mt-2 flex-row justify-between">
              <Text className="text-[14px] text-[#4B5563]">Mã vận đơn</Text>
              <Text className="text-[14px] font-semibold text-[#1F2934]">
                {tracking.shipment?.trackingCode ?? "N/A"}
              </Text>
            </View>
            <View className="mt-1 flex-row justify-between">
              <Text className="text-[14px] text-[#4B5563]">Hình thức</Text>
              <Text className="text-[14px] font-semibold text-[#1F2934]">
                {tracking.shipment?.shippingType ?? "Giao tiêu chuẩn"}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
