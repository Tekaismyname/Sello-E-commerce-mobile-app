import { CartItem } from "@/types/customer";
import { Feather } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

type CheckoutOrderSummaryProps = {
  items: CartItem[];
  updatingItemId?: number | null;
  onChangeQuantity?: (item: CartItem, nextQuantity: number) => void;
};

export function CheckoutOrderSummary({
  items,
  updatingItemId,
  onChangeQuantity,
}: CheckoutOrderSummaryProps) {
  return (
    <View className="rounded-[16px] bg-white p-4">
      <Text className="text-[17px] font-extrabold text-[#1F2934]">Tóm tắt đơn hàng</Text>

      <View className="mt-3 gap-3">
        {items.map((item) => (
          <View key={item.id} className="flex-row">
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
                {item.variantId ? `Phân loại: #${item.variantId}` : "Phân loại: Mặc định"}
              </Text>
              <View className="mt-1 flex-row items-center">
                <Text className="text-[15px] font-extrabold text-[#0369A1]">{formatPrice(item.price)}</Text>
                <Text className="ml-1 text-[14px] text-[#64748B]">x{item.quantity}</Text>
              </View>
              {onChangeQuantity ? (
                <View className="mt-2 flex-row items-center">
                  <Pressable
                    disabled={item.quantity <= 1 || updatingItemId === item.id}
                    className={`h-8 w-8 items-center justify-center rounded-full ${
                      item.quantity <= 1 || updatingItemId === item.id ? "bg-[#EEF2F6]" : "bg-[#EAF5FC]"
                    }`}
                    onPress={() => onChangeQuantity(item, item.quantity - 1)}
                  >
                    <Feather name="minus" size={14} color={item.quantity <= 1 ? "#A5B0BD" : "#0369A1"} />
                  </Pressable>
                  <Text className="w-10 text-center text-[14px] font-bold text-[#1F2934]">{item.quantity}</Text>
                  <Pressable
                    disabled={updatingItemId === item.id}
                    className={`h-8 w-8 items-center justify-center rounded-full ${
                      updatingItemId === item.id ? "bg-[#EEF2F6]" : "bg-[#EAF5FC]"
                    }`}
                    onPress={() => onChangeQuantity(item, item.quantity + 1)}
                  >
                    <Feather name="plus" size={14} color="#0369A1" />
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>
        ))}

        {!items.length && (
          <Text className="text-[14px] text-[#64748B]">Không có sản phẩm được chọn để thanh toán.</Text>
        )}
      </View>
    </View>
  );
}
