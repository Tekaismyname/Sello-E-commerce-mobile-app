import { Feather } from "@expo/vector-icons";
import { Pressable, ScrollView, Text } from "react-native";

export type FilterChipItem = {
  id: string;
  label: string;
  active?: boolean;
};

type FilterChipGroupProps = {
  chips: FilterChipItem[];
  openChipId?: string | null;
  onPressChip?: (chipId: string) => void;
};

export function FilterChipGroup({ chips, openChipId, onPressChip }: FilterChipGroupProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="mt-3 gap-2">
      {chips.map((chip) => {
        const isOpen = openChipId === chip.id;
        const isHighlighted = Boolean(chip.active) || isOpen;

        return (
          <Pressable
            key={chip.id}
            onPress={() => onPressChip?.(chip.id)}
            className={`h-[34px] flex-row items-center rounded-full px-4 ${
              isHighlighted ? "bg-[#be8dff]" : "bg-[#e9edf2]"
            }`}
          >
            <Text className={`text-[12px] font-semibold ${isHighlighted ? "text-white" : "text-[#495567]"}`}>
              {chip.label}
            </Text>
            <Feather
              name={isOpen ? "chevron-up" : "chevron-down"}
              size={13}
              color={isHighlighted ? "#ffffff" : "#495567"}
              style={{ marginLeft: 5 }}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
