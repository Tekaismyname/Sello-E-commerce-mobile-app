import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type ProductQuantitySelectorProps = {
  quantity: number;
  maxQuantity?: number;
  onChange: (quantity: number) => void;
};

export function ProductQuantitySelector({
  quantity,
  maxQuantity,
  onChange,
}: ProductQuantitySelectorProps) {
  const canDecrease = quantity > 1;
  const canIncrease = maxQuantity === undefined || quantity < maxQuantity;

  return (
    <View className="bg-white px-4 py-5">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-[14px] font-bold uppercase tracking-wider text-[#191C1F]">
          So luong
        </Text>
        <Text className="text-[13px] text-[#607080]">
          {maxQuantity && maxQuantity > 0 ? `Con ${maxQuantity} san pham` : "Con hang"}
        </Text>
      </View>

      <View className="flex-row items-center justify-between rounded-[16px] border border-[#D8E2EC] bg-[#F8FBFE] px-4 py-3">
        <Pressable
          className={`h-10 w-10 items-center justify-center rounded-full ${canDecrease ? "bg-white" : "bg-[#EEF3F7]"}`}
          disabled={!canDecrease}
          onPress={() => canDecrease && onChange(quantity - 1)}
        >
          <Feather name="minus" size={18} color={canDecrease ? "#244153" : "#A1AFBB"} />
        </Pressable>

        <Text className="text-[20px] font-extrabold text-[#12212D]">{quantity}</Text>

        <Pressable
          className={`h-10 w-10 items-center justify-center rounded-full ${canIncrease ? "bg-[#0F6CBD]" : "bg-[#D6E1EA]"}`}
          disabled={!canIncrease}
          onPress={() => canIncrease && onChange(quantity + 1)}
        >
          <Feather name="plus" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
