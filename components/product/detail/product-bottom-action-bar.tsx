import { UIButton } from "@/components/ui/button";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type ProductBottomActionBarProps = {
  stockText?: string;
  onOpenCart: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  addToCartLoading?: boolean;
  buyNowLoading?: boolean;
  disabled?: boolean;
};

export function ProductBottomActionBar({
  stockText,
  onOpenCart,
  onAddToCart,
  onBuyNow,
  addToCartLoading = false,
  buyNowLoading = false,
  disabled = false,
}: ProductBottomActionBarProps) {
  const actionDisabled = disabled || addToCartLoading || buyNowLoading;

  return (
    <View className="absolute bottom-0 w-full border-t border-[#DCE5EE] bg-white px-4 pb-8 pt-3">
      {stockText ? (
        <Text className="mb-2 text-[12px] font-semibold text-[#607080]">{stockText}</Text>
      ) : null}

      <View className="flex-row items-center gap-3">
        <Pressable
          className="h-[52px] w-[52px] items-center justify-center rounded-[16px] border border-[#D6E1EA] bg-[#F6FAFD]"
          disabled={actionDisabled}
          onPress={onOpenCart}
        >
          <Feather name="shopping-cart" size={22} color="#244153" />
        </Pressable>

        <UIButton
          title="Them vao gio"
          loading={addToCartLoading}
          disabled={actionDisabled}
          className="h-[52px] flex-1 rounded-[16px] border border-[#0F6CBD] bg-[#EAF4FF]"
          textClassName="text-[15px] font-bold text-[#0F6CBD]"
          onPress={onAddToCart}
        />

        <UIButton
          title="Mua ngay"
          loading={buyNowLoading}
          disabled={actionDisabled}
          className="h-[52px] flex-1 rounded-[16px] bg-[#0F172A]"
          textClassName="text-[15px] font-bold text-white"
          onPress={onBuyNow}
        />
      </View>
    </View>
  );
}
