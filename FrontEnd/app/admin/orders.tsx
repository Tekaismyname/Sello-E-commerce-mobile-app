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
import { Image as ExpoImage } from "expo-image";
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

  const handleQuickUpdateStatus = async (orderId: number, nextStatus: AdminOrderStatus, note = "Quick status update by Admin") => {
    if (!token || !canUpdateOrders) return;
    try {
      setSavingStatus(true);
      await adminService.updateOrderStatus(token, orderId, nextStatus, note);
      await fetchOrders();
      Alert.alert("Success", "Order status updated.");
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Cannot update status.");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleProcessReturn = async (action: "approve" | "reject") => {
    if (!token || !selectedOrder || !canUpdateOrders) return;
    if (!statusNote.trim()) {
      Alert.alert("Error", "Feedback note is required.");
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
      Alert.alert("Success", `${action === "approve" ? "Approved" : "Rejected"} return request.`);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Cannot process return request.");
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
              <ScrollView showsVerticalScrollIndicator={false} className="mt-2">
                {/* 1. Basic Info */}
                <View className="rounded-[14px] bg-[#F8F9FB] p-4">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[16px] font-extrabold text-[#0F4C6B]">
                      Order #{selectedOrder.orderCode}
                    </Text>
                    <View className="rounded-full bg-[#EAF5FC] px-2.5 py-1">
                      <Text className="text-[11px] font-bold text-[#0F6CBD]">
                        {selectedOrder.orderStatus.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text className="mt-2 text-[12px] text-[#64748B]">
                    Placed at: {selectedOrder.placedAt ? new Date(selectedOrder.placedAt).toLocaleString("en-US") : "N/A"}
                  </Text>
                  
                  <View className="mt-3 border-t border-[#E2E8F0] pt-3">
                    <Text className="text-[12px] font-bold text-[#475569] uppercase">Customer</Text>
                    <Text className="mt-1 text-[13px] font-bold text-[#1F2937]">
                      {selectedOrder.user.fullName}
                    </Text>
                    <Text className="text-[12px] text-[#64748B]">
                      {selectedOrder.user.email}
                    </Text>
                  </View>
                </View>

                {/* 2. Shipping Address */}
                {!!selectedOrder.shippingAddress && (
                  <View className="mt-3 rounded-[14px] bg-[#F8F9FB] p-4">
                    <Text className="text-[12px] font-bold text-[#475569] uppercase">Shipping Address</Text>
                    <Text className="mt-1 text-[13px] leading-[19px] text-[#334155]">
                      {selectedOrder.shippingAddress}
                    </Text>
                  </View>
                )}

                {/* 3. Payment Details */}
                <View className="mt-3 rounded-[14px] bg-[#F8F9FB] p-4">
                  <Text className="text-[12px] font-bold text-[#475569] uppercase">Payment Details</Text>
                  <View className="mt-2 flex-row justify-between items-center">
                    <Text className="text-[13px] text-[#334155]">Method:</Text>
                    <Text className="text-[13px] font-bold text-[#1F2937]">{selectedOrder.paymentMethodName}</Text>
                  </View>
                  <View className="mt-1.5 flex-row justify-between items-center">
                    <Text className="text-[13px] text-[#334155]">Status:</Text>
                    <View className={`rounded-full px-2 py-0.5 ${
                      selectedOrder.paymentStatus === 'paid' ? 'bg-[#DCFCE7]' : 'bg-[#FEF3C7]'
                    }`}>
                      <Text className={`text-[11px] font-bold ${
                        selectedOrder.paymentStatus === 'paid' ? 'text-[#15803D]' : 'text-[#B45309]'
                      }`}>
                        {selectedOrder.paymentStatus.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View className="mt-2 border-t border-[#E2E8F0] pt-2 flex-row justify-between items-center">
                    <Text className="text-[13px] font-bold text-[#475569]">Total Amount:</Text>
                    <Text className="text-[16px] font-extrabold text-[#0369A1]">
                      ₫{new Intl.NumberFormat("vi-VN").format(selectedOrder.totalAmount)}
                    </Text>
                  </View>
                </View>

                {/* 4. Order Items */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <View className="mt-3 rounded-[14px] bg-[#F8F9FB] p-4">
                    <Text className="text-[12px] font-bold text-[#475569] uppercase mb-2">Purchased Products</Text>
                    {selectedOrder.items.map((item, index) => (
                      <View key={item.id ?? index} className={`flex-row items-center py-2 ${
                        index > 0 ? "border-t border-[#E2E8F0]/50" : ""
                      }`}>
                        <ExpoImage
                          source={{ uri: item.productImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80" }}
                          className="h-10 w-10 rounded-lg bg-gray-100"
                          contentFit="cover"
                        />
                        <View className="ml-3 flex-1">
                          <Text className="text-[13px] font-bold text-[#1F2937]" numberOfLines={1}>
                            {item.productName}
                          </Text>
                          <Text className="text-[12px] text-[#64748B]">
                            {item.quantity} x {new Intl.NumberFormat("vi-VN").format(item.price)}đ
                          </Text>
                        </View>
                        <Text className="text-[13px] font-bold text-[#1F2937] ml-2">
                          {new Intl.NumberFormat("vi-VN").format(item.quantity * item.price)}đ
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* 5. Status History Timeline */}
                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                  <View className="mt-3 rounded-[14px] bg-[#F8F9FB] p-4">
                    <Text className="text-[12px] font-bold text-[#475569] uppercase mb-3">Status History</Text>
                    {selectedOrder.statusHistory.map((history, index) => (
                      <View key={index} className="flex-row items-start mb-1">
                        {/* Timeline visual bar */}
                        <View className="items-center mr-3">
                          <View className="h-4 w-4 rounded-full border-2 border-[#0369A1] bg-white items-center justify-center">
                            <View className="h-1.5 w-1.5 rounded-full bg-[#0369A1]" />
                          </View>
                          {index < selectedOrder.statusHistory!.length - 1 && (
                            <View className="w-0.5 h-10 bg-[#CBD5E1]" />
                          )}
                        </View>
                        {/* Content */}
                        <View className="flex-1 pb-4">
                          <View className="flex-row justify-between items-center">
                            <Text className="text-[13px] font-bold text-[#1F2937]">
                              {history.status.toUpperCase()}
                            </Text>
                            <Text className="text-[11px] text-[#94A3B8]">
                              {history.changedAt ? new Date(history.changedAt).toLocaleString("en-US") : "N/A"}
                            </Text>
                          </View>
                          {!!history.description && (
                            <Text className="mt-1 text-[12px] leading-[17px] text-[#64748B]">
                              {history.description}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {canUpdateOrders ? (
                  selectedOrder.orderStatus === "return_requested" ? (
                    <View className="mt-4 rounded-[14px] bg-[#FEF2F2] p-4 border border-[#FEE2E2]">
                      <Text className="text-[14px] font-extrabold text-[#991B1B]">Return request needs processing</Text>
                      {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                        <View className="mt-2 rounded-[8px] bg-white p-2.5 border border-[#FCA5A5]/30">
                          <Text className="text-[12px] font-bold text-[#7F1D1D]">Customer reason:</Text>
                          <Text className="text-[12px] text-[#B91C1C] mt-1 leading-[18px]">
                            {selectedOrder.statusHistory.find((h) => h.status === "return_requested")?.description || "No detailed reason"}
                          </Text>
                        </View>
                      )}
                      
                      <TextInput
                        className="mt-3 min-h-[80px] rounded-[12px] bg-white border border-[#EF4444]/20 px-3 py-2 text-[13px] text-[#1F2934]"
                        multiline
                        placeholder="Response note (required)"
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
                          <Text className="text-[13px] font-bold text-white">Reject</Text>
                        </Pressable>
                        <Pressable
                          className="flex-1 h-10 items-center justify-center rounded-[10px] bg-[#10B981] active:opacity-85 disabled:opacity-50"
                          disabled={savingStatus}
                          onPress={() => handleProcessReturn("approve")}
                        >
                          <Text className="text-[13px] font-bold text-white">Approve</Text>
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
