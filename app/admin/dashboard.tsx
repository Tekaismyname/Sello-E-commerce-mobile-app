import { AdminRecentOrders } from "@/components/admin/dashboard/admin-recent-orders";
import { AdminSalesChart } from "@/components/admin/dashboard/admin-sales-chart";
import { AdminStatCards } from "@/components/admin/dashboard/admin-stat-cards";
import { AdminHeader } from "@/components/admin/shared/admin-header";
import { adminService } from "@/services/admin.service";
import { AdminDashboardData } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/auth-context";

export default function AdminDashboardScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Vui lòng đăng nhập tài khoản admin.");
      setLoading(false);
      return;
    }

    try {
      const res = await adminService.getDashboardData(token);
      setData(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={["top", "bottom"]}>
      <AdminHeader />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="p-4 pb-24">
        <View className="flex-row items-center gap-1 mb-6 mt-2">
          <Text className="text-[13px] text-[#6b7682]">Trang quan tri</Text>
          <Feather name="chevron-right" size={14} color="#6b7682" />
          <Text className="text-[13px] font-bold text-[#006397]">Tổng quan</Text>
        </View>

        <View className="mb-6">
          <Text className="text-[28px] font-extrabold text-[#191C1F] leading-[36px] mb-2">Xin chào quản trị viên</Text>
          <Text className="text-[15px] text-[#3F4850] leading-[24px]">Đây là thông tin tổng quan hệ thống hôm nay.</Text>
        </View>

        <Pressable
          className="mb-8 w-full h-[50px] bg-[#006397] rounded-[12px] flex-row items-center justify-center gap-2 shadow-sm"
          onPress={() => router.push("/admin/reports" as Href)}
        >
          <Feather name="download" size={18} color="white" />
          <Text className="text-[16px] font-bold text-white">Báo cáo và xuất file</Text>
        </Pressable>

        {loading && (
          <View className="flex-1 items-center justify-center mt-10">
            <ActivityIndicator size="large" color="#006397" />
          </View>
        )}

        {!loading && error && (
          <View className="rounded-[12px] bg-white p-4">
            <Text className="text-[14px] font-medium text-[#b3261e]">{error}</Text>
          </View>
        )}

        {!loading && !error && data && (
          <>
            <AdminStatCards data={data.stats} />
            <View className="mt-4" />
            <AdminSalesChart />
            <View className="mt-4" />
            <AdminRecentOrders orders={data.recentOrders} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
