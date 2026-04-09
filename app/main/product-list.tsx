import { Href, router } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FilterChipGroup,
  InlinePromoBanner,
  ProductListCard,
  ProductListFooterLoading,
  ProductListHeaderInfo,
  SortTabGroup,
} from "@/components/product";
import { MainErrorState, MainLoadingState } from "@/components/main/screen-states";
import { SelloHeader } from "@/components/main/sello-header";
import { useProductListData } from "@/hooks/main/use-main-data";

export default function ProductListScreen() {
  const { data, loading, errorMessage } = useProductListData();

  return (
    <SafeAreaView className="flex-1 bg-[#f3f5f8]" edges={["top"]}>
      <SelloHeader onSearchPress={() => router.push("/main/search" as Href)} />

      {loading ? <MainLoadingState /> : null}
      {!loading && errorMessage ? <MainErrorState message={errorMessage} /> : null}

      {!loading && data ? (
        <ScrollView className="flex-1" contentContainerClassName="px-4 pb-6" showsVerticalScrollIndicator={false}>
          <ProductListHeaderInfo
            trail="Trang chủ > Thời trang nam"
            keyword="áo sơ mi"
            totalText="1.248 sản phẩm được tìm thấy"
          />

          <FilterChipGroup chips={data.filterChips} />
          <SortTabGroup tabs={data.sortTabs} />

          <View className="mt-3 flex-row flex-wrap justify-between gap-y-3">
            {data.productListItems.slice(0, 2).map((product) => (
              <ProductListCard key={product.id} product={product} />
            ))}
          </View>

          <InlinePromoBanner />

          <View className="mt-3 flex-row flex-wrap justify-between gap-y-3">
            {data.productListItems.slice(2).map((product) => (
              <ProductListCard key={product.id} product={product} />
            ))}
          </View>

          <ProductListFooterLoading />
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
