import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/services/admin.service";
import { AdminVoucher } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatMoney = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

const isExpired = (voucher: AdminVoucher) =>
  !!voucher.endAt && new Date(voucher.endAt).getTime() < Date.now();

export default function AdminVouchersScreen() {
  const { token, user } = useAuth();
  const permissions = user?.permissions ?? [];
  const canCreate = permissions.includes("vouchers:create");
  const canUpdate = permissions.includes("vouchers:update");
  const canDelete = permissions.includes("vouchers:delete");
  const [vouchers, setVouchers] = useState<AdminVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVouchers = useCallback(async () => {
    if (!token) {
      setError("Vui long dang nhap tai khoan admin.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await adminService.listVouchers(token);
      setVouchers(response.data);
    } catch (nextError: any) {
      setError(nextError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchVouchers();
    }, [fetchVouchers]),
  );

  const handleDisable = (voucher: AdminVoucher) => {
    if (!token || !canDelete) return;

    Alert.alert("Tat voucher", `Ban muon tat voucher ${voucher.code}?`, [
      { text: "Huy", style: "cancel" },
      {
        text: "Tat voucher",
        style: "destructive",
        onPress: async () => {
          try {
            await adminService.deleteVoucher(token, voucher.id);
            await fetchVouchers();
          } catch (nextError: any) {
            Alert.alert("Loi", nextError.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F6F8FC]" edges={["top", "bottom"]}>
      <AdminHeader title="Voucher Management" />
      <ScrollView contentContainerClassName="px-5 py-4 pb-28">
        <Text className="text-[26px] font-extrabold text-[#1F2934]">Danh sach Voucher</Text>
        <Text className="mt-1 text-[14px] text-[#607080]">Manage your promotions and discounts.</Text>

        {canCreate ? (
          <Pressable
            onPress={() => router.push("/admin/voucher-form" as Href)}
            className="mt-3 w-[150px] rounded-[8px] bg-[#0F84C8] px-4 py-3"
          >
            <Text className="text-center text-[13px] font-bold text-white">+ Tao Voucher</Text>
          </Pressable>
        ) : null}

        {loading ? (
          <View className="mt-10 items-center">
            <ActivityIndicator size="large" color="#0F6CBD" />
          </View>
        ) : null}

        {!loading && error ? (
          <View className="mt-4 rounded-[14px] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#BA1A1A]">{error}</Text>
          </View>
        ) : null}

        <View className="mt-5 gap-5">
          {vouchers.map((voucher) => {
            const expired = isExpired(voucher);
            const usagePercent =
              voucher.usageLimit > 0 ? Math.min(100, Math.round((voucher.usedCount / voucher.usageLimit) * 100)) : 0;
            const statusLabel = expired ? "Expired" : voucher.isActive ? "Active" : "Inactive";
            const statusClass = expired || !voucher.isActive ? "bg-[#FFECEC] text-[#D04444]" : "bg-[#E9F8EE] text-[#2E7D32]";

            return (
              <Pressable
                key={voucher.id}
                onPress={() => canUpdate && router.push(`/admin/voucher-form?id=${voucher.id}` as Href)}
                className="rounded-[18px] bg-white p-5 shadow-sm"
              >
                <Text className={`self-start rounded-full px-3 py-1 text-[11px] font-bold ${statusClass}`}>
                  {statusLabel}
                </Text>
                <Text className={`mt-5 text-[22px] font-extrabold ${expired ? "text-[#8B949E]" : "text-[#0F6CBD]"}`}>
                  {voucher.code}
                </Text>
                <Text className="mt-1 text-[16px] text-[#1F2934]">
                  {voucher.discountType === "percent"
                    ? `Giam ${voucher.discountValue}%`
                    : `Giam ${formatMoney(voucher.discountValue)}`}
                </Text>
                <Text className="mt-1 text-[13px] text-[#607080]">
                  Don toi thieu {formatMoney(voucher.minOrderValue)}
                </Text>
                <View className="mt-5 flex-row items-center justify-between">
                  <Text className="text-[12px] text-[#607080]">
                    Da dung: {voucher.usedCount}/{voucher.usageLimit || "khong gioi han"}
                  </Text>
                  <Text className="text-[12px] font-bold text-[#0F6CBD]">{usagePercent}%</Text>
                </View>
                <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E5EAF0]">
                  <View className="h-full bg-[#0F84C8]" style={{ width: `${usagePercent}%` }} />
                </View>
                <View className="mt-4 flex-row items-center justify-between">
                  <Text className={`text-[12px] font-semibold ${expired ? "text-[#D04444]" : "text-[#607080]"}`}>
                    HSD: {voucher.endAt ? new Date(voucher.endAt).toLocaleDateString("vi-VN") : "Khong gioi han"}
                  </Text>
                  {canDelete ? (
                    <Pressable onPress={() => handleDisable(voucher)}>
                      <Feather name="trash-2" size={16} color="#BA1A1A" />
                    </Pressable>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
