import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { UISectionHeader } from "@/components/ui";
import { QuickCategory } from "@/types/main";

import { useSettings } from "@/contexts/settings-context";

type FeaturedCategoriesSectionProps = {
  categories: QuickCategory[];
};

export function FeaturedCategoriesSection({ categories }: FeaturedCategoriesSectionProps) {
  const { t } = useSettings();

  return (
    <View className="mb-5">
      <UISectionHeader
        title={t("featured_categories", "Featured Categories")}
        actionLabel={t("view_all", "View All")}
        onActionPress={() => router.push("/main/categories" as Href)}
      />

      <View className="flex-row items-start justify-between">
        {categories.map((item) => (
          <Pressable
            key={item.id}
            className="w-[18.5%] items-center"
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.94 : 1 }],
            })}
            onPress={() =>
              router.push((`/main/product-list?keyword=${encodeURIComponent(item.label)}&categoryId=${item.id.replace("cat-", "")}` as unknown) as Href)
            }
          >
            <View
              className="mb-2 h-11 w-11 items-center justify-center rounded-[12px]"
              style={{ backgroundColor: item.color }}
            >
              <MaterialCommunityIcons name={item.icon as never} size={18} color="#4d5866" />
            </View>
            <Text className="text-center text-[10px] font-semibold leading-[13px] text-[#4f5c6a]">{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
