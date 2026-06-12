import { Href, router } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MainErrorState, MainLoadingState } from "@/components/main/screen-states";
import { SelloHeader } from "@/components/main/sello-header";
import { UISectionHeader } from "@/components/ui";
import { useCategoriesData } from "@/hooks/main/use-main-data";
import { useSettings } from "@/contexts/settings-context";

export default function CategoriesScreen() {
  const { data, loading, errorMessage } = useCategoriesData();
  const { t } = useSettings();

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={["top"]}>
      <SelloHeader onSearchPress={() => router.push("/main/search" as Href)} />

      {loading ? <MainLoadingState /> : null}
      {!loading && errorMessage ? <MainErrorState message={errorMessage} /> : null}

      {!loading && data ? (
        <ScrollView className="flex-1" contentContainerClassName="px-4 pb-10" showsVerticalScrollIndicator={false}>
          {/* Highlight Banner */}
          <Pressable 
            className="mb-6 h-[170px] overflow-hidden rounded-[24px] bg-[#006397] shadow-md relative"
            onPress={() => router.push("/main/product-list?keyword=Technology" as Href)}
            style={({ pressed }) => [
              { opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }
            ]}
          >
            {/* Background design accents */}
            <View className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-white/5" />
            <View className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/10" />

            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80",
              }}
              className="absolute right-0 h-full w-[44%]"
              resizeMode="cover"
            />
            
            <View className="flex-1 justify-between p-5 pr-[46%]">
              <View className="self-start rounded-full bg-[#10B981] px-2.5 py-1">
                <Text className="text-[9px] font-extrabold uppercase tracking-[0.8px] text-white">
                  {t("october_highlight", "HIGHLIGHT OF THE MONTH")}
                </Text>
              </View>
              
              <View>
                <Text className="text-[26px] font-black leading-[30px] text-white" numberOfLines={2}>
                  {t("tech_peak", "Ultimate Technology")}
                </Text>
                <Text className="mt-1 text-[11px] font-medium text-[#E0F2FE]">
                  {t("tech_peak_desc", "Up to 40% off on all phones and laptops")}
                </Text>
              </View>
            </View>
          </Pressable>

          {/* Categories Section Header */}
          <View className="mb-3">
            <Text className="text-[17px] font-black text-[#1F2937]">
              {t("shop_by_category", "Shop by Category")}
            </Text>
            <Text className="text-[11px] font-bold text-[#9CA3AF] mt-0.5">
              {t("explore_thousands_products", "Explore thousands of products by category")}
            </Text>
          </View>

          {/* Grid Layout */}
          <View className="flex-row flex-wrap justify-between gap-y-3.5">
            {data.categoryTiles.map((tile) => (
              <Pressable
                key={tile.id}
                className="w-[48.2%] h-[180px] overflow-hidden rounded-[20px] bg-[#E5E7EB] shadow-sm relative"
                onPress={() =>
                  router.push((`/main/product-list?keyword=${encodeURIComponent(tile.title)}&categoryId=${tile.id.replace("tile-", "")}` as unknown) as Href)
                }
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.98 : 1 }] }
                ]}
              >
                <Image
                  source={{ uri: tile.imageUrl }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
                
                {/* Visual overlay for reading text on any image */}
                <View 
                  className="absolute inset-0 justify-end"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.38)", // Safe overlay
                  }}
                >
                  <View className="p-3.5">
                    <Text className="text-[15px] font-black text-white tracking-[0.2px]">
                      {tile.title}
                    </Text>
                    <Text className="text-[9.5px] font-bold text-white/70 mt-0.5">
                      {tile.subtitle || t("explore_collections", "Explore collections")}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Popular Brands Section */}
          <View className="mt-7">
            <UISectionHeader
              title={t("popular_brands", "Popular Brands")}
              actionLabel={t("view_all", "View All")}
            />

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerClassName="px-0.5 py-1 gap-2.5"
            >
              {data.popularBrands.map((brand) => (
                <Pressable
                  key={brand}
                  className="h-[40px] items-center justify-center rounded-full border border-[#E5E7EB] bg-white px-5 shadow-sm"
                  onPress={() =>
                    router.push((`/main/product-list?keyword=${encodeURIComponent(brand)}` as unknown) as Href)
                  }
                  style={({ pressed }) => [
                    { backgroundColor: pressed ? "#F3F4F6" : "white" }
                  ]}
                >
                  <Text className="text-[13px] font-bold text-[#4B5563]">{brand}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
