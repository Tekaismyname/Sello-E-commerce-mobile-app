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
import { useSettings } from "@/contexts/settings-context";

export default function ProductListScreen() {
  const params = useLocalSearchParams<{ keyword?: string; categoryId?: string }>();
  const searchKeyword = params.keyword?.toString().trim() ?? "";
  const categoryId = params.categoryId?.toString().trim() ?? "";
  const { t } = useSettings();

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
  } = useProductListFilters(searchKeyword, categoryId);

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
                  trail={t("home_categories_trail", "Home > Categories")}
                  keyword={searchKeyword || t("all_products", "All Products")}
                  totalText={t("products_found", "{count} products found").replace("{count}", String(filteredProducts.length))}
                />

                <FilterChipGroup chips={chips} openChipId={openChipId} onPressChip={handleOpenChip} />

                {openChipId ? <FilterChipDropdown options={dropdownOptions} onSelect={applyDropdownOption} /> : null}

                <SortTabGroup tabs={[t("popular", "Popular"), t("best_sellers", "Best Sellers"), t("price_low_high", "Price: Low > High")]} />
              </View>
            }
            ListEmptyComponent={
              <View className="mt-4 rounded-[12px] bg-white px-4 py-5">
                <Text className="text-center text-[13px] font-semibold text-[#6b7682]">
                  {t("no_products_found", "No products matching your search were found.")}
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
                      {loadingMore ? t("loading_more", "Loading more...") : t("view_more_products", "View More Products")}
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
