import { CustomerOrderCard } from "@/components/main/orders/customer-order-card";
import { OrderFilterTabs } from "@/components/main/orders/order-filter-tabs";
import { RecommendedProducts } from "@/components/main/orders/recommended-products";
import { SelloHeader } from "@/components/main/sello-header";
import { useAuth } from "@/contexts/auth-context";
import { useOrdersView } from "@/hooks/customer/use-orders-view";
import { useHomeData } from "@/hooks/main/use-main-data";
import { orderService, cartService } from "@/services/customer.service";
import { Order } from "@/types/customer";
import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, Text, View, LayoutAnimation, Platform, UIManager } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { GuestPlaceholder } from "@/components/ui";
import { useSettings } from "@/contexts/settings-context";

export default function OrdersScreen() {
  const { token } = useAuth();
  const { data: homeData } = useHomeData();
  const { filteredOrders, filter, loading, error, setFilter, fetchOrders } = useOrdersView(token);
  const { t } = useSettings();

  const handleSetFilter = (newFilter: any) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilter(newFilter);
  };

  const openOrderDetail = (order: Order) => {
    router.push((`/main/order-detail?orderId=${order.id}` as unknown) as Href);
  };

  const openOrderTracking = (order: Order) => {
    router.push((`/main/order-tracking?orderId=${order.id}` as unknown) as Href);
  };

  const handleCancel = (order: Order) => {
    Alert.alert(
      t("order_cancellation", "Cancel Order"),
      t("cancel_order_confirm_id", "Are you sure you want to cancel order #{id}?").replace("{id}", String(order.id)),
      [
        { text: t("no_cancel", "No"), style: "cancel" },
        {
          text: t("yes_cancel", "Cancel Order"),
          style: "destructive",
          onPress: async () => {
            if (!token) {
              Alert.alert(t("error", "Error"), t("session_expired", "Session has expired."));
              return;
            }

            try {
              await orderService.cancelOrder(token, order.id);
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              await fetchOrders();
            } catch (err: any) {
              Alert.alert(t("error", "Error"), err.message ?? t("cannot_cancel_order", "Cannot cancel order."));
            }
          },
        },
      ]
    );
  };

  const handleBuyAgain = async (order: Order) => {
    if (!token) {
      Alert.alert(t("error", "Error"), t("session_expired", "Session has expired."));
      return;
    }

    Alert.alert(
      t("reorder_title", "Reorder"),
      t("reorder_confirm", "Do you want to add all items from this order to your cart?"),
      [
        { text: t("cancel", "Cancel"), style: "cancel" },
        {
          text: t("agree", "Reorder"),
          onPress: async () => {
            try {
              for (const item of order.items) {
                await cartService.addCartItem(token, {
                  productId: item.productId,
                  variantId: item.variantId ?? null,
                  quantity: item.quantity || 1,
                });
              }
              Alert.alert(
                t("success", "Success"),
                t("added_to_cart_go", "All products added to cart. Go to cart?"),
                [
                  { text: t("later", "Later") },
                  { text: t("cart", "Cart"), onPress: () => router.push("/main/cart" as Href) }
                ]
              );
            } catch (err: any) {
              Alert.alert(t("error", "Error"), err.message ?? t("cart_add_error", "An error occurred while adding items to the cart."));
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top"]}>
      <SelloHeader />
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8 pt-6">
        <Text className="text-[22px] font-extrabold leading-[30px] text-[#1F2934]">{t("my_orders", "My Orders")}</Text>
        <Text className="mt-2 text-[14px] leading-[22px] text-[#4B5563]">
          {t("my_orders_desc", "Track and manage shopping history easily.")}
        </Text>

        {!token ? (
          <GuestPlaceholder
            icon="package"
            title={t("manage_orders", "Manage Orders")}
            description={t("manage_orders_guest_desc", "Sign in to track orders and view your shopping history!")}
          />
        ) : (
          <>
            <OrderFilterTabs value={filter} onChange={handleSetFilter} />

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
                    onBuyAgain={handleBuyAgain}
                  />
                ))}

                {!filteredOrders.length && (
                  <View className="items-center rounded-[16px] bg-white p-6">
                    <Feather name="package" size={42} color="#B6C1CD" />
                    <Text className="mt-3 text-[15px] font-semibold text-[#4B5563]">{t("no_matching_orders", "No matching orders found")}</Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}

        <RecommendedProducts products={homeData?.suggestedProducts ?? []} />
      </ScrollView>
    </SafeAreaView>
  );
}
