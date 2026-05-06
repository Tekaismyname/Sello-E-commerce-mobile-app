import { Feather } from "@expo/vector-icons";
import { Pressable, TextInput, View } from "react-native";

type SearchHeaderBarProps = {
  query: string;
  onChangeQuery: (value: string) => void;
  onSubmit: () => void;
  onGoBack: () => void;
  onClear: () => void;
};

export function SearchHeaderBar({
  query,
  onChangeQuery,
  onSubmit,
  onGoBack,
  onClear,
}: SearchHeaderBarProps) {
  return (
    <View className="px-4 py-3">
      <View className="h-[50px] flex-row items-center rounded-[12px] bg-[#eef1f5] px-3">
        <Pressable className="mr-2 h-8 w-8 items-center justify-center" onPress={onGoBack}>
          <Feather name="arrow-left" size={19} color="#495463" />
        </Pressable>
        <Feather name="search" size={16} color="#8c96a2" />
        <TextInput
          className="ml-2 flex-1 text-[15px] text-[#2d3741]"
          placeholder="Tìm sản phẩm, thương hiệu..."
          placeholderTextColor="#8c96a2"
          value={query}
          onChangeText={onChangeQuery}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
        />
        {query ? (
          <Pressable className="h-8 w-8 items-center justify-center" onPress={onClear}>
            <Feather name="x" size={16} color="#8c96a2" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
