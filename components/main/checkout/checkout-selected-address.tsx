import { Address } from "@/types/customer";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type CheckoutSelectedAddressProps = {
  address: Address | null;
  onChangePress: () => void;
};

export function CheckoutSelectedAddress({ address, onChangePress }: CheckoutSelectedAddressProps) {
  return (
    <View className="rounded-[16px] bg-white p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Feather name="map-pin" size={17} color="#0369A1" />
          <Text className="ml-2 text-[17px] font-extrabold text-[#1F2934]">Shipping address</Text>
        </View>
        <Pressable onPress={onChangePress}>
          <Text className="text-[13px] font-bold text-[#0369A1]">Change</Text>
        </Pressable>
      </View>

      {address ? (
        <View className="mt-3">
          <Text className="text-[15px] font-bold text-[#1F2934]">
            {address.recipientName} | {address.phone}
          </Text>
          <Text className="mt-1 text-[14px] leading-[21px] text-[#4B5563]">
            {address.detailAddress}, {address.ward}, {address.district}, {address.province}
          </Text>
        </View>
      ) : (
        <Text className="mt-3 text-[14px] text-[#64748B]">No default address has been selected yet.</Text>
      )}
    </View>
  );
}
