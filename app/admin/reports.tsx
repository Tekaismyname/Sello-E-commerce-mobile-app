import { AdminHeader } from "@/components/admin/shared/admin-header";
import { WeeklyProfitChart } from "@/components/admin/dashboard/weekly-profit-chart";
import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/auth/use-permissions";
import { adminService } from "@/services/admin.service";
import { AdminReportOverview } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TIME_RANGE_OPTIONS = [
  { key: "all", label: "Tat ca" },
  { key: "3", label: "3 ky" },
  { key: "6", label: "6 ky" },
  { key: "12", label: "12 ky" },
] as const;

export default function AdminReportsScreen() {
  const { token } = useAuth();
  const { hasPermission } = usePermissions();
  const canReadReports = hasPermission("reports:read");
  const canExportReports = hasPermission("reports:export");

  const [report, setReport] = useState<AdminReportOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [timeRange, setTimeRange] = useState<(typeof TIME_RANGE_OPTIONS)[number]["key"]>("6");

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Please log in to admin account.");
      setLoading(false);
      return;
    }

    if (!canReadReports) {
      setError("You do not have permission to view reports.");
      setLoading(false);
      return;
    }

    try {
      const res = await adminService.getReportOverview(token);
      setReport(res.data ?? null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [canReadReports, token]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const visibleRevenue = useMemo(() => {
    const items = report?.revenueByPeriod ?? [];
    if (timeRange === "all") {
      return items;
    }

    return items.slice(-Number(timeRange));
  }, [report?.revenueByPeriod, timeRange]);

  const handleExport = async (format: "csv" | "json") => {
    if (!token || !canExportReports) return;

    try {
      setExporting(true);
      const res = await adminService.exportReport(token, "overview", format);
      Alert.alert(
        "Report exported successfully",
        `${res.data.fileName}\n${res.data.filePath}`,
      );
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setExporting(false);
    }
  };

  const formatMoney = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)} d`;

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={["top", "bottom"]}>
      <AdminHeader title="Reports" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-4 pb-24"
      >
        <Text className="text-[22px] font-extrabold text-[#191C1F]">Reports & Export</Text>
        <Text className="mt-1 text-[14px] leading-[22px] text-[#5b6470]">Select tracking period, view summary stats and export overview report.</Text>

        <View className="mt-4 rounded-[16px] bg-white p-4 shadow-sm">
          <Text className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">Revenue Display Period</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            {TIME_RANGE_OPTIONS.map((option) => {
              const isSelected = timeRange === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => setTimeRange(option.key)}
                  className={`mr-2 rounded-full px-4 py-2 ${
                    isSelected ? "bg-[#006397]" : "bg-[#E8EDF2]"
                  }`}
                >
                  <Text
                    className={`text-[12px] font-bold ${
                      isSelected ? "text-white" : "text-[#44515F]"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View className="mt-4 flex-row gap-2">
            <Pressable
              onPress={() => handleExport("csv")}
              disabled={exporting || !report || !canExportReports}
              className="flex-1 items-center justify-center rounded-[10px] bg-[#006397] py-3 disabled:opacity-50"
            >
              <Text className="text-[12px] font-bold text-white">Export CSV</Text>
            </Pressable>
            <Pressable
              onPress={() => handleExport("json")}
              disabled={exporting || !report || !canExportReports}
              className="flex-1 items-center justify-center rounded-[10px] border border-[#006397] py-3 disabled:opacity-50"
            >
              <Text className="text-[12px] font-bold text-[#006397]">Export JSON</Text>
            </Pressable>
          </View>
          {!canExportReports ? (
            <Text className="mt-2 text-[12px] text-[#9A6400]">You do not have permission to export reports.</Text>
          ) : null}
        </View>

        {loading && (
          <View className="mt-10 items-center">
            <ActivityIndicator size="large" color="#006397" />
          </View>
        )}

        {!loading && error && (
          <View className="mt-4 rounded-[12px] bg-white p-4">
            <Text className="text-[14px] font-medium text-[#b3261e]">{error}</Text>
          </View>
        )}

        {!loading && !error && report && (
          <View className="mt-4 gap-3">
            <View className="flex-row gap-3">
              <View className="flex-1 rounded-[14px] bg-white p-4">
                <Text className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">
                  Users
                </Text>
                <Text className="mt-2 text-[24px] font-extrabold text-[#191C1F]">{report.users}</Text>
              </View>
              <View className="flex-1 rounded-[14px] bg-white p-4">
                <Text className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">
                  Orders
                </Text>
                <Text className="mt-2 text-[24px] font-extrabold text-[#191C1F]">{report.orders}</Text>
              </View>
            </View>

            <WeeklyProfitChart revenueByDay={report.revenueByDay} />

            <View className="rounded-[14px] bg-white p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-[14px] font-bold text-[#191C1F]">Revenue By Period</Text>
                <Feather name="bar-chart-2" size={18} color="#006397" />
              </View>
              <View className="mt-3 gap-3">
                {visibleRevenue.map((item) => {
                  const maxRevenue = Math.max(...visibleRevenue.map((entry) => entry.revenue), 1);
                  const widthPercent = Math.max(12, (item.revenue / maxRevenue) * 100);

                  return (
                    <View key={item.period}>
                      <View className="mb-1 flex-row items-center justify-between">
                        <Text className="text-[12px] font-semibold text-[#44515F]">{item.period}</Text>
                        <Text className="text-[12px] font-bold text-[#191C1F]">
                          {formatMoney(item.revenue)}
                        </Text>
                      </View>
                      <View className="h-3 overflow-hidden rounded-full bg-[#EEF2F5]">
                        <View
                          className="h-full rounded-full bg-[#006397]"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            <View className="rounded-[14px] bg-white p-4">
              <Text className="text-[14px] font-bold text-[#191C1F]">Top Selling Products</Text>
              <View className="mt-3 gap-2">
                {report.topSellingProducts.map((item, index) => (
                  <View
                    key={item.productId}
                    className="flex-row items-center justify-between rounded-[12px] bg-[#F8F9FB] px-4 py-3"
                  >
                    <View className="flex-1 pr-4">
                      <Text className="text-[13px] font-bold text-[#191C1F]">
                        #{index + 1} {item.name}
                      </Text>
                    </View>
                    <Text className="text-[12px] font-bold text-[#006397]">
                      {item.totalSold} sold
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="rounded-[14px] bg-white p-4">
              <Text className="text-[14px] font-bold text-[#191C1F]">Order Status Distribution</Text>
              <View className="mt-3 gap-2">
                {report.orderStatusDistribution.map((item) => (
                  <View
                    key={item.status}
                    className="flex-row items-center justify-between rounded-[12px] bg-[#F8F9FB] px-4 py-3"
                  >
                    <Text className="text-[13px] font-semibold text-[#44515F]">{item.status}</Text>
                    <Text className="text-[13px] font-bold text-[#191C1F]">{item.total}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
