import { Feather } from "@expo/vector-icons";
import { Pressable } from "react-native";

type ProductFavoriteButtonProps = {
  isFavorite?: boolean;
  onPress?: () => void;
  className?: string;
  color?: string;
};

export function ProductFavoriteButton({ isFavorite, onPress, className, color }: ProductFavoriteButtonProps) {
  return (
    <Pressable 
      onPress={onPress}
      className={`h-10 w-10 items-center justify-center rounded-full bg-[#f3f5f8] active:bg-[#e2e8f0] ${className ?? ""}`}
    >
      <Feather 
        name="heart" 
        size={24} 
        color={isFavorite ? (color || "#BA1A1A") : "#495463"} 
      />
    </Pressable>
  );
}
