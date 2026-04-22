import { AdminVoucherCard } from "@/components/admin/vouchers/admin-voucher-card";
import { AdminVoucherToolbar } from "@/components/admin/vouchers/admin-voucher-toolbar";
import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/auth/use-permissions";
import { useAdminVouchersView } from "@/hooks/admin/use-admin-vouchers-view";
import { AdminVoucher } from "@/types/admin";
import { Href, router } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminVouchersScreen() {
  const { token } = useAuth();
  const { hasPermission } = usePermissions();
  const canRead = hasPermission("vouchers:read");
  const canCreate = hasPermission("vouchers:create");
  const canUpdate = hasPermission("vouchers:update");
  const canDelete = hasPermission("vouchers:delete");

  const {
    filteredVouchers,
    loading,
    saving,
    error,
    search,
    setSearch,
    updateVoucherStatus,
    deleteVoucher,
  } = useAdminVouchersView(token);

  const openCreate = () => {
    if (!canCreate) return;
    router.push("/admin/voucher-form" as Href);
  };

  const openEdit = (item: AdminVoucher) => {
    if (!canUpdate) return;
    router.push((`/admin/voucher-form?voucherId=${item.id}` as unknown) as Href);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top", "bottom"]}>
      <AdminHeader title="Voucher Management" />
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24" showsVerticalScrollIndicator={false}>
        <AdminVoucherToolbar value={search} onChange={setSearch} onOpenCreate={openCreate} canCreate={canCreate} />
        {!canCreate ? (
          <Text className="mt-2 text-[12px] text-[#9A6400]">Ban khong co quyen tao voucher.</Text>
        ) : null}

        {!canRead ? (
          <View className="mt-4 rounded-[14px] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#B91C1C]">
              Ban khong co quyen xem danh sach voucher.
            </Text>
          </View>
        ) : loading ? (
          <View className="mt-8 items-center">
            <ActivityIndicator size="large" color="#2F95D2" />
          </View>
        ) : error ? (
          <View className="mt-4 rounded-[14px] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#B91C1C]">{error}</Text>
          </View>
        ) : (
          <View className="mt-3 gap-3">
            {filteredVouchers.map((item) => (
              <AdminVoucherCard
                key={item.id}
                voucher={item}
                onEdit={canUpdate ? openEdit : undefined}
                onToggleStatus={canUpdate ? (voucher) => {
                  updateVoucherStatus(voucher.id, !voucher.isActive).catch((err: any) => {
                    Alert.alert("Loi", err?.message ?? "Khong the cap nhat voucher.");
                  });
                } : undefined}
                onDelete={canDelete ? (voucher) => {
                  Alert.alert("Xoa voucher", `Xoa voucher ${voucher.code}?`, [
                    { text: "Huy", style: "cancel" },
                    {
                      text: "Xoa",
                      style: "destructive",
                      onPress: () => {
                        deleteVoucher(voucher.id).catch((err: any) => {
                          Alert.alert("Loi", err?.message ?? "Khong the xoa voucher.");
                        });
                      },
                    },
                  ]);
                } : undefined}
              />
            ))}

            {!filteredVouchers.length && (
              <View className="rounded-[14px] bg-white p-6 items-center">
                <Text className="text-[14px] text-[#6B7280]">Khong tim thay voucher.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {saving ? (
        <View className="absolute bottom-5 right-5 rounded-full bg-[#111827] px-4 py-2">
          <Text className="text-[12px] font-semibold text-white">Dang cap nhat...</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
