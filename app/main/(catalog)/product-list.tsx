import { Href, router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FilterChipDropdown,
  FilterChipGroup,
  InlinePromoBanner,
  ProductListCard,
  ProductListFooterLoading,
  ProductListHeaderInfo,
  SortTabGroup,
} from "@/components/product";
import { MainErrorState, MainLoadingState } from "@/components/main/screen-states";
import { SelloHeader } from "@/components/main/sello-header";
import { useProductListFilters } from "@/hooks/main/use-product-list-filters";

export default function ProductListScreen() {
  const params = useLocalSearchParams<{ keyword?: string }>();
  const searchKeyword = params.keyword?.toString().trim() ?? "";

  const {
    chips,
    dropdownOptions,
    openChipId,
    filteredProducts,
    visibleProducts,
    hasMore,
    loadingMore,
    applyDropdownOption,
    handleOpenChip,
    handleLoadMore,
    loading,
    error,
  } = useProductListFilters(searchKeyword);

  return (
    <SafeAreaView className="flex-1 bg-[#f3f5f8]" edges={["top"]}>
      <SelloHeader onSearchPress={() => router.push("/main/search" as Href)} />

      {loading ? <MainLoadingState /> : null}
      {!loading && error ? <MainErrorState message={error} /> : null}

      {!loading ? (
        <ScrollView className="flex-1" contentContainerClassName="px-4 pb-6" showsVerticalScrollIndicator={false}>
          <ProductListHeaderInfo
            trail="Trang chủ > Danh mục"
            keyword={searchKeyword || "Tất cả sản phẩm"}
            totalText={`${filteredProducts.length} sản phẩm được tìm thấy`}
          />

          <FilterChipGroup chips={chips} openChipId={openChipId} onPressChip={handleOpenChip} />

          {openChipId ? <FilterChipDropdown options={dropdownOptions} onSelect={applyDropdownOption} /> : null}

          <SortTabGroup tabs={["Phổ biến", "Bán chạy", "Giá thấp > cao"]} />

          <View className="mt-3 flex-row flex-wrap justify-between gap-y-3">
            {visibleProducts.map((product, index) => (
              <ProductListCard key={`${product.id}-${index}`} product={product} />
            ))}
          </View>

          {visibleProducts.length === 0 ? (
            <View className="mt-4 rounded-[12px] bg-white px-4 py-5">
              <Text className="text-center text-[13px] font-semibold text-[#6b7682]">
                Không tìm thấy sản phẩm phù hợp với từ khóa này.
              </Text>
            </View>
          ) : null}

          {visibleProducts.length > 2 ? <InlinePromoBanner /> : null}

          {hasMore ? (
            <Pressable
              className="mt-4 h-[44px] items-center justify-center rounded-[12px] bg-[#ebeff5]"
              onPress={handleLoadMore}
              disabled={loadingMore}
            >
              <Text className="text-[14px] font-bold text-[#3077d8]">
                {loadingMore ? "Đang tải thêm..." : "Xem thêm sản phẩm"}
              </Text>
            </Pressable>
          ) : null}

          <ProductListFooterLoading visible={loadingMore} />
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
