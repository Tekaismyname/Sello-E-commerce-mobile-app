import { OrderTimeline } from "@/components/main/orders/order-timeline";
import { useAuth } from "@/contexts/auth-context";
import { orderService } from "@/services/customer.service";
import { OrderTracking } from "@/types/customer";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

type MapCoordinate = {
  latitude: number;
  longitude: number;
};

const isValidCoordinate = (coordinate?: Partial<MapCoordinate> | null): coordinate is MapCoordinate =>
  Number.isFinite(coordinate?.latitude) &&
  Number.isFinite(coordinate?.longitude) &&
  Math.abs(Number(coordinate?.latitude)) <= 90 &&
  Math.abs(Number(coordinate?.longitude)) <= 180;

const formatDistance = (meters?: number | null) => {
  if (!meters) return null;
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
};

const formatDuration = (seconds?: number | null) => {
  if (!seconds) return null;
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} phut`;
};

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { token } = useAuth();
  const mapRef = useRef<MapView | null>(null);
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

  const mapOrigin = useMemo(
    () =>
      isValidCoordinate(tracking?.map?.origin)
        ? tracking.map.origin
        : isValidCoordinate({
              latitude: tracking?.shipment?.latitude ?? undefined,
              longitude: tracking?.shipment?.longitude ?? undefined,
            })
          ? {
              latitude: tracking?.shipment?.latitude ?? 0,
              longitude: tracking?.shipment?.longitude ?? 0,
            }
          : null,
    [tracking],
  );
  const mapDestination = useMemo(
    () =>
      isValidCoordinate(tracking?.map?.destination)
        ? tracking.map.destination
        : isValidCoordinate(tracking?.destination)
          ? tracking.destination
          : null,
    [tracking],
  );
  const routeCoordinates = useMemo(() => {
    const coordinates = tracking?.map?.route.geometry?.coordinates ?? [];
    const route = coordinates
      .map((point) => ({ latitude: Number(point[1]), longitude: Number(point[0]) }))
      .filter(isValidCoordinate);

    if (route.length > 1) return route;
    return mapOrigin && mapDestination ? [mapOrigin, mapDestination] : [];
  }, [mapDestination, mapOrigin, tracking?.map?.route.geometry?.coordinates]);
  const hasMap = !!mapOrigin && !!mapDestination && routeCoordinates.length > 1;
  const initialRegion = useMemo(() => {
    const center = mapOrigin ?? mapDestination ?? { latitude: 10.7769, longitude: 106.7009 };
    return {
      latitude: center.latitude,
      longitude: center.longitude,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }, [mapDestination, mapOrigin]);
  const distanceText = formatDistance(tracking?.map?.route.distanceMeters);
  const durationText = formatDuration(tracking?.map?.route.durationSeconds);
  const destinationInfo = tracking?.map?.destination ?? tracking?.destination;

  const fitMap = () => {
    if (!mapRef.current || routeCoordinates.length < 2) return;
    mapRef.current.fitToCoordinates(routeCoordinates, {
      edgePadding: { top: 44, right: 44, bottom: 76, left: 44 },
      animated: true,
    });
  };

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

            <View className="mt-3 h-[250px] overflow-hidden rounded-[14px] bg-[#EAF1F7]">
              {hasMap ? (
                <>
                  <MapView
                    ref={mapRef}
                    style={{ flex: 1 }}
                    initialRegion={initialRegion}
                    onMapReady={fitMap}
                    onLayout={fitMap}
                  >
                    <Polyline coordinates={routeCoordinates} strokeColor="#0F6CBD" strokeWidth={5} />
                    <Marker coordinate={mapOrigin} title="Shipper">
                      <View className="h-10 w-10 items-center justify-center rounded-full border-[3px] border-white bg-[#0F6CBD]">
                        <Feather name="truck" size={18} color="white" />
                      </View>
                    </Marker>
                    <Marker coordinate={mapDestination} title="Destination">
                      <View className="h-10 w-10 items-center justify-center rounded-full border-[3px] border-white bg-[#E53935]">
                        <Feather name="map-pin" size={18} color="white" />
                      </View>
                    </Marker>
                  </MapView>
                  <View className="absolute left-3 right-3 top-3 flex-row items-center justify-between rounded-[12px] bg-white/95 px-3 py-2">
                    <View className="flex-row items-center">
                      <Feather name="navigation" size={14} color="#0F6CBD" />
                      <Text className="ml-2 text-[12px] font-bold text-[#1F2934]">
                        {tracking.map?.route.provider ?? "Map"}
                      </Text>
                    </View>
                    <Text className="text-[12px] font-semibold text-[#64748B]">
                      {[distanceText, durationText].filter(Boolean).join(" | ") || tracking.map?.route.status}
                    </Text>
                  </View>
                  <View className="absolute bottom-3 left-3 right-3 flex-row items-center justify-between rounded-[12px] bg-white/95 p-3">
                    <View className="flex-1 pr-3">
                      <Text className="text-[13px] text-[#64748B]">Tai xe hien tai</Text>
                      <Text className="text-[15px] font-extrabold text-[#1F2934]" numberOfLines={1}>
                        {tracking.shipment?.driverName ?? "Dang cap nhat"}
                        {tracking.shipment?.vehicleNumber ? ` ${tracking.shipment.vehicleNumber}` : ""}
                      </Text>
                    </View>
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-[#E8F3FC]">
                      <Feather name="phone-call" size={16} color="#0369A1" />
                    </View>
                  </View>
                </>
              ) : (
                <>
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
              <View className="absolute bottom-3 left-3 right-3 flex-row items-center justify-between rounded-[12px] bg-white p-3">
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
                </>
              )}
            </View>
            {destinationInfo ? (
              <View className="mt-3 rounded-[12px] bg-[#F8FAFD] p-3">
                <View className="flex-row items-start">
                  <Feather name="map-pin" size={16} color="#BA1A1A" />
                  <View className="ml-2 flex-1">
                    <Text className="text-[13px] font-bold text-[#1F2934]">Diem giao hang</Text>
                    <Text className="mt-1 text-[13px] leading-[19px] text-[#4B5563]">{destinationInfo.address}</Text>
                  </View>
                </View>
                <View className="mt-2 flex-row items-center">
                  <Feather name="navigation" size={14} color="#0F6CBD" />
                  <Text className="ml-2 text-[12px] font-semibold text-[#64748B]">
                    Tai xe: {mapOrigin?.latitude.toFixed(5)}, {mapOrigin?.longitude.toFixed(5)}
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
              <Text className="text-[14px] font-semibold text-[#1F2934]">{tracking.shipment?.trackingCode ?? "N/A"}</Text>
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
