import { CartItem } from "@/types/customer";
import { SwipeableRow } from "@/components/ui";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

type CheckoutOrderSummaryProps = {
  items: CartItem[];
  updatingItemId?: number | null;
  deletingItemId?: number | null;
  onChangeQuantity?: (item: CartItem, nextQuantity: number) => void;
  onRemoveFromCheckout?: (item: CartItem) => void;
};

export function CheckoutOrderSummary({
  items,
  updatingItemId,
  deletingItemId,
  onChangeQuantity,
  onRemoveFromCheckout,
}: CheckoutOrderSummaryProps) {
  return (
    <View className="rounded-[16px] bg-white p-4">
      <Text className="text-[17px] font-extrabold text-[#1F2934]">Order summary</Text>

      <View className="mt-3 gap-3">
        {items.map((item, index) => {
          const isBusy = deletingItemId === item.id || updatingItemId === item.id;
          const row = (
            <View className="flex-row bg-white">
              <Image
                source={{
                  uri:
                    item.productImage ||
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80",
                }}
                className="h-[78px] w-[86px] rounded-[10px]"
              />
              <View className="ml-3 flex-1">
                <Text className="text-[16px] font-extrabold leading-[22px] text-[#1F2934]" numberOfLines={2}>
                  {item.productName}
                </Text>
                <Text className="mt-1 text-[14px] text-[#64748B]">
                  {item.variantId ? `Variant: #${item.variantId}` : "Variant: Default"}
                </Text>
                <View className="mt-1 flex-row items-center">
                  <Text className="text-[15px] font-extrabold text-[#0369A1]">{formatPrice(item.price)}</Text>
                  <Text className="ml-1 text-[14px] text-[#64748B]">x{item.quantity}</Text>
                </View>
                {onChangeQuantity || onRemoveFromCheckout ? (
                  <View className="mt-2 flex-row items-center justify-between">
                    {onChangeQuantity ? (
                      <View className="flex-row items-center">
                        <Pressable
                          disabled={item.quantity <= 1 || isBusy}
                          className={`h-8 w-8 items-center justify-center rounded-full ${
                            item.quantity <= 1 || isBusy ? "bg-[#EEF2F6]" : "bg-[#EAF5FC]"
                          }`}
                          onPress={() => onChangeQuantity(item, item.quantity - 1)}
                        >
                          <Feather name="minus" size={14} color={item.quantity <= 1 ? "#A5B0BD" : "#0369A1"} />
                        </Pressable>
                        <Text className="w-10 text-center text-[14px] font-bold text-[#1F2934]">{item.quantity}</Text>
                        <Pressable
                          disabled={isBusy}
                          className={`h-8 w-8 items-center justify-center rounded-full ${
                            isBusy ? "bg-[#EEF2F6]" : "bg-[#EAF5FC]"
                          }`}
                          onPress={() => onChangeQuantity(item, item.quantity + 1)}
                        >
                          <Feather name="plus" size={14} color="#0369A1" />
                        </Pressable>
                      </View>
                    ) : (
                      <View />
                    )}

                    {onRemoveFromCheckout ? (
                      <Pressable
                        disabled={isBusy}
                        className={`ml-3 h-8 flex-row items-center rounded-full px-3 ${
                          isBusy ? "bg-[#F3F4F6]" : "bg-[#FDECEC]"
                        }`}
                        onPress={() => onRemoveFromCheckout(item)}
                      >
                        {deletingItemId === item.id ? (
                          <ActivityIndicator size="small" color="#BA1A1A" />
                        ) : (
                          <Feather name="trash-2" size={13} color="#BA1A1A" />
                        )}
                        <Text className="ml-1.5 text-[12px] font-bold text-[#BA1A1A]">Remove</Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
              </View>
            </View>
          );

          return (
            <Animated.View
              key={item.id}
              entering={FadeInUp.delay(index * 50).springify()}
              layout={Layout.springify()}
            >
              {onRemoveFromCheckout && !isBusy ? (
                <SwipeableRow onDelete={() => onRemoveFromCheckout(item)} borderRadius={12}>
                  {row}
                </SwipeableRow>
              ) : (
                row
              )}
            </Animated.View>
          );
        })}

        {!items.length && (
          <Text className="text-[14px] text-[#64748B]">No products have been selected for checkout.</Text>
        )}
      </View>
    </View>
  );
}
