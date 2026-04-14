import { Href, router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FeaturedCategoriesSection } from "@/components/main/home/featured-categories-section";
import { FlashSalesSection } from "@/components/main/home/flash-sales-section";
import { HomePromoBanner } from "@/components/main/home/home-promo-banner";
import { SuggestedProductsSection } from "@/components/main/home/suggested-products-section";
import { MainErrorState, MainLoadingState } from "@/components/main/screen-states";
import { SearchTriggerBar } from "@/components/main/search-trigger-bar";
import { SelloHeader } from "@/components/main/sello-header";
import { useHomeData } from "@/hooks/main/use-main-data";

const HOME_PAGE_SIZE = 4;

export default function HomeScreen() {
  const { data, loading, errorMessage } = useHomeData();
  const [visibleSuggestedCount, setVisibleSuggestedCount] = useState(HOME_PAGE_SIZE);
  const [loadingMoreSuggested, setLoadingMoreSuggested] = useState(false);

  const visibleSuggestedProducts = useMemo(
    () => (data?.suggestedProducts ?? []).slice(0, visibleSuggestedCount),
    [data?.suggestedProducts, visibleSuggestedCount],
  );

  const hasMoreSuggested = (data?.suggestedProducts?.length ?? 0) > visibleSuggestedProducts.length;

  const handleViewMoreSuggested = () => {
    if (!hasMoreSuggested || loadingMoreSuggested) return;

    setLoadingMoreSuggested(true);
    setTimeout(() => {
      setVisibleSuggestedCount((prev) => prev + HOME_PAGE_SIZE);
      setLoadingMoreSuggested(false);
    }, 450);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f6f8fc]" edges={["top"]}>
      <SelloHeader onSearchPress={() => router.push("/main/search" as Href)} />

      {loading ? <MainLoadingState /> : null}
      {!loading && errorMessage ? <MainErrorState message={errorMessage} /> : null}

      {!loading && data ? (
        <ScrollView className="flex-1" contentContainerClassName="px-4 pb-7" showsVerticalScrollIndicator={false}>
          <SearchTriggerBar
            placeholder="Tìm kiếm sản phẩm..."
            onPress={() => router.push("/main/search" as Href)}
          />
          <HomePromoBanner />
          <FeaturedCategoriesSection categories={data.quickCategories} />
          <FlashSalesSection countdownValues={data.countdownValues} products={data.flashSaleProducts} />
          <SuggestedProductsSection
            products={visibleSuggestedProducts}
            hasMore={hasMoreSuggested}
            loadingMore={loadingMoreSuggested}
            onViewMore={handleViewMoreSuggested}
          />
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

