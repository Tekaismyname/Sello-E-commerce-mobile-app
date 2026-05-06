import { AdminVoucherForm } from "@/components/admin/vouchers/admin-voucher-form";
import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/auth/use-permissions";
import { useAdminVouchersView } from "@/hooks/admin/use-admin-vouchers-view";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminVoucherFormScreen() {
  const { token } = useAuth();
  const { hasPermission } = usePermissions();
  const { voucherId } = useLocalSearchParams<{ voucherId?: string }>();
  const { vouchers, loading, saving, createVoucher, updateVoucher } = useAdminVouchersView(token);

  const editingId = Number(voucherId);
  const initialValue = Number.isFinite(editingId) ? vouchers.find((item) => item.id === editingId) ?? null : null;
  const canCreate = hasPermission("vouchers:create");
  const canUpdate = hasPermission("vouchers:update");
  const canSubmit = initialValue ? canUpdate : canCreate;

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top", "bottom"]}>
      <View className="h-[56px] flex-row items-center bg-white px-4">
        <Pressable className="h-10 w-10 items-center justify-center" onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#0369A1" />
        </Pressable>
        <Text className="ml-2 text-[18px] font-extrabold text-[#0F4C6B]">
          {initialValue ? "Edit Voucher" : "Create New Voucher"}
        </Text>
      </View>
      {!canSubmit ? (
        <View className="px-4 pt-3">
          <Text className="text-[12px] text-[#9A6400]">You don't have permission to save vouchers.</Text>
        </View>
      ) : null}

      <AdminVoucherForm
        initialValue={initialValue}
        loading={saving || loading || !canSubmit}
        onSubmit={async (payload) => {
          if (!canSubmit) {
            Alert.alert("No Permission", "You don't have permission to save vouchers.");
            return;
          }
          try {
            if (initialValue) {
              await updateVoucher(initialValue.id, payload);
            } else {
              await createVoucher(payload);
            }
            Alert.alert("Success", "Voucher saved.");
            router.back();
          } catch (error: any) {
            Alert.alert("Error", error?.message ?? "Cannot save voucher.");
          }
        }}
      />
    </SafeAreaView>
  );
}
