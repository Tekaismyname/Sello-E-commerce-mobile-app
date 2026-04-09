import { Href, router } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MainErrorState, MainLoadingState } from "@/components/main/screen-states";
import { SelloHeader } from "@/components/main/sello-header";
import { UISectionHeader } from "@/components/ui";
import { useCategoriesData } from "@/hooks/main/use-main-data";

export default function CategoriesScreen() {
  const { data, loading, errorMessage } = useCategoriesData();

  return (
    <SafeAreaView className="flex-1 bg-[#f5f6f8]" edges={["top"]}>
      <SelloHeader onSearchPress={() => router.push("/main/search" as Href)} />

      {loading ? <MainLoadingState /> : null}
      {!loading && errorMessage ? <MainErrorState message={errorMessage} /> : null}

      {!loading && data ? (
        <ScrollView className="flex-1" contentContainerClassName="px-4 pb-6" showsVerticalScrollIndicator={false}>
          <Pressable className="mb-4 h-[168px] overflow-hidden rounded-[16px] bg-[#56a3cb]">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80",
              }}
              className="absolute right-0 h-full w-[44%]"
              resizeMode="cover"
            />
            <View className="px-4 py-4">
              <View className="self-start rounded-full bg-[#188c63] px-3 py-1">
                <Text className="text-[10px] font-bold uppercase tracking-[0.6px] text-white">
                  TIÊU ĐIỂM THÁNG 10
                </Text>
              </View>
              <Text className="mt-2 max-w-[65%] text-[40px] font-extrabold leading-[42px] text-white">
                Đỉnh Cao Công Nghệ
              </Text>
              <Text className="mt-1 text-[12px] font-semibold text-[#dceffc]">
                Giảm đến 40% cho các dòng điện thoại và laptop
              </Text>
            </View>
          </Pressable>

          <View className="flex-row flex-wrap justify-between gap-y-3">
            {data.categoryTiles.map((tile, index) => (
              <Pressable
                key={tile.id}
                className="w-[48.5%] overflow-hidden rounded-[14px] bg-white"
                onPress={() => router.push("/main/product-list" as Href)}
              >
                <Image
                  source={{ uri: tile.imageUrl }}
                  className={index === 0 ? "h-[170px] w-full" : "h-[140px] w-full"}
                  resizeMode="cover"
                />
                <Text className="px-3 pb-3 pt-2 text-center text-[12px] font-bold text-[#3c4652]">{tile.title}</Text>
              </Pressable>
            ))}
          </View>

          <View className="mt-5">
            <UISectionHeader title="Thương hiệu phổ biến" actionLabel="Xem tất cả" />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
              {data.popularBrands.map((brand) => (
                <Pressable
                  key={brand}
                  className="h-9 items-center justify-center rounded-[10px] border border-[#e2e7ec] bg-[#eef2f6] px-4"
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
