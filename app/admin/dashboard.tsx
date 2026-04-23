import { AdminRecentOrders } from "@/components/admin/dashboard/admin-recent-orders";
import { AdminSalesChart } from "@/components/admin/dashboard/admin-sales-chart";
import { AdminStatCards } from "@/components/admin/dashboard/admin-stat-cards";
import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/services/admin.service";
import { AdminDashboardData } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-4 pb-24"
      >
        <View className="mb-6 mt-2 flex-row items-center gap-1">
          <Text className="text-[13px] text-[#6b7682]">Trang quản trị</Text>
          <Feather name="chevron-right" size={14} color="#6b7682" />
          <Text className="text-[13px] font-bold text-[#006397]">Tổng quan</Text>
        </View>

        <View className="mb-6">
          <Text className="mb-2 text-[28px] font-extrabold leading-[36px] text-[#191C1F]">
            Xin chào quản trị viên
          </Text>
          <Text className="text-[15px] leading-[24px] text-[#3F4850]">
            Đây là thông tin tổng quan hệ thống hôm nay. Từ đây bạn có thể di chuyển nhanh đến báo cáo và cấu hình hệ thống.
          </Text>
        </View>

        <View className="mb-8 flex-row gap-3">
          <Pressable
            className="h-[50px] flex-1 flex-row items-center justify-center gap-2 rounded-[12px] bg-[#006397] shadow-sm"
            onPress={() => router.push("/admin/reports" as Href)}
          >
            <Feather name="download" size={18} color="white" />
            <Text className="text-[16px] font-bold text-white">Báo cáo</Text>
          </Pressable>
          <Pressable
            className="h-[50px] flex-1 flex-row items-center justify-center gap-2 rounded-[12px] border border-[#006397] bg-white"
            onPress={() => router.push("/admin/system" as Href)}
          >
            <Feather name="settings" size={18} color="#006397" />
            <Text className="text-[16px] font-bold text-[#006397]">Hệ thống</Text>
          </Pressable>
        </View>

        {loading && (
          <View className="mt-10 flex-1 items-center justify-center">
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
            {data.systemSummary && (
              <View className="mt-4 rounded-[16px] bg-white p-5 shadow-sm">
                <Text className="text-[16px] font-bold text-[#191C1F]">Hệ thống hôm nay</Text>
                <View className="mt-4 flex-row flex-wrap gap-3">
                  <View className="min-w-[47%] flex-1 rounded-[14px] bg-[#F8F9FB] p-4">
                    <Text className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">
                      Users
                    </Text>
                    <Text className="mt-2 text-[22px] font-extrabold text-[#191C1F]">
                      {data.systemSummary.users}
                    </Text>
                  </View>
                  <View className="min-w-[47%] flex-1 rounded-[14px] bg-[#F8F9FB] p-4">
                    <Text className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">
                      Products
                    </Text>
                    <Text className="mt-2 text-[22px] font-extrabold text-[#191C1F]">
                      {data.systemSummary.products}
                    </Text>
                  </View>
                </View>
              </View>
            )}
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
