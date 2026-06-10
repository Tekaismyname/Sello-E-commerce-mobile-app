import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { UISectionHeader } from "@/components/ui";
import { QuickCategory } from "@/types/main";

type FeaturedCategoriesSectionProps = {
  categories: QuickCategory[];
};

export function FeaturedCategoriesSection({ categories }: FeaturedCategoriesSectionProps) {
  return (
    <View className="mb-5">
      <UISectionHeader
        title="Featured Categories"
        actionLabel="View all"
        onActionPress={() => router.push("/main/categories" as Href)}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 pr-2"
      >
        {categories.map((item) => (
          <Pressable
            key={item.id}
            className="w-[82px] items-center"
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.94 : 1 }],
            })}
            onPress={() =>
              router.push(
                (`/main/product-list?categoryId=${item.categoryId}&keyword=${encodeURIComponent(item.label)}` as unknown) as Href,
              )
            }
          >
            <View
              className="mb-2 h-12 w-12 items-center justify-center rounded-[14px]"
              style={{ backgroundColor: item.color }}
            >
              {item.iconLibrary === "material" ? (
                <MaterialCommunityIcons name={item.icon as never} size={22} color="#4d5866" />
              ) : (
                <Feather name={item.icon as never} size={18} color="#4d5866" />
              )}
            </View>
            <Text
              numberOfLines={2}
              className="min-h-[32px] text-center text-[11px] font-semibold leading-[15px] text-[#4f5c6a]"
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
