import { Pressable, ScrollView, Text } from "react-native";

type SortTabGroupProps = {
  tabs: string[];
};

export function SortTabGroup({ tabs }: SortTabGroupProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="mt-3 gap-4">
      {tabs.map((tab, index) => (
        <Pressable key={tab}>
          <Text className={`text-[12px] font-bold ${index === 0 ? "text-[#2e7be5]" : "text-[#647080]"}`}>
            {tab}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
