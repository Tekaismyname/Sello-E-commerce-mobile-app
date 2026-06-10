import { AddressCard } from "@/components/main/address/address-card";
import { useAuth } from "@/contexts/auth-context";
import { useAddressesView } from "@/hooks/customer/use-addresses-view";
import { triggerLocalNotification } from "@/utils/local-notification";
import { Address } from "@/types/customer";
import { Feather } from "@expo/vector-icons";
import { Href, router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const toFriendlyAddressError = (message?: string) => {
  if (!message) {
    return "Unable to delete the address.";
  }

  const normalized = message.toLowerCase();
  if (
    normalized.includes("cannot delete address that is used by existing orders") ||
    normalized.includes("used by existing orders")
  ) {
    return "This address cannot be deleted because it is being used in another order.";
  }

  return message;
};

export default function AddressesScreen() {
  const { token } = useAuth();
  const { addresses, loading, saving, error, setDefaultAddress, deleteAddress, fetchAddresses } = useAddressesView(token, { lazy: true });

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [fetchAddresses]),
  );

  const openCreate = () => {
    router.push("/main/address-form" as Href);
  };

  const openEdit = (address: Address) => {
    router.push((`/main/address-form?addressId=${address.id}` as unknown) as Href);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top", "bottom"]}>
      <View className="h-[56px] flex-row items-center px-4">
        <Pressable className="h-10 w-10 items-center justify-center" onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#0369A1" />
        </Pressable>
        <Text className="ml-2 text-[20px] font-extrabold text-[#0F4C6B]">Address list</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24" showsVerticalScrollIndicator={false}>
        <Text className="text-[32px] font-extrabold leading-[38px] text-[#111827]">Shipping addresses</Text>
        <Text className="mt-2 text-[14px] leading-[22px] text-[#4B5563]">
          Manage the delivery locations you use most often.
        </Text>

        {loading ? (
          <View className="mt-8 items-center">
            <ActivityIndicator size="large" color="#2F95D2" />
          </View>
        ) : error ? (
          <View className="mt-4 rounded-[14px] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#B91C1C]">{error}</Text>
          </View>
        ) : (
          <View className="mt-4 gap-3">
            {addresses.map((item) => (
              <AddressCard
                key={item.id}
                address={item}
                onEdit={openEdit}
                onSetDefault={(address) => {
                  setDefaultAddress(address.id)
                    .then(() => {
                      triggerLocalNotification(
                        "Default address updated!",
                        `The address at ${address.detailAddress} has been set as your default.`,
                      );
                    })
                    .catch((err: any) => {
                      Alert.alert("Error", err?.message ?? "Unable to set the default address.");
                    });
                }}
                onDelete={(address) => {
                  Alert.alert("Delete address", "Are you sure you want to delete this address?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => {
                        deleteAddress(address.id).catch((err: any) => {
                          Alert.alert("Error", toFriendlyAddressError(err?.message));
                        });
                      },
                    },
                  ]);
                }}
              />
            ))}

            {!addresses.length && (
              <View className="items-center rounded-[14px] bg-white p-6">
                <Text className="text-[14px] text-[#6B7280]">You do not have any saved addresses yet.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View className="border-t border-[#E5E7EB] bg-white p-4">
        <Pressable className="h-12 items-center justify-center rounded-[12px] bg-[#2F95D2]" onPress={openCreate}>
          <Text className="text-[16px] font-bold text-white">Add new address</Text>
        </Pressable>
      </View>

      {saving ? (
        <View className="absolute bottom-20 right-5 rounded-full bg-[#111827] px-4 py-2">
          <Text className="text-[12px] font-semibold text-white">Updating...</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
