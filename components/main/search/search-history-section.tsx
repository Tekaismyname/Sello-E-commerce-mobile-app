import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type SearchHistorySectionProps = {
  items: string[];
  onPressItem: (item: string) => void;
  onRemoveItem: (item: string) => void;
  onClearAll: () => void;
};

export function SearchHistorySection({
  items,
  onPressItem,
  onRemoveItem,
  onClearAll,
}: SearchHistorySectionProps) {
  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-[18px] font-extrabold text-[#27313d]">Recent searches</Text>
        <Pressable onPress={onClearAll}>
          <Text className="text-[13px] font-semibold text-[#2f79dd]">Clear all</Text>
        </Pressable>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {items.map((item) => (
          <Pressable
            key={item}
            className="flex-row items-center rounded-full bg-[#e9edf2] px-3 py-1.5"
            onPress={() => onPressItem(item)}
          >
            <Text className="text-[12px] font-semibold text-[#5e6a78]">{item}</Text>
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onRemoveItem(item);
              }}
            >
              <Feather name="x" size={12} color="#7e8997" style={{ marginLeft: 6 }} />
            </Pressable>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
