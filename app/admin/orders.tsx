import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/services/admin.service";
import { AdminOrder } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
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

const ORDER_STATUS_OPTIONS: AdminOrder["orderStatus"][] = [
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
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminOrder["orderStatus"]>("all");
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Vui long dang nhap tai khoan admin.");
      setLoading(false);
      return;
    }

    try {
      const res = await adminService.listOrders(token);
      setOrders(res.data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesQuery =
        !normalizedQuery ||
        order.orderCode.toLowerCase().includes(normalizedQuery) ||
        order.user.fullName.toLowerCase().includes(normalizedQuery) ||
        order.user.email.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const openOrderDetail = async (orderId: number) => {
    if (!token) return;

    try {
      setLoadingDetail(true);
      const res = await adminService.getOrderDetail(token, orderId);
      setSelectedOrder(res.data);
    } catch (err: any) {
      Alert.alert("Khong the tai chi tiet don", err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, nextStatus: AdminOrder["orderStatus"]) => {
    if (!token) return;

    try {
      setUpdating(true);
      await adminService.updateOrderStatus(
        token,
        orderId,
        nextStatus,
        `Cap nhat trang thai sang ${nextStatus}`,
      );
      await fetchOrders();
      await openOrderDetail(orderId);
    } catch (err: any) {
      Alert.alert("Loi", err.message);
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)} d`;

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={["top", "bottom"]}>
      <AdminHeader title="Don hang" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-4 pb-24"
      >
        <Text className="text-[22px] font-extrabold text-[#191C1F]">Quan ly don hang</Text>
        <Text className="mt-1 text-[14px] leading-[22px] text-[#5b6470]">
          Theo doi danh sach don, tim kiem, loc va cap nhat trang thai giao nhan.
        </Text>

        <View className="mt-4 rounded-[16px] bg-white p-4 shadow-sm">
          <View className="h-12 flex-row items-center rounded-[12px] bg-[#F4F6F8] px-4">
            <Feather name="search" size={18} color="#6b7682" />
            <TextInput
              className="ml-3 flex-1 text-[14px] text-[#191C1F]"
              placeholder="Tim theo ma don, ten khach, email..."
              placeholderTextColor="#97a0aa"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <Text className="mt-4 text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">
            Trang thai don hang
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
            {(["all", ...ORDER_STATUS_OPTIONS] as const).map((status) => {
              const isSelected = statusFilter === status;
              return (
                <Pressable
                  key={status}
                  onPress={() => setStatusFilter(status)}
                  className={`mr-2 rounded-full px-4 py-2 ${
                    isSelected ? "bg-[#006397]" : "bg-[#E8EDF2]"
                  }`}
                >
                  <Text
                    className={`text-[12px] font-bold ${
                      isSelected ? "text-white" : "text-[#44515F]"
                    }`}
                  >
                    {status.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
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

        {!loading && !error && (
          <View className="mt-4 gap-3">
            <View className="rounded-[14px] bg-[#E8F1FB] px-4 py-3">
              <Text className="text-[13px] font-semibold text-[#0f4d75]">
                Dang hien thi {filteredOrders.length}/{orders.length} don hang.
              </Text>
            </View>

            {filteredOrders.map((order) => (
              <Pressable
                key={order.id}
                onPress={() => openOrderDetail(order.id)}
                className="rounded-[14px] bg-white p-4"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-[15px] font-bold text-[#191C1F]">#{order.orderCode}</Text>
                  <View className="rounded-full bg-[#EEF5FA] px-3 py-1">
                    <Text className="text-[11px] font-bold text-[#006397]">{order.orderStatus}</Text>
                  </View>
                </View>

                <Text className="mt-2 text-[13px] text-[#3d4651]">{order.user.fullName}</Text>
                <Text className="text-[12px] text-[#6b7682]">{order.user.email}</Text>
                <Text className="mt-1 text-[12px] text-[#6b7682]">
                  Thanh toan: {order.paymentStatus} - {order.paymentMethodName}
                </Text>
                <Text className="mt-2 text-[16px] font-bold text-[#1f2934]">
                  {formatPrice(order.totalAmount)}
                </Text>
              </Pressable>
            ))}

            {filteredOrders.length === 0 && (
              <View className="items-center rounded-[14px] bg-white p-6">
                <Text className="text-[14px] text-[#5b6470]">
                  Khong co don hang phu hop voi bo loc hien tai.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <Modal visible={!!selectedOrder} animationType="slide" transparent onRequestClose={() => setSelectedOrder(null)}>
        <View className="flex-1 justify-end bg-black/30">
          <View className="max-h-[88%] rounded-t-[24px] bg-white px-5 pb-8 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[18px] font-extrabold text-[#191C1F]">Chi tiet don hang</Text>
              <Pressable onPress={() => setSelectedOrder(null)} className="h-10 w-10 items-center justify-center">
                <Feather name="x" size={20} color="#1a232d" />
              </Pressable>
            </View>

            {loadingDetail && !selectedOrder && (
              <View className="items-center py-6">
                <ActivityIndicator color="#006397" />
              </View>
            )}

            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="rounded-[16px] bg-[#F8F9FB] p-4">
                  <Text className="text-[17px] font-bold text-[#191C1F]">#{selectedOrder.orderCode}</Text>
                  <Text className="mt-2 text-[13px] text-[#3f4850]">
                    Khach hang: <Text className="font-bold">{selectedOrder.user.fullName}</Text>
                  </Text>
                  <Text className="text-[13px] text-[#3f4850]">{selectedOrder.user.email}</Text>
                  <Text className="mt-2 text-[13px] text-[#3f4850]">
                    Thanh toan: <Text className="font-bold">{selectedOrder.paymentStatus}</Text>
                  </Text>
                  <Text className="text-[13px] text-[#3f4850]">
                    Phuong thuc: <Text className="font-bold">{selectedOrder.paymentMethodName}</Text>
                  </Text>
                  <Text className="text-[13px] text-[#3f4850]">
                    Tong tien: <Text className="font-bold">{formatPrice(selectedOrder.totalAmount)}</Text>
                  </Text>
                  {!!selectedOrder.shippingAddress && (
                    <Text className="mt-2 text-[13px] text-[#3f4850]">
                      Dia chi: <Text className="font-bold">{selectedOrder.shippingAddress}</Text>
                    </Text>
                  )}
                </View>

                <Text className="mt-5 text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">
                  Chon trang thai moi
                </Text>
                <View className="mt-3 flex-row flex-wrap gap-2">
                  {ORDER_STATUS_OPTIONS.map((status) => {
                    const isActive = selectedOrder.orderStatus === status;
                    return (
                      <Pressable
                        key={status}
                        disabled={updating || isActive}
                        onPress={() => handleUpdateStatus(selectedOrder.id, status)}
                        className={`rounded-full px-4 py-2 ${
                          isActive ? "bg-[#006397]" : "bg-[#E8EDF2]"
                        }`}
                      >
                        <Text
                          className={`text-[12px] font-bold ${
                            isActive ? "text-white" : "text-[#44515F]"
                          }`}
                        >
                          {status}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text className="mt-5 text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">
                  Mat hang
                </Text>
                <View className="mt-3 gap-2">
                  {(selectedOrder.items ?? []).map((item, index) => (
                    <View key={`${item.productName}-${index}`} className="rounded-[14px] bg-[#F8F9FB] p-4">
                      <Text className="text-[14px] font-bold text-[#191C1F]">{item.productName}</Text>
                      <Text className="mt-1 text-[12px] text-[#5b6470]">
                        So luong: {item.quantity} - Gia: {formatPrice(item.price)}
                      </Text>
                    </View>
                  ))}
                </View>

                {!!selectedOrder.statusHistory?.length && (
                  <>
                    <Text className="mt-5 text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">
                      Lich su trang thai
                    </Text>
                    <View className="mt-3 gap-2">
                      {selectedOrder.statusHistory.map((history, index) => (
                        <View key={`${history.status}-${index}`} className="rounded-[14px] bg-[#F8F9FB] p-4">
                          <Text className="text-[13px] font-bold text-[#191C1F]">{history.status}</Text>
                          {!!history.changedAt && (
                            <Text className="mt-1 text-[12px] text-[#5b6470]">{history.changedAt}</Text>
                          )}
                          {!!history.description && (
                            <Text className="mt-1 text-[12px] text-[#5b6470]">{history.description}</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
