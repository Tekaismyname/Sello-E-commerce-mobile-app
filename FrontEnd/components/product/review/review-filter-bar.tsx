import { Pressable, ScrollView, Text } from "react-native";

type ReviewFilterBarProps = {
  filters: string[];
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
};

export function ReviewFilterBar({ filters, selectedFilter, onSelectFilter }: ReviewFilterBarProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      className="bg-white py-4" 
      contentContainerClassName="gap-2 px-4"
    >
      {filters.map((filter) => (
        <Pressable
          key={filter}
          onPress={() => onSelectFilter(filter)}
          className={`items-center justify-center rounded-[20px] px-4 py-2 ${
            selectedFilter === filter
              ? "bg-[#DAA5FF]"
              : "bg-[#E7E8EC]"
          }`}
        >
          <Text
            className={`text-[13px] font-semibold ${
              selectedFilter === filter ? "text-[#4A0072]" : "text-[#191C1F]"
            }`}
          >
            {filter}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
