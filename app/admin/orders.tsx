import { AdminOrderActions } from "@/components/admin/orders/admin-order-actions";
import { AdminOrderFilters } from "@/components/admin/orders/admin-order-filters";
import { AdminOrderStats } from "@/components/admin/orders/admin-order-stats";
import { AdminOrderTable } from "@/components/admin/orders/admin-order-table";
import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/auth/use-permissions";
import { useAdminOrdersView } from "@/hooks/admin/use-admin-orders-view";
import { adminService } from "@/services/admin.service";
import { AdminOrder, AdminOrderStatus } from "@/types/admin";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ORDER_STATUSES: AdminOrderStatus[] = [
  "pending",
  "confirmed",
  "packed",
  "shipping",
  "delivered",
  "cancelled",
  "returned",
];

export default function AdminOrdersScreen() {
  const { token } = useAuth();
  const { hasPermission } = usePermissions();
  const canReadOrders = hasPermission("orders:read");
  const canUpdateOrders = hasPermission("orders:update");
  const canExportReport = hasPermission("reports:export");

  const {
    pagedOrders,
    filter,
    search,
    page,
    pageCount,
    pageSize,
    loading,
    error,
    metrics,
    setFilter,
    setSearch,
    setPage,
    fetchOrders,
  } = useAdminOrdersView(token, canReadOrders);

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [statusDraft, setStatusDraft] = useState<AdminOrderStatus>("pending");
  const [statusNote, setStatusNote] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    if (selectedOrder) {
      setStatusDraft(selectedOrder.orderStatus);
      setStatusNote("");
    }
  }, [selectedOrder]);

  const handleExport = async () => {
    if (!token || !canExportReport) return;

    try {
      const response = await adminService.exportReport(token, "overview", "csv");
      Alert.alert("Xuất báo cáo thành công", response.data.fileName);
    } catch (err: any) {
      Alert.alert("Lỗi", err.message ?? "Không thể xuất báo cáo");
    }
  };

  const handleCreateOrder = () => {
    Alert.alert("Thông báo", "Backend hiện tại chưa hỗ trợ tạo đơn mới từ admin.");
  };

  const openOrderDetail = async (order: AdminOrder) => {
    if (!token || !canReadOrders) return;

    try {
      setLoadingDetail(true);
      const response = await adminService.getOrderDetail(token, order.id);
      setSelectedOrder(response.data);
    } catch (err: any) {
      Alert.alert("Lỗi", err.message ?? "Không thể tải chi tiết đơn hàng.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!token || !selectedOrder || !canUpdateOrders) return;

    try {
      setSavingStatus(true);
      const response = await adminService.updateOrderStatus(
        token,
        selectedOrder.id,
        statusDraft,
        statusNote.trim() || undefined,
      );
      setSelectedOrder(response.data);
      await fetchOrders();
      Alert.alert("Thành công", "Đã cập nhật trạng thái đơn hàng.");
    } catch (err: any) {
      Alert.alert("ỗi", err.message ?? "Không thể cập nhật trạng thái.");
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top", "bottom"]}>
      <AdminHeader title="Don hang" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-24 pt-2"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[22px] font-extrabold leading-[30px] text-[#1F2934]">
          Quản lý Đơn hàng
        </Text>
        <Text className="mt-2 text-[14px] leading-[22px] text-[#4B5563]">
          Theo dõi và cập nhật trạng thái vận chuyển của khách hàng.
        </Text>

        <AdminOrderActions
          onExport={handleExport}
          onCreate={handleCreateOrder}
          disableExport={!canExportReport}
          disableCreate
        />
        {!canExportReport ? (
          <Text className="mt-2 text-[12px] text-[#9A6400]">
            Bạn không có quyền xuất báo cáo.
          </Text>
        ) : null}

        {loading ? (
          <View className="mt-8 items-center">
            <ActivityIndicator size="large" color="#0369A1" />
          </View>
        ) : error ? (
          <View className="mt-4 rounded-[14px] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#B91C1C]">{error}</Text>
          </View>
        ) : (
          <>
            <AdminOrderStats
              total={metrics.total}
              pending={metrics.pending}
              shipping={metrics.shipping}
              monthlyRevenue={metrics.monthlyRevenue}
            />

            <View className="mt-3">
              <AdminOrderFilters
                search={search}
                filter={filter}
                onSearchChange={setSearch}
                onFilterChange={setFilter}
              />
            </View>

            <View className="mt-3">
              <AdminOrderTable
                orders={pagedOrders}
                page={page}
                pageCount={pageCount}
                pageSize={pageSize}
                onPageChange={setPage}
                onSelectOrder={canReadOrders ? openOrderDetail : undefined}
              />
            </View>
          </>
        )}
      </ScrollView>

      <Modal
        visible={!!selectedOrder}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View className="flex-1 justify-end bg-black/30">
          <View className="max-h-[88%] rounded-t-[24px] bg-white px-5 pb-8 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[18px] font-extrabold text-[#191C1F]">
                Chi tiết đơn hàng
              </Text>
              <Pressable
                className="h-10 w-10 items-center justify-center"
                onPress={() => setSelectedOrder(null)}
              >
                <Text className="text-[20px] font-bold text-[#334155]">x</Text>
              </Pressable>
            </View>

            {loadingDetail ? (
              <View className="py-8 items-center">
                <ActivityIndicator color="#0369A1" />
              </View>
            ) : selectedOrder ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="rounded-[14px] bg-[#F8F9FB] p-4">
                  <Text className="text-[16px] font-bold text-[#191C1F]">
                    #{selectedOrder.orderCode}
                  </Text>
                  <Text className="mt-1 text-[13px] text-[#4B5563]">
                    {selectedOrder.user.fullName} - {selectedOrder.user.email}
                  </Text>
                  <Text className="mt-1 text-[13px] text-[#4B5563]">
                    Tổng tiền: {new Intl.NumberFormat("vi-VN").format(selectedOrder.totalAmount)} d
                  </Text>
                  <Text className="mt-1 text-[13px] text-[#4B5563]">
                    Trạng thái hiện tại: {selectedOrder.orderStatus}
                  </Text>
                </View>

                {!!selectedOrder.shippingAddress && (
                  <View className="mt-3 rounded-[14px] bg-[#F8F9FB] p-4">
                    <Text className="text-[13px] font-bold text-[#191C1F]">Địa chỉ giao</Text>
                    <Text className="mt-1 text-[13px] text-[#4B5563]">
                      {selectedOrder.shippingAddress}
                    </Text>
                  </View>
                )}

                {canUpdateOrders ? (
                  <View className="mt-4 rounded-[14px] bg-white">
                    <Text className="text-[13px] font-bold text-[#191C1F]">
                      Cập nhật trạng thái
                    </Text>
                    <View className="mt-3 flex-row flex-wrap gap-2">
                      {ORDER_STATUSES.map((status) => (
                        <Pressable
                          key={status}
                          onPress={() => setStatusDraft(status)}
                          className={`rounded-full px-3 py-2 ${
                            statusDraft === status ? "bg-[#0369A1]" : "bg-[#E8EDF2]"
                          }`}
                        >
                          <Text
                            className={`text-[12px] font-bold ${
                              statusDraft === status ? "text-white" : "text-[#334155]"
                            }`}
                          >
                            {status}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <TextInput
                      className="mt-3 min-h-[92px] rounded-[12px] bg-[#F3F5FA] px-3 py-3"
                      multiline
                      placeholder="Ghi chú cập nhật (tùy chọn)"
                      placeholderTextColor="#97a0aa"
                      value={statusNote}
                      onChangeText={setStatusNote}
                    />

                    <Pressable
                      className="mt-3 h-11 items-center justify-center rounded-[12px] bg-[#0369A1] disabled:opacity-60"
                      disabled={savingStatus || statusDraft === selectedOrder.orderStatus}
                      onPress={handleUpdateStatus}
                    >
                      <Text className="text-[13px] font-bold text-white">
                        {savingStatus ? "Đang lưu..." : "Lưu trạng thái"}
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <Text className="mt-4 text-[12px] text-[#9A6400]">
                    Bạn không có quyền cập nhật trạng thái đơn hàng.
                  </Text>
                )}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
