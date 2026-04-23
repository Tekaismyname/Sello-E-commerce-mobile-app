import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/auth/use-permissions";
import { adminService } from "@/services/admin.service";
import { AdminDashboardData } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
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

type ConfigItem = {
  id: string;
  status: "active" | "inactive";
};

const CONFIG_STATUS_LABELS: Record<ConfigItem["status"], string> = {
  active: "Hoạt động",
  inactive: "Không hoạt động",
};

const emptyConfigItem = (): ConfigItem => ({
  id: "",
  status: "active",
});

export default function AdminSystemScreen() {
  const { token } = useAuth();
  const { hasPermission } = usePermissions();
  const canReadSystem = hasPermission("system:dashboard:read");
  const canUpdateSystemConfig = hasPermission("system:config:update");
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [configOptions, setConfigOptions] = useState<{
    categories: Array<{ id: number; name: string; status: string }>;
    paymentMethods: Array<{ id: number; code: string; name: string; status: string }>;
    vouchers: Array<{
      id: number;
      code: string;
      name: string;
      discountType: string;
      discountValue: number;
      minOrderValue: number;
      isActive: boolean;
    }>;
  } | null>(null);
  const [catalogModal, setCatalogModal] = useState<
    null | "categories" | "paymentMethods" | "vouchers"
  >(null);
  const [categoryConfigs, setCategoryConfigs] = useState<ConfigItem[]>([emptyConfigItem()]);
  const [paymentConfigs, setPaymentConfigs] = useState<ConfigItem[]>([emptyConfigItem()]);
  const [voucherConfigs, setVoucherConfigs] = useState<ConfigItem[]>([emptyConfigItem()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Vui lòng đăng nhập tài khoản admin.");
      setLoading(false);
      return;
    }

    if (!canReadSystem) {
      setError("Bạn không có quyền xem dữ liệu hệ thống.");
      setLoading(false);
      return;
    }

    try {
      const res = await adminService.getDashboardData(token);
      setDashboardData(res);
      const configRes = await adminService.getSystemConfigOptions(token);
      setConfigOptions(configRes.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [canReadSystem, token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const orderStatusEntries = useMemo(
    () => Object.entries(dashboardData?.systemSummary?.ordersByStatus ?? {}),
    [dashboardData?.systemSummary?.ordersByStatus],
  );

  const updateConfigRow = (
    list: ConfigItem[],
    setList: (next: ConfigItem[]) => void,
    index: number,
    key: keyof ConfigItem,
    value: string,
  ) => {
    setList(
      list.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    );
  };

  const removeConfigRow = (
    list: ConfigItem[],
    setList: (next: ConfigItem[]) => void,
    index: number,
  ) => {
    if (list.length === 1) {
      setList([emptyConfigItem()]);
      return;
    }

    setList(list.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSave = async () => {
    if (!token || !canUpdateSystemConfig) return;

    const buildStatusPayload = (list: ConfigItem[]) =>
      list
        .map((item) => ({
          id: Number(item.id),
          status: item.status,
        }))
        .filter((item) => Number.isFinite(item.id) && item.id > 0);

    const categoryStatuses = buildStatusPayload(categoryConfigs).map((item) => ({
      categoryId: item.id,
      status: item.status,
    }));
    const paymentMethodStatuses = buildStatusPayload(paymentConfigs).map((item) => ({
      paymentMethodId: item.id,
      status: item.status,
    }));
    const voucherStatuses = voucherConfigs
      .map((item) => ({
        voucherId: Number(item.id),
        isActive: item.status === "active",
      }))
      .filter((item) => Number.isFinite(item.voucherId) && item.voucherId > 0);

    try {
      setSaving(true);
      await adminService.updateSystemConfig(token, {
        categoryStatuses,
        paymentMethodStatuses,
        voucherStatuses,
      });
      Alert.alert("Thành công", "Đã cập nhật cấu hình hệ thống.");
    } catch (err: any) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderConfigSection = (
    title: string,
    list: ConfigItem[],
    setList: (next: ConfigItem[]) => void,
    addRow: () => void,
  ) => (
    <View className="rounded-[16px] bg-white p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <Text className="text-[15px] font-bold text-[#191C1F]">{title}</Text>
        <Pressable
          onPress={addRow}
          className="flex-row items-center gap-2 rounded-full bg-[#E8F1FB] px-3 py-2"
        >
          <Feather name="plus" size={14} color="#006397" />
          <Text className="text-[12px] font-bold text-[#006397]">Thêm dòng</Text>
        </Pressable>
      </View>

      <View className="mt-3 gap-3">
        {list.map((item, index) => (
          <View key={`${title}-${index}`} className="rounded-[12px] bg-[#F8F9FB] p-3">
            <TextInput
              className="h-11 rounded-[10px] bg-white px-3 text-[14px] text-[#191C1F]"
              placeholder="Nhập ID..."
              placeholderTextColor="#97a0aa"
              keyboardType="numeric"
              value={item.id}
              onChangeText={(value) =>
                updateConfigRow(list, setList, index, "id", value.replace(/[^0-9]/g, ""))
              }
            />

            <View className="mt-3 flex-row gap-2">
              {(["active", "inactive"] as const).map((status) => {
                const isSelected = item.status === status;
                return (
                  <Pressable
                    key={status}
                    onPress={() => updateConfigRow(list, setList, index, "status", status)}
                    className={`flex-1 rounded-[10px] px-3 py-3 ${
                      isSelected ? "bg-[#006397]" : "bg-white"
                    }`}
                  >
                    <Text
                      className={`text-center text-[12px] font-bold ${
                        isSelected ? "text-white" : "text-[#44515F]"
                      }`}
                    >
                      {CONFIG_STATUS_LABELS[status]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={() => removeConfigRow(list, setList, index)}
              className="mt-3 flex-row items-center justify-center gap-2 rounded-[10px] border border-[#E7E8EC] py-2"
            >
              <Feather name="trash-2" size={14} color="#9A6400" />
              <Text className="text-[12px] font-bold text-[#9A6400]">Xóa dòng</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );

  const catalogTitle =
    catalogModal === "categories"
      ? "Danh sách danh mục"
      : catalogModal === "paymentMethods"
        ? "Danh sách phương thức thanh toán"
        : "Danh sách voucher";

  const catalogItems =
    catalogModal === "categories"
      ? configOptions?.categories ?? []
      : catalogModal === "paymentMethods"
        ? configOptions?.paymentMethods ?? []
        : configOptions?.vouchers ?? [];

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={["top", "bottom"]}>
      <AdminHeader title="Hệ thống" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-4 pb-24"
      >
        <Text className="text-[22px] font-extrabold text-[#191C1F]">Quản lý hệ thống</Text>
        <Text className="mt-1 text-[14px] leading-[22px] text-[#5b6470]">
          Xem dashboard hệ thống và cập nhật nhanh voucher, phương thức thanh toán, danh mục.
        </Text>

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

        {!loading && !error && dashboardData?.systemSummary && (
          <>
            <View className="mt-4 rounded-[16px] bg-white p-5 shadow-sm">
              <Text className="text-[15px] font-bold text-[#191C1F]">Tổng quan hệ thống</Text>
              <View className="mt-4 flex-row flex-wrap gap-3">
                <View className="min-w-[47%] flex-1 rounded-[14px] bg-[#F8F9FB] p-4">
                  <Text className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">
                    Người dùng
                  </Text>
                  <Text className="mt-2 text-[22px] font-extrabold text-[#191C1F]">
                    {dashboardData.systemSummary.users}
                  </Text>
                </View>
                <View className="min-w-[47%] flex-1 rounded-[14px] bg-[#F8F9FB] p-4">
                  <Text className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">
                    Sản phẩm
                  </Text>
                  <Text className="mt-2 text-[22px] font-extrabold text-[#191C1F]">
                    {dashboardData.systemSummary.products}
                  </Text>
                </View>
                <View className="min-w-[47%] flex-1 rounded-[14px] bg-[#F8F9FB] p-4">
                  <Text className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">
                    Doanh thu
                  </Text>
                  <Text className="mt-2 text-[22px] font-extrabold text-[#191C1F]">
                    {new Intl.NumberFormat("vi-VN").format(dashboardData.systemSummary.revenue)} đ
                  </Text>
                </View>
                <View className="min-w-[47%] flex-1 rounded-[14px] bg-[#F8F9FB] p-4">
                  <Text className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">
                    Voucher / Thanh toán
                  </Text>
                  <Text className="mt-2 text-[22px] font-extrabold text-[#191C1F]">
                    {dashboardData.systemSummary.vouchers} / {dashboardData.systemSummary.paymentMethods}
                  </Text>
                </View>
              </View>

              {!!orderStatusEntries.length && (
                <View className="mt-4">
                  <Text className="text-[13px] font-bold text-[#191C1F]">Tổng quan trạng thái đơn hàng</Text>
                  <View className="mt-3 flex-row flex-wrap gap-2">
                    {orderStatusEntries.map(([status, total]) => (
                      <View key={status} className="rounded-full bg-[#EEF5FA] px-3 py-2">
                        <Text className="text-[12px] font-bold text-[#006397]">
                          {status}: {total}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            <View className="mt-4 gap-4">
              <View className="rounded-[16px] bg-white p-4 shadow-sm">
                <Text className="text-[15px] font-bold text-[#191C1F]">Tra nhanh ID để thao tác</Text>
                <Text className="mt-1 text-[13px] leading-[20px] text-[#5b6470]">
                  Mở danh sách danh mục, voucher và phương thức thanh toán để xem ID trước khi cập nhật cấu hình.
                </Text>

                <View className="mt-4 gap-3">
                  <Pressable
                    onPress={() => router.push("/admin/categories" as Href)}
                    className="flex-row items-center justify-between rounded-[12px] bg-[#E8F1FB] px-4 py-4"
                  >
                    <View className="flex-row items-center gap-3">
                      <Feather name="grid" size={18} color="#006397" />
                      <Text className="text-[14px] font-bold text-[#191C1F]">Quản lý danh mục</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#97a0aa" />
                  </Pressable>

                  <Pressable
                    onPress={() => router.push("/admin/vouchers" as Href)}
                    className="flex-row items-center justify-between rounded-[12px] bg-[#E8F1FB] px-4 py-4"
                  >
                    <View className="flex-row items-center gap-3">
                      <Feather name="tag" size={18} color="#006397" />
                      <Text className="text-[14px] font-bold text-[#191C1F]">Quản lý voucher</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#97a0aa" />
                  </Pressable>

                  <Pressable
                    onPress={() => router.push("/admin/notifications" as Href)}
                    className="flex-row items-center justify-between rounded-[12px] bg-[#E8F1FB] px-4 py-4"
                  >
                    <View className="flex-row items-center gap-3">
                      <Feather name="send" size={18} color="#006397" />
                      <Text className="text-[14px] font-bold text-[#191C1F]">Gửi thông báo</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#97a0aa" />
                  </Pressable>

                  <Pressable
                    onPress={() => router.push("/admin/reviews" as Href)}
                    className="flex-row items-center justify-between rounded-[12px] bg-[#E8F1FB] px-4 py-4"
                  >
                    <View className="flex-row items-center gap-3">
                      <Feather name="message-square" size={18} color="#006397" />
                      <Text className="text-[14px] font-bold text-[#191C1F]">Kiểm duyệt đánh giá</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#97a0aa" />
                  </Pressable>

                  <Pressable
                    onPress={() => setCatalogModal("categories")}
                    className="flex-row items-center justify-between rounded-[12px] bg-[#F8F9FB] px-4 py-4"
                  >
                    <View className="flex-row items-center gap-3">
                      <Feather name="layers" size={18} color="#006397" />
                      <Text className="text-[14px] font-bold text-[#191C1F]">Xem danh mục</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#97a0aa" />
                  </Pressable>

                  <Pressable
                    onPress={() => setCatalogModal("paymentMethods")}
                    className="flex-row items-center justify-between rounded-[12px] bg-[#F8F9FB] px-4 py-4"
                  >
                    <View className="flex-row items-center gap-3">
                      <Feather name="credit-card" size={18} color="#006397" />
                      <Text className="text-[14px] font-bold text-[#191C1F]">Xem phương thức thanh toán</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#97a0aa" />
                  </Pressable>

                  <Pressable
                    onPress={() => setCatalogModal("vouchers")}
                    className="flex-row items-center justify-between rounded-[12px] bg-[#F8F9FB] px-4 py-4"
                  >
                    <View className="flex-row items-center gap-3">
                      <Feather name="tag" size={18} color="#006397" />
                      <Text className="text-[14px] font-bold text-[#191C1F]">Xem voucher</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#97a0aa" />
                  </Pressable>
                </View>
              </View>

              {renderConfigSection("Cấu hình danh mục", categoryConfigs, setCategoryConfigs, () =>
                setCategoryConfigs([...categoryConfigs, emptyConfigItem()]),
              )}
              {renderConfigSection("Cấu hình phương thức thanh toán", paymentConfigs, setPaymentConfigs, () =>
                setPaymentConfigs([...paymentConfigs, emptyConfigItem()]),
              )}
              {renderConfigSection("Cấu hình voucher", voucherConfigs, setVoucherConfigs, () =>
                setVoucherConfigs([...voucherConfigs, emptyConfigItem()]),
              )}
            </View>

            {canUpdateSystemConfig ? (
              <Pressable
                onPress={handleSave}
                disabled={saving}
                className="mt-5 items-center justify-center rounded-[14px] bg-[#006397] py-4"
              >
                <Text className="text-[14px] font-bold text-white">
                  {saving ? "Đang lưu..." : "Lưu cập nhật hệ thống"}
                </Text>
              </Pressable>
            ) : (
              <Text className="mt-5 text-[12px] text-[#9A6400]">
                Bạn không có quyền cập nhật cấu hình hệ thống.
              </Text>
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={catalogModal !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setCatalogModal(null)}
      >
        <View className="flex-1 justify-end bg-black/30">
          <View className="max-h-[82%] rounded-t-[24px] bg-white px-5 pb-8 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[18px] font-extrabold text-[#191C1F]">{catalogTitle}</Text>
              <Pressable onPress={() => setCatalogModal(null)} className="h-10 w-10 items-center justify-center">
                <Feather name="x" size={20} color="#1a232d" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-3">
                {catalogItems.map((item: any, index) => (
                  <View key={`${catalogModal}-${item.id}-${index}`} className="rounded-[14px] bg-[#F8F9FB] p-4">
                    <Text className="text-[14px] font-extrabold text-[#191C1F]">ID: {item.id}</Text>
                    {"name" in item ? (
                      <Text className="mt-1 text-[13px] font-semibold text-[#44515F]">{item.name}</Text>
                    ) : null}
                    {"code" in item ? (
                      <Text className="mt-1 text-[12px] text-[#5b6470]">Mã: {item.code}</Text>
                    ) : null}
                    {"status" in item ? (
                      <Text className="mt-1 text-[12px] text-[#5b6470]">Trạng thái: {item.status}</Text>
                    ) : null}
                    {"discountType" in item ? (
                      <Text className="mt-1 text-[12px] text-[#5b6470]">
                        Giảm giá: {item.discountType} - {item.discountValue}
                      </Text>
                    ) : null}
                    {"minOrderValue" in item ? (
                      <Text className="mt-1 text-[12px] text-[#5b6470]">
                        Đơn tối thiểu: {new Intl.NumberFormat("vi-VN").format(item.minOrderValue)} đ
                      </Text>
                    ) : null}
                    {"isActive" in item ? (
                      <Text className="mt-1 text-[12px] text-[#5b6470]">
                        Kích hoạt: {item.isActive ? "Có" : "Không"}
                      </Text>
                    ) : null}
                  </View>
                ))}

                {!catalogItems.length && (
                  <View className="items-center rounded-[14px] bg-[#F8F9FB] p-6">
                    <Text className="text-[14px] text-[#5b6470]">Không có dữ liệu để hiển thị.</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
