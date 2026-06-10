import { MainErrorState, MainLoadingState } from "@/components/main/screen-states";
import { SelloHeader } from "@/components/main/sello-header";
import { UISectionHeader } from "@/components/ui";
import { useCategoriesData } from "@/hooks/main/use-main-data";
import { Href, router } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoriesScreen() {
  const { data, loading, errorMessage } = useCategoriesData();

  return (
    <SafeAreaView className="flex-1 bg-[#f5f6f8]" edges={["top"]}>
      <SelloHeader onSearchPress={() => router.push("/main/search" as Href)} />

      {loading ? <MainLoadingState /> : null}
      {!loading && errorMessage ? <MainErrorState message={errorMessage} /> : null}

      {!loading && data ? (
        <ScrollView className="flex-1" contentContainerClassName="px-4 pb-6" showsVerticalScrollIndicator={false}>
          <Pressable className="mb-4 overflow-hidden rounded-[20px] bg-[#13678A] px-5 py-5">
            <View className="flex-row items-center gap-4">
              <View className="flex-1">
                <View className="self-start rounded-full bg-white/15 px-3 py-1">
                  <Text className="text-[10px] font-bold uppercase tracking-[0.8px] text-white">
                    Curated edit
                  </Text>
                </View>
                <Text className="mt-3 text-[28px] font-extrabold leading-[32px] text-white">
                  Shop by style
                </Text>
                <Text className="mt-2 text-[13px] leading-[18px] text-[#D8F0FA]">
                  Explore cleaner category collections with visuals that match what shoppers expect.
                </Text>
              </View>

              <View className="h-[120px] w-[112px] overflow-hidden rounded-[18px] bg-white/10 p-2">
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
                  }}
                  className="h-full w-full rounded-[14px]"
                  resizeMode="cover"
                />
              </View>
            </View>
          </Pressable>

          <View className="flex-row flex-wrap justify-between gap-y-3">
            {data.categoryTiles.map((tile, index) => (
              <Pressable
                key={tile.id}
                className="w-[48.5%] overflow-hidden rounded-[14px] bg-white"
                onPress={() =>
                  router.push(
                    (`/main/product-list?categoryId=${tile.categoryId}&keyword=${encodeURIComponent(tile.title)}` as unknown) as Href,
                  )
                }
              >
                <Image
                  source={{ uri: tile.imageUrl }}
                  className="h-[156px] w-full"
                  resizeMode="cover"
                />
                <View className="min-h-[56px] justify-center px-3 py-3">
                  <Text
                    numberOfLines={2}
                    className="text-center text-[14px] font-bold leading-[18px] text-[#3c4652]"
                  >
                    {tile.title}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View className="mt-5">
            <UISectionHeader title="Popular brands" actionLabel="See all" />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
              {data.popularBrands.map((brand) => (
                <Pressable
                  key={brand}
                  className="h-9 items-center justify-center rounded-[10px] border border-[#e2e7ec] bg-[#eef2f6] px-4"
                  onPress={() =>
                    router.push((`/main/product-list?keyword=${encodeURIComponent(brand)}` as unknown) as Href)
                  }
                >
                  <Text className="text-[12px] font-bold text-[#8b95a0]">{brand}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
