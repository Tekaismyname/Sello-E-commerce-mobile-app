import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/services/admin.service";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ReportOverview = {
  users: number;
  orders: number;
  revenueByPeriod: { period: string; revenue: number }[];
  topSellingProducts: { productId: number; name: string; totalSold: number }[];
  orderStatusDistribution: { status: string; total: number }[];
};

export default function AdminReportsScreen() {
  const { token } = useAuth();
  const [report, setReport] = useState<ReportOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Vui lòng đăng nhập tài khoản admin.");
      setLoading(false);
      return;
    }

    try {
      const res = await adminService.getReportOverview(token);
      setReport((res.data ?? null) as ReportOverview | null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExport = async (format: "csv" | "json") => {
    if (!token) return;

    try {
      setExporting(true);
      const res = await adminService.exportReport(token, "overview", format);
      Alert.alert(
        "Xuất báo cáo thành công",
        `${res.data.fileName}\n${res.data.filePath}`,
      );
    } catch (err: any) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setExporting(false);
    }
  };

  const formatMoney = (value: number) =>
    `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={["top", "bottom"]}>
      <AdminHeader title="Báo cáo" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-4 pb-24"
      >
        <Text className="text-[22px] font-extrabold text-[#191C1F]">
          Báo cáo và xuất file
        </Text>

        <View className="mt-4 flex-row gap-2">
          <Pressable
            onPress={() => handleExport("csv")}
            disabled={exporting || !report}
            className="flex-1 items-center justify-center rounded-[10px] bg-[#006397] py-3"
          >
            <Text className="text-[12px] font-bold text-white">Export CSV</Text>
          </Pressable>
          <Pressable
            onPress={() => handleExport("json")}
            disabled={exporting || !report}
            className="flex-1 items-center justify-center rounded-[10px] border border-[#006397] py-3"
          >
            <Text className="text-[12px] font-bold text-[#006397]">
              Export JSON
            </Text>
          </Pressable>
        </View>

        {loading && (
          <View className="mt-10 items-center">
            <ActivityIndicator size="large" color="#006397" />
          </View>
        )}

        {!loading && error && (
          <View className="mt-4 rounded-[12px] bg-white p-4">
            <Text className="text-[14px] font-medium text-[#b3261e]">
              {error}
            </Text>
          </View>
        )}

        {!loading && !error && report && (
          <View className="mt-4 gap-3">
            <View className="rounded-[14px] bg-white p-4">
              <Text className="text-[14px] font-bold text-[#191C1F]">
                Tổng quan
              </Text>
              <Text className="mt-2 text-[13px] text-[#3d4651]">
                Users: {report.users}
              </Text>
              <Text className="text-[13px] text-[#3d4651]">
                Orders: {report.orders}
              </Text>
            </View>

            <View className="rounded-[14px] bg-white p-4">
              <Text className="text-[14px] font-bold text-[#191C1F]">
                Doanh thu theo tháng
              </Text>
              <View className="mt-2 gap-1">
                {report.revenueByPeriod.slice(-6).map((item) => (
                  <Text
                    key={item.period}
                    className="text-[12px] text-[#3d4651]"
                  >
                    {item.period}: {formatMoney(item.revenue)}
                  </Text>
                ))}
              </View>
            </View>

            <View className="rounded-[14px] bg-white p-4">
              <Text className="text-[14px] font-bold text-[#191C1F]">
                Top sản phẩm bán chạy
              </Text>
              <View className="mt-2 gap-1">
                {report.topSellingProducts.map((item) => (
                  <Text
                    key={item.productId}
                    className="text-[12px] text-[#3d4651]"
                  >
                    {item.name}: {item.totalSold}
                  </Text>
                ))}
              </View>
            </View>

            <View className="rounded-[14px] bg-white p-4">
              <Text className="text-[14px] font-bold text-[#191C1F]">
                Phân bố trạng thái đơn hàng
              </Text>
              <View className="mt-2 gap-1">
                {report.orderStatusDistribution.map((item) => (
                  <Text
                    key={item.status}
                    className="text-[12px] text-[#3d4651]"
                  >
                    {item.status}: {item.total}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
