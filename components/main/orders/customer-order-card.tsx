import { Order } from "@/types/customer";
import { canContinueOrderPayment } from "@/utils/order-payment";
import { Feather } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";
import { useSettings } from "@/contexts/settings-context";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";

type CustomerOrderCardProps = {
  order: Order;
  onOpenDetail: (order: Order) => void;
  onOpenTracking: (order: Order) => void;
  onCancel: (order: Order) => void;
  onBuyAgain: (order: Order) => void;
  onWriteReview?: (order: Order) => void;
  onContinuePayment?: (order: Order) => void;
};

const statusConfig = {
  delivered: { color: "#15803D", icon: "check-circle" as const },
  shipping: { color: "#0369A1", icon: "truck" as const },
  packed: { color: "#0369A1", icon: "package" as const },
  confirmed: { color: "#7C3AED", icon: "clock" as const },
  pending: { color: "#7C3AED", icon: "clock" as const },
  cancelled: { color: "#B91C1C", icon: "x-circle" as const },
  returned: { color: "#92400E", icon: "rotate-ccw" as const },
  return_requested: { color: "#DC2626", icon: "rotate-ccw" as const },
};

const getStatusLabel = (statusKey: string, t: (key: string, def?: string) => string) => {
  if (statusKey === "delivered") return t("order_status_delivered", "DELIVERED");
  if (statusKey === "shipping") return t("order_status_shipping", "SHIPPING");
  if (statusKey === "packed") return t("order_status_packed", "PACKED");
  if (statusKey === "confirmed") return t("order_status_confirmed", "CONFIRMED");
  if (statusKey === "pending") return t("order_status_pending", "PENDING");
  if (statusKey === "cancelled") return t("order_status_cancelled", "CANCELLED");
  if (statusKey === "returned") return t("order_status_returned", "RETURNED");
  if (statusKey === "return_requested") return t("order_status_return_requested", "RETURN REQUESTED");
  return t("order_status_pending", "PENDING");
};

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export function CustomerOrderCard({
  order,
  onOpenDetail,
  onOpenTracking,
  onCancel,
  onBuyAgain,
  onWriteReview,
  onContinuePayment,
}: CustomerOrderCardProps) {
  const { t } = useSettings();
  const statusLabel = getStatusLabel(order.status, t);
  const status = statusConfig[order.status] ?? statusConfig.pending;
  const normalizedItems = order.items.map((item) => ({
    ...item,
    quantity: Math.max(item.quantity ?? 1, 1),
  }));
  const primaryItem = normalizedItems[0];
  const imageSource =
    primaryItem?.productImage && primaryItem.productImage.trim()
      ? primaryItem.productImage
      : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80";
  const orderLabel = order.orderCode?.trim() ? order.orderCode : `${t("my_orders", "Order")} #${order.id}`;
  const itemCount = normalizedItems.reduce((total, current) => total + current.quantity, 0);
  const hasMultipleItems = normalizedItems.length > 1;
  const canContinuePayment = canContinueOrderPayment(order);

  const renderActions = () => {
    if (canContinuePayment && onContinuePayment) {
      return (
        <View className="flex-row gap-2">
          <Pressable className="rounded-[12px] bg-[#0F6CBD] px-3.5 py-2.5" onPress={() => onContinuePayment(order)}>
            <Text className="text-[13px] font-bold text-white">{t("pay_now", "Pay now")}</Text>
          </Pressable>
          <Pressable className="rounded-[12px] bg-[#FDECEC] px-3.5 py-2.5" onPress={() => onCancel(order)}>
            <Text className="text-[13px] font-bold text-[#BA1A1A]">{t("yes_cancel", "Cancel Order")}</Text>
          </Pressable>
        </View>
      );
    }

    if (order.status === "pending" || order.status === "confirmed") {
      return (
        <Pressable className="rounded-[12px] bg-[#FDECEC] px-4 py-2.5" onPress={() => onCancel(order)}>
          <Text className="text-[13px] font-bold text-[#BA1A1A]">{t("yes_cancel", "Cancel Order")}</Text>
        </Pressable>
      );
    }

    if (order.status === "shipping" || order.status === "packed") {
      return (
        <Pressable className="rounded-[12px] bg-[#E8F1FB] px-4 py-2.5" onPress={() => onOpenTracking(order)}>
          <Text className="text-[13px] font-bold text-[#0369A1]">{t("order_track", "Track Order")}</Text>
        </Pressable>
      );
    }

    if (order.status === "return_requested") {
      return (
        <View className="rounded-[12px] bg-red-50 px-4 py-2.5">
          <Text className="text-[13px] font-bold text-red-600">{t("awaiting_approval", "Awaiting Approval")}</Text>
        </View>
      );
    }

    if (order.status === "delivered") {
      return (
        <View className="flex-row gap-2">
          <Pressable
            className="rounded-[12px] bg-[#E8F1FB] px-3.5 py-2.5"
            onPress={() => (onWriteReview ? onWriteReview(order) : onOpenDetail(order))}
          >
            <Text className="text-[13px] font-bold text-[#0369A1]">{t("write_review", "Write Review")}</Text>
          </Pressable>
          <Pressable className="rounded-[12px] bg-[#0F6CBD] px-3.5 py-2.5" onPress={() => onBuyAgain(order)}>
            <Text className="text-[13px] font-bold text-white">{t("buy_again", "Buy Again")}</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <Pressable className="rounded-[12px] bg-[#0F6CBD] px-4 py-2.5" onPress={() => onBuyAgain(order)}>
        <Text className="text-[13px] font-bold text-white">{t("buy_again", "Buy Again")}</Text>
      </Pressable>
    );
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(360).springify()}
      layout={Layout.springify()}
      className="rounded-[18px] bg-white p-4"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Feather name={status.icon} size={14} color={status.color} />
          <Text className="ml-2 text-[12px] font-extrabold tracking-[0.4px]" style={{ color: status.color }}>
            {statusLabel}
          </Text>
        </View>
        <Text className="text-[12px] font-medium text-[#6B7280]">{formatDate(order.createdAt)}</Text>
      </View>

      <Pressable className="mt-3 flex-row" onPress={() => onOpenDetail(order)}>
        <Image source={{ uri: imageSource }} className="h-[92px] w-[92px] rounded-[14px] bg-[#F3F4F6]" />
        <View className="ml-4 flex-1">
          <Text className="text-[12px] font-bold uppercase tracking-[0.5px] text-[#64748B]">{orderLabel}</Text>

          {!hasMultipleItems ? (
            <>
              <Text className="mt-1 text-[17px] font-extrabold leading-[23px] text-[#1F2934]" numberOfLines={2}>
                {primaryItem?.productName ?? `${t("my_orders", "Order")} #${order.id}`}
              </Text>
              {!!primaryItem?.variantSnapshot && (
                <Text className="mt-1 text-[13px] text-[#64748B]" numberOfLines={1}>
                  {primaryItem.variantSnapshot}
                </Text>
              )}
              <Text className="mt-1 text-[13px] font-medium text-[#64748B]">{t("quantity", "Quantity")}: {primaryItem?.quantity ?? 1}</Text>
            </>
          ) : (
            <View className="mt-1 gap-1">
              {normalizedItems.slice(0, 3).map((item) => (
                <Text
                  key={`${order.id}-${item.id}-${item.productId}`}
                  className="text-[13px] font-semibold leading-[18px] text-[#1F2934]"
                  numberOfLines={1}
                >
                  {item.productName} x{item.quantity}
                </Text>
              ))}
              {normalizedItems.length > 3 ? (
                <Text className="text-[12px] font-medium text-[#64748B]">
                  {t("other_items", "+{count} other items").replace("{count}", String(normalizedItems.length - 3))}
                </Text>
              ) : null}
            </View>
          )}

          <View className="mt-2 flex-row flex-wrap items-center gap-2">
            <View className="rounded-full bg-[#EEF5FB] px-2.5 py-1">
              <Text className="text-[11px] font-bold text-[#0F6CBD]">{t("items_count", "{count} items").replace("{count}", String(itemCount))}</Text>
            </View>
            {order.paymentStatus ? (
              <View className="rounded-full bg-[#F4F4F5] px-2.5 py-1">
                <Text className="text-[11px] font-bold uppercase text-[#52525B]">{order.paymentStatus}</Text>
              </View>
            ) : null}
          </View>

          <Text className="mt-3 text-[18px] font-extrabold text-[#0369A1]">{formatPrice(order.totalAmount)}</Text>
        </View>
      </Pressable>

      <View className="mt-4 rounded-[14px] bg-[#F8FAFC] px-3 py-2.5">
        <View className="flex-row items-center justify-between">
          <Text className="text-[12px] font-semibold text-[#64748B]">{t("order_code", "Order Code")}</Text>
          <Text className="text-[12px] font-extrabold text-[#1F2934]">{orderLabel}</Text>
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        <Pressable onPress={() => onOpenDetail(order)}>
          <Text className="text-[13px] font-bold text-[#0369A1]">{t("view_details", "View Details")}</Text>
        </Pressable>
        {renderActions()}
      </View>
    </Animated.View>
  );
}
