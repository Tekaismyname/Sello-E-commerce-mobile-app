import { CustomerOrderCard } from "@/components/main/orders/customer-order-card";
import { OrderFilterTabs } from "@/components/main/orders/order-filter-tabs";
import { OrderReasonPicker } from "@/components/main/orders/order-reason-picker";
import { RecommendedProducts } from "@/components/main/orders/recommended-products";
import { SelloHeader } from "@/components/main/sello-header";
import { useAuth } from "@/contexts/auth-context";
import { useOrdersView } from "@/hooks/customer/use-orders-view";
import { useHomeData } from "@/hooks/main/use-main-data";
import { orderService } from "@/services/customer.service";
import { Order } from "@/types/customer";
import { buildOrderPaymentHref } from "@/utils/order-payment";
import { CANCEL_REASON_OPTIONS } from "@/utils/order-reasons";
import { prepareOrderItemsForCheckout } from "@/utils/order-reorder";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, Href, router } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TextInput, View, LayoutAnimation, Platform, UIManager } from "react-native";
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

  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchOrders();
      }
    }, [token, fetchOrders])
  );

  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelReasonCode, setCancelReasonCode] = useState<string | null>(null);
  const [cancelNote, setCancelNote] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);

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

  const openContinuePayment = (order: Order) => {
    router.push(buildOrderPaymentHref(order));
  };

  const openWriteReview = (order: Order) => {
    const item = order.items[0];

    if (!item) {
      openOrderDetail(order);
      return;
    }

    router.push({
      pathname: "/product/write-review",
      params: {
        productId: String(item.productId),
        productName: item.productName,
        productImage: item.productImage ?? "",
      },
    });
  };

  const handleCancel = (order: Order) => {
    setCancelTarget(order);
    setCancelReasonCode(null);
    setCancelNote("");
  };

  const closeCancelModal = () => {
    setCancelTarget(null);
    setCancelReasonCode(null);
    setCancelNote("");
  };

  const handleSubmitCancel = async () => {
    if (!cancelTarget) return;

    if (!token) {
      Alert.alert(t("error", "Error"), t("session_expired", "Session has expired."));
      return;
    }

    try {
      setSubmittingCancel(true);
      await orderService.cancelOrder(token, cancelTarget.id, cancelReasonCode ?? undefined, cancelNote.trim() || undefined);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      closeCancelModal();
      await fetchOrders();
    } catch (err: any) {
      Alert.alert(t("error", "Error"), err.message ?? t("cannot_cancel_order", "Cannot cancel order."));
    } finally {
      setSubmittingCancel(false);
    }
  };

  const handleBuyAgain = async (order: Order) => {
    if (!token) {
      Alert.alert(t("error", "Error"), t("session_expired", "Session has expired."));
      return;
    }

    try {
      await prepareOrderItemsForCheckout(token, order);
      router.push("/main/checkout" as Href);
    } catch (err: any) {
      Alert.alert(t("error", "Error"), err.message ?? t("cart_add_error", "An error occurred while preparing checkout."));
    }
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
                    onWriteReview={openWriteReview}
                    onContinuePayment={openContinuePayment}
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

      <Modal
        visible={!!cancelTarget}
        transparent
        animationType="fade"
        onRequestClose={closeCancelModal}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-5">
          <View className="w-full rounded-[24px] bg-white p-5 shadow-lg">
            <Text className="text-center text-[18px] font-extrabold text-[#1F2934]">
              {t("order_cancellation", "Cancel Order")}
            </Text>
            <Text className="mt-2 text-center text-[13px] text-[#4B5563]">
              {t("cancel_reason_prompt", "Let us know why so we can improve. Order #{id}").replace(
                "{id}",
                String(cancelTarget?.id ?? ""),
              )}
            </Text>

            <View className="mt-4">
              <OrderReasonPicker
                options={CANCEL_REASON_OPTIONS}
                selectedCode={cancelReasonCode}
                onSelect={setCancelReasonCode}
                translate={t}
              />
            </View>

            <TextInput
              className="mt-4 min-h-[70px] rounded-[14px] bg-[#F3F5FA] p-3 text-[14px] text-[#1F2934]"
              multiline
              placeholder={t("cancel_reason_note_placeholder", "Additional details (optional)")}
              placeholderTextColor="#9CA3AF"
              value={cancelNote}
              onChangeText={setCancelNote}
              textAlignVertical="top"
            />

            <View className="mt-4 flex-row gap-3">
              <Pressable
                className="flex-1 h-11 items-center justify-center rounded-[12px] bg-[#F3F5FA] active:opacity-85"
                onPress={closeCancelModal}
                disabled={submittingCancel}
              >
                <Text className="text-[14px] font-bold text-[#4B5563]">{t("no_cancel", "No")}</Text>
              </Pressable>

              <Pressable
                className="flex-1 h-11 items-center justify-center rounded-[12px] bg-[#DC2626] active:opacity-85 disabled:opacity-50"
                onPress={handleSubmitCancel}
                disabled={submittingCancel || !cancelReasonCode}
              >
                <Text className="text-[14px] font-bold text-white">
                  {submittingCancel ? t("submitting", "Submitting...") : t("yes_cancel", "Cancel Order")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
