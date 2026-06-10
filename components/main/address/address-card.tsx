import { Address } from "@/types/customer";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type Props = {
  address: Address;
  onEdit: (address: Address) => void;
  onSetDefault: (address: Address) => void;
  onDelete: (address: Address) => void;
};

export function AddressCard({ address, onEdit, onSetDefault, onDelete }: Props) {
  return (
    <View className="rounded-[16px] bg-white p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-[18px] font-extrabold text-[#111827]">{address.recipientName}</Text>
            {address.isDefault ? (
              <View className="rounded-full bg-[#DBEBFA] px-2 py-1">
                <Text className="text-[10px] font-bold text-[#0369A1]">DEFAULT</Text>
              </View>
            ) : null}
          </View>
          <Text className="mt-1 text-[14px] text-[#374151]">{address.phone}</Text>
          <Text className="mt-1 text-[14px] leading-[20px] text-[#4B5563]">
            {address.detailAddress}, {address.ward}, {address.district}, {address.province}
          </Text>
        </View>
        <Pressable className="h-9 w-9 items-center justify-center" onPress={() => onEdit(address)}>
          <Feather name="edit-2" size={16} color="#0369A1" />
        </Pressable>
      </View>

      <View className="mt-3 flex-row gap-2">
        {!address.isDefault ? (
          <Pressable className="flex-1 h-10 items-center justify-center rounded-[10px] bg-[#E8F1FB]" onPress={() => onSetDefault(address)}>
            <Text className="text-[13px] font-bold text-[#0369A1]">Set as default</Text>
          </Pressable>
        ) : (
          <View className="flex-1" />
        )}
        <Pressable className="h-10 w-10 items-center justify-center rounded-[10px] bg-[#FEE2E2]" onPress={() => onDelete(address)}>
          <Feather name="trash-2" size={16} color="#B91C1C" />
        </Pressable>
      </View>
    </View>
  );
}
