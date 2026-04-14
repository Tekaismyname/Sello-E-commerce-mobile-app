import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MainErrorState, MainLoadingState } from "@/components/main/screen-states";
import { useSearchData } from "@/hooks/main/use-main-data";

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .replace(/[ÃÂÆÄâ]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/(.)\1{2,}/g, "$1")
    .trim();

export default function SearchScreen() {
  const { data, loading, errorMessage } = useSearchData();
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const normalizedQuery = normalizeText(query);

  const effectiveHistory = useMemo(() => {
    const source = history.length ? history : data?.searchHistory ?? [];
    if (!normalizedQuery) return source;
    return source.filter((item) => normalizeText(item).includes(normalizedQuery));
  }, [data?.searchHistory, history, normalizedQuery]);

  const popular = useMemo(() => {
    const source = data?.popularSearches ?? [];
    if (!normalizedQuery) return source;
    return source.filter((item) => normalizeText(item).includes(normalizedQuery));
  }, [data?.popularSearches, normalizedQuery]);

  const recommended = useMemo(() => {
    const source = data?.recommendedKeywords ?? [];
    if (!normalizedQuery) return source;
    return source.filter((item) => normalizeText(item).includes(normalizedQuery));
  }, [data?.recommendedKeywords, normalizedQuery]);

  const runSearch = (keyword: string) => {
    const value = keyword.trim();
    if (!value) return;

    setHistory((prev) => {
      const merged = [value, ...prev, ...(data?.searchHistory ?? [])];
      const seen = new Set<string>();
      const result: string[] = [];
      for (const item of merged) {
        const key = normalizeText(item);
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
      return source.filter((entry) => normalizeText(entry) !== normalizeText(item));
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f3f5f8]" edges={["top"]}>
      <View className="px-4 py-3">
        <View className="h-[50px] flex-row items-center rounded-[12px] bg-[#eef1f5] px-3">
          <Pressable
            className="mr-2 h-8 w-8 items-center justify-center"
            onPress={() => (router.canGoBack() ? router.back() : router.navigate("/main/home" as any))}
          >
            <Feather name="arrow-left" size={19} color="#495463" />
          </Pressable>
          <Feather name="search" size={16} color="#8c96a2" />
          <TextInput
            className="ml-2 flex-1 text-[15px] text-[#2d3741]"
            placeholder="Tìm sản phẩm, thương hiệu..."
            placeholderTextColor="#8c96a2"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => runSearch(query)}
          />
          {query ? (
            <Pressable className="h-8 w-8 items-center justify-center" onPress={() => setQuery("")}>
              <Feather name="x" size={16} color="#8c96a2" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {loading ? <MainLoadingState /> : null}
      {!loading && errorMessage ? <MainErrorState message={errorMessage} /> : null}

      {!loading && data ? (
        <ScrollView className="flex-1" contentContainerClassName="px-4 pb-6" showsVerticalScrollIndicator={false}>
          <View>
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[18px] font-extrabold text-[#27313d]">Lịch sử tìm kiếm</Text>
              <Pressable onPress={clearHistory}>
                <Text className="text-[13px] font-semibold text-[#2f79dd]">Xóa hết</Text>
              </Pressable>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {effectiveHistory.map((item) => (
                <Pressable
                  key={item}
                  className="flex-row items-center rounded-full bg-[#e9edf2] px-3 py-1.5"
                  onPress={() => runSearch(item)}
                >
                  <Text className="text-[12px] font-semibold text-[#5e6a78]">{item}</Text>
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                      removeHistoryItem(item);
                    }}
                  >
                    <Feather name="x" size={12} color="#7e8997" style={{ marginLeft: 6 }} />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mt-5">
            <Text className="mb-3 text-[18px] font-extrabold text-[#27313d]">Tìm kiếm phổ biến</Text>
            <View className="gap-2.5">
              {popular.map((item, index) => (
                <Pressable
                  key={`${item}-${index}`}
                  className="h-[46px] flex-row items-center rounded-[12px] bg-white px-3"
                  onPress={() => runSearch(item)}
                >
                  <Text className="mr-3 min-w-[26px] text-[18px] font-extrabold text-[#8f7ac0]">
                    {`${index + 1}`.padStart(2, "0")}
                  </Text>
                  <Text className="flex-1 text-[13px] font-semibold text-[#414d5a]">{item}</Text>
                  <Feather name="chevron-right" size={15} color="#8b95a0" />
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mt-5">
            <Text className="mb-3 text-[18px] font-extrabold text-[#27313d]">Gợi ý cho bạn</Text>
            <View className="gap-2.5">
              {recommended.map((item, index) => (
                <Pressable
                  key={`${item}-${index}`}
                  className="h-[42px] flex-row items-center rounded-[12px] bg-white px-3"
                  onPress={() => runSearch(item)}
                >
                  <Feather name="trending-up" size={15} color="#8793a0" />
                  <Text className="ml-2 flex-1 text-[13px] font-semibold text-[#465362]">{item}</Text>
                  <Feather name="chevron-right" size={15} color="#8b95a0" />
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mt-6 overflow-hidden rounded-[16px] bg-[#27313f]">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=80",
              }}
              className="h-[150px] w-full opacity-85"
              resizeMode="cover"
            />
            <View className="absolute bottom-0 left-0 right-0 bg-black/35 px-3 py-3">
              <Text className="text-[24px] font-extrabold leading-[27px] text-white">Khám phá phong cách riêng của bạn</Text>
              <Text className="mt-1 text-[12px] font-semibold text-[#e5edf5]">
                Bộ sưu tập được chọn lọc bởi những chuyên gia thời trang.
              </Text>
            </View>
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
