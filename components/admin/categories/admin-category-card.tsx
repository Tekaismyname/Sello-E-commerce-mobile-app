import { AdminCategory } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";

type Props = {
  category: AdminCategory;
  onEdit?: (item: AdminCategory) => void;
  onToggleStatus?: (item: AdminCategory) => void;
  onDelete?: (item: AdminCategory) => void;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80";

export function AdminCategoryCard({ category, onEdit, onToggleStatus, onDelete }: Props) {
  const isActive = category.status === "active";
  const imageUrl = category.imageUrl?.trim() || fallbackImage;

  return (
    <View className={`rounded-[16px] bg-white p-4 ${!isActive ? "opacity-70" : ""}`}>
      <View className="flex-row items-start gap-3">
        <Image source={{ uri: imageUrl }} className="h-16 w-16 rounded-[12px] bg-[#EEF2F6]" resizeMode="cover" />
        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <View className="flex-1">
              <Text className="text-[18px] font-extrabold text-[#111827]">{category.name}</Text>
              <Text className="mt-1 text-[12px] text-[#6B7280]">
                {category.productCount ?? 0} san pham
                {category.childCount ? ` • ${category.childCount} danh muc con` : ""}
              </Text>
              {category.parentName ? (
                <Text className="mt-1 text-[12px] font-semibold text-[#0F6CBD]">Cha: {category.parentName}</Text>
              ) : null}
            </View>
            <View className={`rounded-full px-3 py-1 ${isActive ? "bg-[#DCFCE7]" : "bg-[#FEE2E2]"}`}>
              <Text className={`text-[11px] font-bold ${isActive ? "text-[#15803D]" : "text-[#B91C1C]"}`}>
                {isActive ? "Active" : "Hidden"}
              </Text>
            </View>
          </View>

          {!!category.description && (
            <Text className="mt-2 text-[13px] leading-[18px] text-[#4B5563]" numberOfLines={2}>
              {category.description}
            </Text>
          )}
        </View>
      </View>

      {onEdit || onToggleStatus || onDelete ? (
        <View className="mt-4 flex-row gap-2 border-t border-[#EEF2F6] pt-3">
          {onEdit ? (
            <Pressable className="flex-1 h-10 items-center justify-center rounded-[10px] bg-[#E8F1FB]" onPress={() => onEdit(category)}>
              <Text className="text-[13px] font-bold text-[#0369A1]">Sua</Text>
            </Pressable>
          ) : null}
          {onToggleStatus ? (
            <Pressable className="flex-1 h-10 items-center justify-center rounded-[10px] bg-[#F3F4F6]" onPress={() => onToggleStatus(category)}>
              <Text className="text-[13px] font-bold text-[#374151]">{isActive ? "An" : "Hien"}</Text>
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable className="h-10 w-10 items-center justify-center rounded-[10px] bg-[#FEE2E2]" onPress={() => onDelete(category)}>
              <Feather name="trash-2" size={16} color="#B91C1C" />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
