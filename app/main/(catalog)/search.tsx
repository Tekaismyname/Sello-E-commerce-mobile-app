import { Href, router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MainErrorState, MainLoadingState } from "@/components/main/screen-states";
import {
  SearchHeaderBar,
  SearchHistorySection,
  SearchKeywordListSection,
  SearchPromoBanner,
} from "@/components/main/search";
import { useSearchData } from "@/hooks/main/use-main-data";
import { normalizeSearchText } from "@/utils/search-text";

export default function SearchScreen() {
  const { data, loading, errorMessage } = useSearchData();
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const normalizedQuery = normalizeSearchText(query);

  const effectiveHistory = useMemo(() => {
    const source = history.length ? history : data?.searchHistory ?? [];
    if (!normalizedQuery) return source;
    return source.filter((item) => normalizeSearchText(item).includes(normalizedQuery));
  }, [data?.searchHistory, history, normalizedQuery]);

  const popular = useMemo(() => {
    const source = data?.popularSearches ?? [];
    if (!normalizedQuery) return source;
    return source.filter((item) => normalizeSearchText(item).includes(normalizedQuery));
  }, [data?.popularSearches, normalizedQuery]);

  const recommended = useMemo(() => {
    const source = data?.recommendedKeywords ?? [];
    if (!normalizedQuery) return source;
    return source.filter((item) => normalizeSearchText(item).includes(normalizedQuery));
  }, [data?.recommendedKeywords, normalizedQuery]);

  const runSearch = (keyword: string) => {
    const value = keyword.trim();
    if (!value) return;

    setHistory((prev) => {
      const merged = [value, ...prev, ...(data?.searchHistory ?? [])];
      const seen = new Set<string>();
      const result: string[] = [];
      for (const item of merged) {
        const key = normalizeSearchText(item);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        result.push(item.trim());
        if (result.length >= 10) break;
      }
      return result;
    });

    router.push((`/main/product-list?keyword=${encodeURIComponent(value)}` as unknown) as Href);
  };

  const removeHistoryItem = (item: string) => {
    setHistory((prev) => {
      const source = prev.length ? prev : data?.searchHistory ?? [];
      return source.filter((entry) => normalizeSearchText(entry) !== normalizeSearchText(item));
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f3f5f8]" edges={["top"]}>
      <SearchHeaderBar
        query={query}
        onChangeQuery={setQuery}
        onSubmit={() => runSearch(query)}
        onGoBack={() => (router.canGoBack() ? router.back() : router.navigate("/main/home" as Href))}
        onClear={() => setQuery("")}
      />

      {loading ? <MainLoadingState /> : null}
      {!loading && errorMessage ? <MainErrorState message={errorMessage} /> : null}

      {!loading && data ? (
        <ScrollView className="flex-1" contentContainerClassName="px-4 pb-6" showsVerticalScrollIndicator={false}>
          <SearchHistorySection
            items={effectiveHistory}
            onPressItem={runSearch}
            onRemoveItem={removeHistoryItem}
            onClearAll={() => setHistory([])}
          />

          <SearchKeywordListSection
            title="Popular searches"
            items={popular}
            onPressItem={runSearch}
            mode="ranked"
          />
          <SearchKeywordListSection
            title="Recommended for you"
            items={recommended}
            onPressItem={runSearch}
            mode="recommended"
          />
          <SearchPromoBanner />
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
