import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { CartItem } from "@/types/customer";

type CartItemCardProps = {
  item: CartItem;
  formatPrice: (value: number) => string;
  onToggleSelect: (item: CartItem) => void;
  onUpdateQuantity: (item: CartItem, delta: number) => void;
  onDelete: (item: CartItem) => void;
};

export function CartItemCard({
  item,
  formatPrice,
  onToggleSelect,
  onUpdateQuantity,
  onDelete,
}: CartItemCardProps) {
  return (
    <View className="flex-row items-center gap-3 rounded-[14px] bg-white p-3">
      <Pressable onPress={() => onToggleSelect(item)}>
        <View
          className={`h-5 w-5 items-center justify-center rounded-[4px] border-2 ${
            item.selected ? "border-[#006397] bg-[#006397]" : "border-[#c5cdd6]"
          }`}
        >
          {item.selected ? <Feather name="check" size={12} color="white" /> : null}
        </View>
      </Pressable>

      <Image
        source={{
          uri:
            item.productImage ||
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80",
        }}
        className="h-16 w-16 rounded-[8px]"
        contentFit="cover"
      />

      <View className="flex-1">
        <Text className="text-[14px] font-semibold text-[#1f2934]" numberOfLines={2}>
          {item.productName}
        </Text>
        <Text className="mt-1 text-[15px] font-bold text-[#006397]">{formatPrice(item.price)}</Text>

        <View className="mt-2 flex-row items-center gap-2">
          <Pressable
            className="h-7 w-7 items-center justify-center rounded-full bg-[#f2f4f7]"
            onPress={() => onUpdateQuantity(item, -1)}
          >
            <Feather name="minus" size={14} color="#465362" />
          </Pressable>
          <Text className="w-6 text-center text-[14px] font-semibold text-[#1f2934]">{item.quantity}</Text>
          <Pressable
            className="h-7 w-7 items-center justify-center rounded-full bg-[#f2f4f7]"
            onPress={() => onUpdateQuantity(item, 1)}
          >
            <Feather name="plus" size={14} color="#465362" />
          </Pressable>
        </View>
      </View>

      <Pressable onPress={() => onDelete(item)} className="p-2">
        <Feather name="trash-2" size={16} color="#BA1A1A" />
      </Pressable>
    </View>
  );
}
