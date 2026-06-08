import { Href, router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
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
        <View style={{ flex: 1 }}>
          <FlashList
            data={visibleProducts}
            numColumns={2}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item, index }) => (
              <View
                style={{
                  flex: 1,
                  paddingLeft: index % 2 === 0 ? 0 : 6,
                  paddingRight: index % 2 === 0 ? 6 : 0,
                  marginBottom: 12,
                }}
              >
                <ProductListCard product={item} />
              </View>
            )}
            ListHeaderComponent={
              <View style={{ paddingBottom: 8 }}>
                <ProductListHeaderInfo
                  trail="Trang chủ > Danh mục"
                  keyword={searchKeyword || "Tất cả sản phẩm"}
                  totalText={`${filteredProducts.length} sản phẩm được tìm thấy`}
                />

                <FilterChipGroup chips={chips} openChipId={openChipId} onPressChip={handleOpenChip} />

                {openChipId ? <FilterChipDropdown options={dropdownOptions} onSelect={applyDropdownOption} /> : null}

                <SortTabGroup tabs={["Phổ biến", "Bán chạy", "Giá thấp > cao"]} />
              </View>
            }
            ListEmptyComponent={
              <View className="mt-4 rounded-[12px] bg-white px-4 py-5">
                <Text className="text-center text-[13px] font-semibold text-[#6b7682]">
                  Không tìm thấy sản phẩm phù hợp với từ khóa này.
                </Text>
              </View>
            }
            ListFooterComponent={
              <View style={{ paddingTop: 8 }}>
                {visibleProducts.length > 2 ? <InlinePromoBanner /> : null}

                {hasMore ? (
                  <Pressable
                    className="mt-4 h-[44px] items-center justify-center rounded-[12px] bg-[#ebeff5] mb-2"
                    onPress={handleLoadMore}
                    disabled={loadingMore}
                  >
                    <Text className="text-[14px] font-bold text-[#3077d8]">
                      {loadingMore ? "Đang tải thêm..." : "Xem thêm sản phẩm"}
                    </Text>
                  </Pressable>
                ) : null}

                <ProductListFooterLoading visible={loadingMore} />
              </View>
            }
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
