import { CartItem } from "@/types/customer";
import { Image, Text, View } from "react-native";

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

type CheckoutOrderSummaryProps = {
  items: CartItem[];
};

export function CheckoutOrderSummary({ items }: CheckoutOrderSummaryProps) {
  return (
    <View className="rounded-[16px] bg-white p-4">
      <Text className="text-[17px] font-extrabold text-[#1F2934]">Tom tat don hang</Text>

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
                {item.variantId ? `Phan loai: #${item.variantId}` : "Phan loai: Mac dinh"}
              </Text>
              <View className="mt-1 flex-row items-center">
                <Text className="text-[15px] font-extrabold text-[#0369A1]">{formatPrice(item.price)}</Text>
                <Text className="ml-1 text-[14px] text-[#64748B]">x{item.quantity}</Text>
              </View>
            </View>
          </View>
        ))}

        {!items.length && (
          <Text className="text-[14px] text-[#64748B]">Khong co san pham duoc chon de thanh toan.</Text>
        )}
      </View>
    </View>
  );
}
