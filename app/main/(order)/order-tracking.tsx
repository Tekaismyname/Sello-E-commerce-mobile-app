import { OrderTimeline } from "@/components/main/orders/order-timeline";
import { useAuth } from "@/contexts/auth-context";
import { orderService } from "@/services/customer.service";
import { OrderTracking } from "@/types/customer";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

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
  return `${minutes} min`;
};

const buildMapHtml = (
  origin: MapCoordinate,
  destination: MapCoordinate,
  routeCoordinates: MapCoordinate[],
) => {
  const payload = JSON.stringify({
    origin,
    destination,
    routeCoordinates,
  });

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #eaf1f7;
        font-family: Arial, sans-serif;
      }
      #map {
        width: 100%;
        height: 100%;
        background: #eaf1f7;
      }
      .leaflet-container {
        background: #eaf1f7;
        font-family: Arial, sans-serif;
      }
      .leaflet-control-zoom {
        border: none !important;
        box-shadow: 0 4px 18px rgba(15, 108, 189, 0.12) !important;
        margin-top: 56px !important;
        margin-left: 12px !important;
      }
      .leaflet-control-zoom a {
        width: 34px !important;
        height: 34px !important;
        line-height: 34px !important;
        color: #1f2934 !important;
        border: none !important;
      }
      .leaflet-control-attribution {
        background: rgba(255, 255, 255, 0.9) !important;
        border-radius: 8px 0 0 0;
        font-size: 10px !important;
      }
      .shipper-marker {
        width: 28px;
        height: 28px;
        border-radius: 999px;
        background: rgba(15, 108, 189, 0.96);
        border: 3px solid rgba(255, 255, 255, 0.96);
        box-shadow: 0 4px 16px rgba(15, 108, 189, 0.28);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-size: 15px;
        line-height: 1;
      }
      .dest-marker {
        width: 18px;
        height: 18px;
        border-radius: 999px;
        background: #e53935;
        border: 4px solid rgba(255, 255, 255, 0.92);
        box-shadow: 0 3px 12px rgba(229, 57, 53, 0.28);
      }
      .fallback {
        position: absolute;
        left: 12px;
        right: 12px;
        bottom: 12px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.94);
        color: #5b6775;
        font-size: 11px;
        padding: 8px 10px;
        display: none;
        z-index: 999;
      }
    </style>
  </head>
  <body>
    <div id="map">
      <div id="fallback" class="fallback">Some OpenStreetMap tiles could not be loaded, but the route is still shown using OSRM data.</div>
    </div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const data = ${payload};
      const fallback = document.getElementById('fallback');

      function boot() {
        if (!window.L) {
          fallback.style.display = 'block';
          fallback.textContent = 'Unable to load Leaflet from the CDN.';
          return;
        }

        const map = L.map('map', {
          zoomControl: true,
          attributionControl: true,
        });

        const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        });

        tileLayer.on('tileerror', function () {
          fallback.style.display = 'block';
        });

        tileLayer.addTo(map);

        const routeLatLngs = data.routeCoordinates.map(function (point) {
          return [point.latitude, point.longitude];
        });

        const routeShadow = L.polyline(routeLatLngs, {
          color: '#8CC5E8',
          weight: 12,
          opacity: 0.38,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        const routeLine = L.polyline(routeLatLngs, {
          color: '#0F6CBD',
          weight: 5,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        const shipperMarker = L.marker(
          [data.origin.latitude, data.origin.longitude],
          {
            icon: L.divIcon({
              className: '',
              html: '<div class="shipper-marker">🚚</div>',
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            }),
          },
        ).addTo(map);

        const destinationMarker = L.marker(
          [data.destination.latitude, data.destination.longitude],
          {
            icon: L.divIcon({
              className: '',
              html: '<div class="dest-marker"></div>',
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            }),
          },
        ).addTo(map);

        destinationMarker.bindTooltip('Drop-off point', {
          permanent: false,
          direction: 'top',
          offset: [0, -8],
        });

        shipperMarker.bindTooltip('Driver', {
          permanent: false,
          direction: 'top',
          offset: [0, -10],
        });

        const bounds = routeLine.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [28, 28],
          });
        } else {
          map.setView([data.destination.latitude, data.destination.longitude], 14);
        }
      }

      window.addEventListener('load', boot);
    </script>
  </body>
</html>`;
};

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { token } = useAuth();
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(orderId);

    if (!token || !id) {
      setError("Tracking information was not found.");
      setLoading(false);
      return;
    }

    orderService
      .getOrderTracking(token, id)
      .then((response) => setTracking(response.data))
      .catch((err: Error) => setError(err.message ?? "Unable to load the delivery journey."))
      .finally(() => setLoading(false));
  }, [orderId, token]);

  const latestStatus = useMemo(
    () => tracking?.timeline[tracking.timeline.length - 1]?.status ?? "Updating",
    [tracking?.timeline],
  );

  const normalizedLatest = useMemo(() => latestStatus.toLowerCase().trim(), [latestStatus]);

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
  const distanceText = formatDistance(tracking?.map?.route.distanceMeters);
  const durationText = formatDuration(tracking?.map?.route.durationSeconds);
  const destinationInfo = tracking?.map?.destination ?? tracking?.destination;
  const mapHtml = useMemo(
    () => (hasMap && mapOrigin && mapDestination ? buildMapHtml(mapOrigin, mapDestination, routeCoordinates) : ""),
    [hasMap, mapDestination, mapOrigin, routeCoordinates],
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top", "bottom"]}>
      <View className="h-[56px] flex-row items-center px-4">
        <Pressable className="h-10 w-10 items-center justify-center" onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#1F2934" />
        </Pressable>
        <Text className="ml-1 text-[20px] font-extrabold text-[#1F2934]">Track order</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0369A1" />
        </View>
      ) : error || !tracking ? (
        <View className="px-4 py-4">
          <Text className="text-[14px] font-semibold text-[#BA1A1A]">{error ?? "No data available"}</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8 pt-2" showsVerticalScrollIndicator={false}>
          <View className="rounded-[16px] bg-white p-4">
            <View className="flex-row items-center justify-between">
              <View className="rounded-full bg-[#DBEBFA] px-3 py-1">
                <Text className="text-[12px] font-bold text-[#0369A1]">
                  #{tracking.shipment?.trackingCode ?? "UPDATING"}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Feather name="check-circle" size={16} color="#15803D" />
                <Text className="ml-2 text-[16px] font-extrabold text-[#15803D]">{latestStatus}</Text>
              </View>
            </View>

            <Text className="mt-3 text-[20px] font-extrabold leading-[28px] text-[#1F2934]">Your package is on the way</Text>
            <Text className="mt-1 text-[14px] text-[#4B5563]">
              Estimated delivery:{" "}
              <Text className="font-bold">
                {tracking.shipment?.estimatedDeliveryAt
                  ? new Date(tracking.shipment.estimatedDeliveryAt).toLocaleString("en-US")
                  : "Today"}
              </Text>
            </Text>
            {!!tracking.shipment?.driverPhone && (
              <Text className="mt-1 text-[13px] text-[#4B5563]">Contact driver: {tracking.shipment.driverPhone}</Text>
            )}

            {normalizedLatest === "cancelled" ? (
              <View className="mt-3 items-center justify-center rounded-[14px] border border-[#FEE2E2] bg-[#FEF2F2] p-6 py-8">
                <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-[#FEE2E2]">
                  <Feather name="x-circle" size={24} color="#EF4444" />
                </View>
                <Text className="text-center text-[15px] font-extrabold text-[#991B1B]">Order cancelled</Text>
                <Text className="mt-1 px-4 text-center text-[13px] leading-[19px] text-[#991B1B] opacity-80">
                  This order was cancelled and its delivery journey can no longer be tracked.
                </Text>
              </View>
            ) : normalizedLatest === "returned" || normalizedLatest === "return_requested" ? (
              <View className="mt-3 items-center justify-center rounded-[14px] border border-[#FEF3C7] bg-[#FFFBEB] p-6 py-8">
                <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-[#FEF3C7]">
                  <Feather name="rotate-ccw" size={24} color="#D97706" />
                </View>
                <Text className="text-center text-[15px] font-extrabold text-[#92400E]">Return requested</Text>
                <Text className="mt-1 px-4 text-center text-[13px] leading-[19px] text-[#92400E] opacity-80">
                  This order is currently being processed for return and refund.
                </Text>
              </View>
            ) : normalizedLatest !== "shipping" && normalizedLatest !== "delivered" ? (
              <View className="mt-3 items-center justify-center rounded-[14px] border border-[#E2E8F0] bg-[#F1F5F9] p-6 py-8">
                <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-[#E2E8F0]">
                  <Feather name="box" size={24} color="#64748B" />
                </View>
                <Text className="text-center text-[15px] font-extrabold text-[#1F2934]">Preparing your order</Text>
                <Text className="mt-1 px-4 text-center text-[13px] leading-[19px] text-[#64748B]">
                  The store is packing your items. Live delivery tracking will appear once the package is handed over to the carrier.
                </Text>
              </View>
            ) : (
              <View className="mt-3 h-[250px] overflow-hidden rounded-[14px] bg-[#EAF1F7]">
                {hasMap ? (
                  <>
                    <WebView
                      originWhitelist={["*"]}
                      source={{ html: mapHtml }}
                      style={{ flex: 1, backgroundColor: "#EAF1F7" }}
                      scrollEnabled={false}
                      nestedScrollEnabled={false}
                      javaScriptEnabled
                      domStorageEnabled
                      setSupportMultipleWindows={false}
                    />
                    <View className="absolute left-3 right-3 top-3 flex-row items-center justify-between rounded-[12px] bg-white/95 px-3 py-2">
                      <View className="flex-row items-center">
                        <Feather name="navigation" size={14} color="#0F6CBD" />
                        <Text className="ml-2 text-[12px] font-bold text-[#1F2934]">
                          {tracking.map?.route.provider ?? "OSRM"}
                        </Text>
                      </View>
                      <Text className="text-[12px] font-semibold text-[#64748B]">
                        {[distanceText, durationText].filter(Boolean).join(" | ") || tracking.map?.route.status}
                      </Text>
                    </View>
                    <View className="absolute bottom-3 left-3 right-3 flex-row items-center justify-between rounded-[12px] bg-white/95 p-3">
                      <View className="flex-1 pr-3">
                        <Text className="text-[13px] text-[#64748B]">Current driver</Text>
                        <Text className="text-[15px] font-extrabold text-[#1F2934]" numberOfLines={1}>
                          {tracking.shipment?.driverName ?? "Updating"}
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
                    <View className="absolute bottom-0 left-[72px] top-0 w-[1px] bg-[#D5E1EB]" />
                    <View className="absolute bottom-0 left-[170px] top-0 w-[1px] bg-[#D5E1EB]" />
                    <View className="absolute bottom-0 right-[72px] top-0 w-[1px] bg-[#D5E1EB]" />
                    <View className="absolute left-8 right-10 top-[96px] h-[5px] rotate-[-10deg] rounded-full bg-[#8CC5E8]" />
                    <View className="absolute left-[54px] top-[74px] h-10 w-10 items-center justify-center rounded-full bg-[#0F6CBD]">
                      <Feather name="truck" size={18} color="white" />
                    </View>
                    <View className="absolute right-[48px] top-[118px] h-10 w-10 items-center justify-center rounded-full bg-[#E53935]">
                      <Feather name="map-pin" size={18} color="white" />
                    </View>
                    <View className="absolute bottom-3 left-3 right-3 flex-row items-center justify-between rounded-[12px] bg-white p-3">
                      <View>
                        <Text className="text-[13px] text-[#64748B]">Current driver</Text>
                        <Text className="text-[15px] font-extrabold text-[#1F2934]">
                          {tracking.shipment?.driverName ?? "Updating"}{" "}
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
            )}

            {destinationInfo ? (
              <View className="mt-3 rounded-[12px] bg-[#F8FAFD] p-3">
                <View className="flex-row items-start">
                  <Feather name="map-pin" size={16} color="#BA1A1A" />
                  <View className="ml-2 flex-1">
                    <Text className="text-[13px] font-bold text-[#1F2934]">Delivery address</Text>
                    <Text className="mt-1 text-[13px] leading-[19px] text-[#4B5563]">{destinationInfo.address}</Text>
                  </View>
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
              <Text className="ml-2 text-[17px] font-extrabold text-[#1F2934]">Carrier</Text>
            </View>
            <Text className="mt-3 text-[17px] font-extrabold text-[#1F2934]">
              {tracking.shipment?.carrierName ?? "Updating"}
            </Text>
            <View className="mt-2 flex-row justify-between">
              <Text className="text-[14px] text-[#4B5563]">Tracking number</Text>
              <Text className="text-[14px] font-semibold text-[#1F2934]">{tracking.shipment?.trackingCode ?? "N/A"}</Text>
            </View>
            <View className="mt-1 flex-row justify-between">
              <Text className="text-[14px] text-[#4B5563]">Shipping method</Text>
              <Text className="text-[14px] font-semibold text-[#1F2934]">
                {tracking.shipment?.shippingType ?? "Standard delivery"}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
