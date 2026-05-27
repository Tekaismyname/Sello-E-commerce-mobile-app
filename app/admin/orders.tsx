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
  "return_requested",
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
      Alert.alert("Report exported successfully", response.data.fileName);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Cannot export report");
    }
  };

  const handleCreateOrder = () => {
    Alert.alert("Notifications", "Backend doesn't support creating new orders from admin yet.");
  };

  const openOrderDetail = async (order: AdminOrder) => {
    if (!token || !canReadOrders) return;

    try {
      setLoadingDetail(true);
      const response = await adminService.getOrderDetail(token, order.id);
      setSelectedOrder(response.data);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Cannot load order details.");
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
      Alert.alert("Success", "Order status updated.");
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Cannot update status.");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleQuickUpdateStatus = async (orderId: number, nextStatus: AdminOrderStatus, note = "Cập nhật trạng thái nhanh bởi Admin") => {
    if (!token || !canUpdateOrders) return;
    try {
      setSavingStatus(true);
      await adminService.updateOrderStatus(token, orderId, nextStatus, note);
      await fetchOrders();
      Alert.alert("Thành công", "Đã cập nhật trạng thái đơn hàng.");
    } catch (err: any) {
      Alert.alert("Lỗi", err.message ?? "Không thể cập nhật trạng thái.");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleProcessReturn = async (action: "approve" | "reject") => {
    if (!token || !selectedOrder || !canUpdateOrders) return;
    if (!statusNote.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập ghi chú phản hồi bắt buộc.");
      return;
    }

    try {
      setSavingStatus(true);
      const response = await adminService.processOrderReturn(
        token,
        selectedOrder.id,
        action,
        statusNote.trim(),
      );
      setSelectedOrder(response.data);
      await fetchOrders();
      Alert.alert("Thành công", `Đã ${action === "approve" ? "phê duyệt" : "từ chối"} yêu cầu trả hàng.`);
    } catch (err: any) {
      Alert.alert("Lỗi", err.message ?? "Không thể xử lý yêu cầu trả hàng.");
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top", "bottom"]}>
      <AdminHeader title="Orders" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-24 pt-2"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[22px] font-extrabold leading-[30px] text-[#1F2934]">Manage Orders</Text>
        <Text className="mt-2 text-[14px] leading-[22px] text-[#4B5563]">Track and update customer shipping status.</Text>

        <AdminOrderActions
          onExport={handleExport}
          onCreate={handleCreateOrder}
          disableExport={!canExportReport}
          disableCreate
        />
        {!canExportReport ? (
          <Text className="mt-2 text-[12px] text-[#9A6400]">You don't have permission to export reports.</Text>
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
                counts={metrics.counts}
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
                onQuickUpdateStatus={canUpdateOrders ? handleQuickUpdateStatus : undefined}
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
              <Text className="text-[18px] font-extrabold text-[#191C1F]">Order Details</Text>
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
                  <Text className="mt-1 text-[13px] text-[#4B5563]">Total: {new Intl.NumberFormat("en-US").format(selectedOrder.totalAmount)} d</Text>
                  <Text className="mt-1 text-[13px] text-[#4B5563]">Current Status: {selectedOrder.orderStatus}</Text>
                </View>

                {!!selectedOrder.shippingAddress && (
                  <View className="mt-3 rounded-[14px] bg-[#F8F9FB] p-4">
                    <Text className="text-[13px] font-bold text-[#191C1F]">Shipping Address</Text>
                    <Text className="mt-1 text-[13px] text-[#4B5563]">
                      {selectedOrder.shippingAddress}
                    </Text>
                  </View>
                )}

                {canUpdateOrders ? (
                  selectedOrder.orderStatus === "return_requested" ? (
                    <View className="mt-4 rounded-[14px] bg-[#FEF2F2] p-4 border border-[#FEE2E2]">
                      <Text className="text-[14px] font-extrabold text-[#991B1B]">Yêu cầu trả hàng cần xử lý</Text>
                      {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                        <View className="mt-2 rounded-[8px] bg-white p-2.5 border border-[#FCA5A5]/30">
                          <Text className="text-[12px] font-bold text-[#7F1D1D]">Lý do từ khách hàng:</Text>
                          <Text className="text-[12px] text-[#B91C1C] mt-1 leading-[18px]">
                            {selectedOrder.statusHistory.find((h) => h.status === "return_requested")?.description || "Không có lý do chi tiết"}
                          </Text>
                        </View>
                      )}
                      
                      <TextInput
                        className="mt-3 min-h-[80px] rounded-[12px] bg-white border border-[#EF4444]/20 px-3 py-2 text-[13px] text-[#1F2934]"
                        multiline
                        placeholder="Ghi chú phản hồi duyệt/từ chối (bắt buộc)"
                        placeholderTextColor="#9CA3AF"
                        value={statusNote}
                        onChangeText={setStatusNote}
                        textAlignVertical="top"
                      />

                      <View className="mt-3 flex-row gap-3">
                        <Pressable
                          className="flex-1 h-10 items-center justify-center rounded-[10px] bg-[#EF4444] active:opacity-85 disabled:opacity-50"
                          disabled={savingStatus}
                          onPress={() => handleProcessReturn("reject")}
                        >
                          <Text className="text-[13px] font-bold text-white">Từ chối</Text>
                        </Pressable>
                        <Pressable
                          className="flex-1 h-10 items-center justify-center rounded-[10px] bg-[#10B981] active:opacity-85 disabled:opacity-50"
                          disabled={savingStatus}
                          onPress={() => handleProcessReturn("approve")}
                        >
                          <Text className="text-[13px] font-bold text-white">Phê duyệt</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View className="mt-4 rounded-[14px] bg-white">
                      <Text className="text-[13px] font-bold text-[#191C1F]">Update Status</Text>
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
                        placeholder="Update note (optional)"
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
                          {savingStatus ? "Saving..." : "Save Status"}
                        </Text>
                      </Pressable>
                    </View>
                  )
                ) : (
                  <Text className="mt-4 text-[12px] text-[#9A6400]">You don't have permission to update order status.</Text>
                )}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
