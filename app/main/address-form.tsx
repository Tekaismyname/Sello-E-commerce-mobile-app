import { AddressForm } from "@/components/main/address/address-form";
import { useAuth } from "@/contexts/auth-context";
import { useAddressesView } from "@/hooks/customer/use-addresses-view";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddressFormScreen() {
  const { token } = useAuth();
  const { addressId } = useLocalSearchParams<{ addressId?: string }>();
  const { addresses, loading, saving, createAddress, updateAddress } = useAddressesView(token);

  const editingId = Number(addressId);
  const initialValue = Number.isFinite(editingId) ? addresses.find((item) => item.id === editingId) ?? null : null;

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top", "bottom"]}>
      <View className="h-[56px] flex-row items-center bg-white px-4">
        <Pressable className="h-10 w-10 items-center justify-center" onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#0369A1" />
        </Pressable>
        <Text className="ml-2 text-[18px] font-extrabold text-[#0F4C6B]">{initialValue ? "Sua dia chi" : "Them dia chi moi"}</Text>
      </View>

      <AddressForm
        initialValue={initialValue}
        loading={loading || saving}
        onSubmit={async (payload) => {
          try {
            if (initialValue) {
              await updateAddress(initialValue.id, payload);
            } else {
              await createAddress(payload);
            }
            Alert.alert("Thanh cong", "Da luu dia chi.");
            router.back();
          } catch (err: any) {
            Alert.alert("Loi", err?.message ?? "Khong the luu dia chi.");
          }
        }}
      />
    </SafeAreaView>
  );
}
