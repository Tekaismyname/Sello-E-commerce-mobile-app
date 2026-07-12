import { UIButton } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { cartService } from "@/services/customer.service";
import { triggerLocalNotification } from "@/utils/local-notification";
import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { Alert, Pressable, View } from "react-native";

type ProductBottomActionBarProps = {
  productId: number;
  variantId?: number | null;
  inWishlist: boolean;
  wishlistLoading: boolean;
  onToggleWishlist: () => void;
};

export function ProductBottomActionBar({
  productId,
  variantId,
  inWishlist,
  wishlistLoading,
  onToggleWishlist,
}: ProductBottomActionBarProps) {
  const { token } = useAuth();

  const addToCart = async (goCheckout = false) => {
    if (!token) {
      Alert.alert(
        "Sign-in required",
        "You need to sign in to your Sello account to use this feature.",
        [
          { text: "Later", style: "cancel" },
          {
            text: "Sign in now",
            onPress: () => router.push("/auth/login" as Href),
          },
        ],
      );
      return;
    }

    try {
      await cartService.addCartItem(token, {
        productId,
        variantId: variantId ?? null,
        quantity: 1,
      });

      if (goCheckout) {
        router.push("/main/checkout" as Href);
      } else {
        triggerLocalNotification("Added to cart", "The product has been added to your cart.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Unable to add this product to the cart.");
    }
  };

  return (
    <View className="absolute bottom-0 w-full flex-row items-center gap-3 border-t border-[#e2e8f0] bg-white px-4 py-3 pb-8">
      <Pressable
        className="h-[52px] w-[52px] items-center justify-center rounded-[12px] border border-[#e2e8f0] bg-white disabled:opacity-60"
        disabled={wishlistLoading}
        onPress={onToggleWishlist}
      >
        <Feather name="heart" size={24} color={inWishlist ? "#BE123C" : "#495463"} />
      </Pressable>

      <UIButton
        title="Add to cart"
        variant="light"
        className="h-[52px] flex-1 rounded-[20px] border border-[#1872cc] bg-white"
        textClassName="text-[#1872cc] font-bold text-[15px]"
        onPress={() => addToCart(false)}
      />

      <UIButton
        title="Buy now"
        className="h-[52px] flex-1 items-center justify-center rounded-[12px] bg-[#1872cc]"
        textClassName="text-white-600 font-bold text-[15px]"
        onPress={() => addToCart(true)}
      />
    </View>
  );
}
