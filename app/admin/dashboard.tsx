import { AdminRecentOrders } from "@/components/admin/dashboard/admin-recent-orders";
import { AdminSalesChart } from "@/components/admin/dashboard/admin-sales-chart";
import { AdminStatCards } from "@/components/admin/dashboard/admin-stat-cards";
import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/services/admin.service";
import { AdminDashboardData, AdminOrder, AdminReportOverview } from "@/types/admin";
import { getReasonLabel } from "@/utils/order-reasons";
import { Feather } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminDashboardScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [report, setReport] = useState<AdminReportOverview | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Please log in to admin account.");
      setLoading(false);
      return;
    }

    try {
      const [res, reportRes, ordersRes] = await Promise.all([
        adminService.getDashboardData(token),
        adminService.getReportOverview(token).then((response) => response.data).catch(() => null),
        adminService.listOrders(token).then((response) => response.data ?? []).catch(() => []),
      ]);
      setData(res);
      setReport(reportRes);
      setOrders(ordersRes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const orderRiskSummary = useMemo(() => {
    const cancelledOrders = orders.filter((order) => order.orderStatus === "cancelled");
    const returnedOrders = orders.filter(
      (order) => order.orderStatus === "returned" || order.orderStatus === "return_requested",
    );
    const fallbackCounts = data?.systemSummary?.ordersByStatus ?? {};
    const reasonCounts = new Map<string, number>();

    [...cancelledOrders, ...returnedOrders].forEach((order) => {
      const lastEvent = [...(order.statusHistory ?? [])]
        .reverse()
        .find((item) => item.reasonCode || item.description?.trim());
      const lastReason =
        getReasonLabel(lastEvent?.reasonCode) ||
        lastEvent?.description?.trim() ||
        "No reason provided";
      reasonCounts.set(lastReason, (reasonCounts.get(lastReason) ?? 0) + 1);
    });

    return {
      cancelled: cancelledOrders.length || fallbackCounts.cancelled || 0,
      returned:
        returnedOrders.length ||
        (fallbackCounts.returned ?? 0) + (fallbackCounts.return_requested ?? 0),
      reasons: Array.from(reasonCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([reason, total]) => ({ reason, total })),
    };
  }, [data?.systemSummary?.ordersByStatus, orders]);

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={["top", "bottom"]}>
      <AdminHeader />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-4 pb-24"
      >
        <View className="mb-6 mt-2 flex-row items-center gap-1">
          <Text className="text-[13px] text-[#6b7682]">Admin Dashboard</Text>
          <Feather name="chevron-right" size={14} color="#6b7682" />
          <Text className="text-[13px] font-bold text-[#006397]">Overview</Text>
        </View>

        <View className="mb-6">
          <Text className="mb-2 text-[28px] font-extrabold leading-[36px] text-[#191C1F]">Hello Admin</Text>
          <Text className="text-[15px] leading-[24px] text-[#3F4850]">This is the current system overview. From here you can quickly navigate to reports and system config.</Text>
        </View>

        <View className="mb-8 flex-row gap-3">
          <Pressable
            className="h-[50px] flex-1 flex-row items-center justify-center gap-2 rounded-[12px] bg-[#006397] shadow-sm"
            onPress={() => router.push("/admin/reports" as Href)}
          >
            <Feather name="download" size={18} color="white" />
            <Text className="text-[16px] font-bold text-white">Reports</Text>
          </Pressable>
          <Pressable
            className="h-[50px] flex-1 flex-row items-center justify-center gap-2 rounded-[12px] border border-[#006397] bg-white"
            onPress={() => router.push("/admin/system" as Href)}
          >
            <Feather name="settings" size={18} color="#006397" />
            <Text className="text-[16px] font-bold text-[#006397]">System</Text>
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
                <Text className="text-[16px] font-bold text-[#191C1F]">System Today</Text>
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
            <View className="mt-4 rounded-[16px] border border-[#F2F3F7] bg-white p-5 shadow-sm">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-[16px] font-bold text-[#191C1F]">Cancellation & Return Watch</Text>
                  <Text className="mt-1 text-[12px] text-[#6b7682]">Quick view of lost or risky orders</Text>
                </View>
                <Pressable
                  className="rounded-[10px] bg-[#EAF5FC] px-3 py-2"
                  onPress={() => router.push("/admin/orders" as Href)}
                >
                  <Text className="text-[12px] font-bold text-[#006397]">Open orders</Text>
                </Pressable>
              </View>

              <View className="mt-4 flex-row gap-3">
                <View className="flex-1 rounded-[14px] bg-[#FFF1F0] p-4">
                  <Text className="text-[12px] font-bold uppercase tracking-[0.5px] text-[#BA1A1A]">Cancelled</Text>
                  <Text className="mt-2 text-[26px] font-extrabold text-[#7F1D1D]">{orderRiskSummary.cancelled}</Text>
                </View>
                <View className="flex-1 rounded-[14px] bg-[#FFF7ED] p-4">
                  <Text className="text-[12px] font-bold uppercase tracking-[0.5px] text-[#B45309]">Return/Refund</Text>
                  <Text className="mt-2 text-[26px] font-extrabold text-[#7C2D12]">{orderRiskSummary.returned}</Text>
                </View>
              </View>

              <View className="mt-4 rounded-[14px] bg-[#F8F9FB] p-4">
                <Text className="text-[13px] font-extrabold text-[#191C1F]">Top reasons</Text>
                <View className="mt-3 gap-2">
                  {orderRiskSummary.reasons.length ? (
                    orderRiskSummary.reasons.map((item) => (
                      <View key={item.reason} className="flex-row items-center justify-between">
                        <Text className="mr-3 flex-1 text-[13px] text-[#3F4850]" numberOfLines={1}>
                          {item.reason}
                        </Text>
                        <Text className="text-[13px] font-extrabold text-[#006397]">{item.total}</Text>
                      </View>
                    ))
                  ) : (
                    <Text className="text-[13px] text-[#6b7682]">No cancellation or return reason yet.</Text>
                  )}
                </View>
              </View>
            </View>
            <View className="mt-4" />
            <AdminSalesChart
              currentRevenue={data.systemSummary?.revenue}
              revenueByPeriod={report?.revenueByPeriod}
              revenueByDay={report?.revenueByDay}
              statusDistribution={report?.orderStatusDistribution}
              todayRevenue={report?.todayRevenue}
              yesterdayRevenue={report?.yesterdayRevenue}
            />
            <View className="mt-4" />
            <AdminRecentOrders orders={data.recentOrders} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
