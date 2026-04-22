import { CustomerOrderCard } from "@/components/main/orders/customer-order-card";
import { OrderFilterTabs } from "@/components/main/orders/order-filter-tabs";
import { RecommendedProducts } from "@/components/main/orders/recommended-products";
import { SelloHeader } from "@/components/main/sello-header";
import { useAuth } from "@/contexts/auth-context";
import { useOrdersView } from "@/hooks/customer/use-orders-view";
import { useHomeData } from "@/hooks/main/use-main-data";
import { orderService } from "@/services/customer.service";
import { Order } from "@/types/customer";
import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrdersScreen() {
  const { token } = useAuth();
  const { data: homeData } = useHomeData();
  const { filteredOrders, filter, loading, error, setFilter, fetchOrders } = useOrdersView(token);

  const openOrderDetail = (order: Order) => {
    router.push((`/main/order-detail?orderId=${order.id}` as unknown) as Href);
  };

  const openOrderTracking = (order: Order) => {
    router.push((`/main/order-tracking?orderId=${order.id}` as unknown) as Href);
  };

  const handleCancel = (order: Order) => {
    Alert.alert("Hủy đơn hàng", `Bạn có chắc muốn hủy đơn #${order.id}?`, [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy đơn",
        style: "destructive",
        onPress: async () => {
          if (!token) {
            Alert.alert("Lỗi", "Phiên đăng nhập đã hết hạn.");
            return;
          }

          try {
            await orderService.cancelOrder(token, order.id);
            await fetchOrders();
          } catch (err: any) {
            Alert.alert("Lỗi", err.message ?? "Không thể hủy đơn.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top"]}>
      <SelloHeader />
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8 pt-6">
        <Text className="text-[22px] font-extrabold leading-[30px] text-[#1F2934]">Đơn hàng của bạn</Text>
        <Text className="mt-2 text-[14px] leading-[22px] text-[#4B5563]">
          Theo dõi và quản lý lịch sử mua sắm một cách dễ dàng.
        </Text>

        <OrderFilterTabs value={filter} onChange={setFilter} />

        {loading && (
          <View className="mt-10 items-center">
            <ActivityIndicator size="large" color="#0369A1" />
          </View>
        )}

        {!loading && error && (
          <View className="mt-4 rounded-[14px] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#B91C1C]">{error}</Text>
          </View>
        )}

        {!loading && !error && (
          <View className="mt-4 gap-3">
            {filteredOrders.map((order) => (
              <CustomerOrderCard
                key={order.id}
                order={order}
                onOpenDetail={openOrderDetail}
                onOpenTracking={openOrderTracking}
                onCancel={handleCancel}
              />
            ))}

            {!filteredOrders.length && (
              <View className="rounded-[16px] bg-white p-6 items-center">
                <Feather name="package" size={42} color="#B6C1CD" />
                <Text className="mt-3 text-[15px] font-semibold text-[#4B5563]">Chưa có đơn hàng phù hợp</Text>
              </View>
            )}
          </View>
        )}

        <RecommendedProducts products={homeData?.suggestedProducts ?? []} />
      </ScrollView>
    </SafeAreaView>
  );
}
