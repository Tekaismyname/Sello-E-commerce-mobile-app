import { Feather } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onOpenCreate: () => void;
  canCreate?: boolean;
};

export function AdminVoucherToolbar({ value, onChange, onOpenCreate, canCreate = true }: Props) {
  return (
    <View className="rounded-[16px] bg-white p-3">
      <View className="h-[48px] flex-row items-center rounded-[12px] bg-[#F3F5FA] px-3">
        <Feather name="search" size={18} color="#6B7280" />
        <TextInput
          className="ml-2 flex-1 text-[14px] text-[#111827]"
          placeholder="Tim ma voucher..."
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChange}
        />
      </View>
      {canCreate ? (
        <Pressable className="mt-2 h-[44px] items-center justify-center rounded-[12px] bg-[#2F95D2]" onPress={onOpenCreate}>
          <Text className="text-[14px] font-bold text-white">+ Tao voucher</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
