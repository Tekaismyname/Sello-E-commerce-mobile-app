import { Address } from "@/types/customer";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type CheckoutAddressSelectorProps = {
  addresses: Address[];
  selectedAddressId: number | null;
  onSelectAddress: (addressId: number) => void;
};

export function CheckoutAddressSelector({
  addresses,
  selectedAddressId,
  onSelectAddress,
}: CheckoutAddressSelectorProps) {
  if (!addresses.length) {
    return (
      <View className="rounded-[12px] bg-[#F8F9FB] p-3">
        <Text className="text-[13px] font-semibold text-[#5E6A78]">
          You do not have any shipping addresses yet. Please add one from your account page.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-2">
      {addresses.map((address) => {
        const selected = selectedAddressId === address.id;

        return (
          <Pressable
            key={address.id}
            onPress={() => onSelectAddress(address.id)}
            className={`rounded-[12px] border p-3 ${
              selected ? "border-[#006397] bg-[#EAF5FC]" : "border-[#E0E6ED] bg-[#F8F9FB]"
            }`}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-[14px] font-bold text-[#1F2934]">
                  {address.recipientName} {address.isDefault ? "(Default)" : ""}
                </Text>
                <Text className="mt-1 text-[12px] text-[#5E6A78]">{address.phone}</Text>
                <Text className="mt-1 text-[12px] text-[#5E6A78]" numberOfLines={2}>
                  {address.detailAddress}, {address.ward}, {address.district}, {address.province}
                </Text>
              </View>
              <Feather
                name={selected ? "check-circle" : "circle"}
                size={18}
                color={selected ? "#006397" : "#94A0AE"}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
