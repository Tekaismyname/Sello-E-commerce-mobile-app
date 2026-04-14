import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { UISectionHeader } from "@/components/ui";
import { QuickCategory } from "@/types/main";

type FeaturedCategoriesSectionProps = {
  categories: QuickCategory[];
};

export function FeaturedCategoriesSection({ categories }: FeaturedCategoriesSectionProps) {
  return (
    <View className="mb-5">
      <UISectionHeader
        title="Danh mục nổi bật"
        actionLabel="Xem tất cả"
        onActionPress={() => router.push("/main/categories" as Href)}
      />

      <View className="flex-row items-start justify-between">
        {categories.map((item) => (
          <Pressable
            key={item.id}
            className="w-[18.5%] items-center"
            onPress={() =>
              router.push((`/main/product-list?keyword=${encodeURIComponent(item.label)}` as unknown) as Href)
            }
          >
            <View
              className="mb-2 h-11 w-11 items-center justify-center rounded-[12px]"
              style={{ backgroundColor: item.color }}
            >
              <Feather name={item.icon as never} size={18} color="#4d5866" />
            </View>
            <Text className="text-center text-[10px] font-semibold leading-[13px] text-[#4f5c6a]">{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
