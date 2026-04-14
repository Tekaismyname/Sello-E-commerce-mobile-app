import { Feather } from "@expo/vector-icons";
import { Pressable, ScrollView, Text } from "react-native";

type FilterChipGroupProps = {
  chips: string[];
};

export function FilterChipGroup({ chips }: FilterChipGroupProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="mt-3 gap-2">
      {chips.map((chip, index) => (
        <Pressable
          key={chip}
          className={`h-[34px] flex-row items-center rounded-full px-4 ${
            index === 2 ? "bg-[#be8dff]" : "bg-[#e9edf2]"
          }`}
        >
          <Text className={`text-[12px] font-semibold ${index === 2 ? "text-white" : "text-[#495567]"}`}>
            {chip}
          </Text>
          <Feather
            name="chevron-down"
            size={13}
            color={index === 2 ? "#ffffff" : "#495567"}
            style={{ marginLeft: 5 }}
          />
        </Pressable>
      ))}
    </ScrollView>
  );
}
