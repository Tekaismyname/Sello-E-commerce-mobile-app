import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type SearchKeywordListSectionProps = {
  title: string;
  items: string[];
  onPressItem: (item: string) => void;
  mode: "ranked" | "recommended";
};

export function SearchKeywordListSection({
  title,
  items,
  onPressItem,
  mode,
}: SearchKeywordListSectionProps) {
  return (
    <View className="mt-5">
      <Text className="mb-3 text-[18px] font-extrabold text-[#27313d]">{title}</Text>
      <View className="gap-2.5">
        {items.map((item, index) => (
          <Pressable
            key={`${item}-${index}`}
            className={`flex-row items-center rounded-[12px] bg-white px-3 ${
              mode === "ranked" ? "h-[46px]" : "h-[42px]"
            }`}
            onPress={() => onPressItem(item)}
          >
            {mode === "ranked" ? (
              <Text className="mr-3 min-w-[26px] text-[18px] font-extrabold text-[#8f7ac0]">
                {`${index + 1}`.padStart(2, "0")}
              </Text>
            ) : (
              <Feather name="trending-up" size={15} color="#8793a0" />
            )}

            <Text
              className={`flex-1 text-[13px] font-semibold ${
                mode === "ranked" ? "text-[#414d5a]" : "ml-2 text-[#465362]"
              }`}
            >
              {item}
            </Text>
            <Feather name="chevron-right" size={15} color="#8b95a0" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
