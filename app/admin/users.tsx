import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/services/admin.service";
import { AdminUser } from "@/types/admin";
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

const ROLE_FILTERS = ["all", "admin", "customer"] as const;
const STATUS_FILTERS = ["all", "active", "blocked", "inactive"] as const;

type RoleFilter = (typeof ROLE_FILTERS)[number];
type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function AdminUsersScreen() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [refreshingDetail, setRefreshingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Vui long dang nhap tai khoan admin.");
      setLoading(false);
      return;
    }

    try {
      const res = await adminService.listUsers(token);
      setUsers(res.data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        user.fullName.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        (user.phone ?? "").toLowerCase().includes(normalizedQuery);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [roleFilter, searchQuery, statusFilter, users]);

  const openUserDetail = async (userId: number) => {
    if (!token) {
      return;
    }

    try {
      setRefreshingDetail(true);
      const res = await adminService.getUserDetail(token, userId);
      setSelectedUser(res.data);
    } catch (err: any) {
      Alert.alert("Khong the tai chi tiet", err.message);
    } finally {
      setRefreshingDetail(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    if (!token) return;

    const nextStatus = user.status === "blocked" ? "active" : "blocked";

    try {
      await adminService.updateUserStatus(token, user.id, nextStatus);
      await fetchUsers();
      if (selectedUser?.id === user.id) {
        await openUserDetail(user.id);
      }
    } catch (err: any) {
      Alert.alert("Loi", err.message);
    }
  };

  const handleSetRole = async (user: AdminUser, nextRole: "admin" | "customer") => {
    if (!token) return;

    try {
      await adminService.updateUserRole(token, user.id, nextRole, nextRole === "admin" ? 3 : null);
      await fetchUsers();
      if (selectedUser?.id === user.id) {
        await openUserDetail(user.id);
      }
    } catch (err: any) {
      Alert.alert("Loi", err.message);
    }
  };

  const renderFilterPill = (
    value: string,
    selectedValue: string,
    onPress: () => void,
    label?: string,
  ) => (
    <Pressable
      key={value}
      onPress={onPress}
      className={`mr-2 rounded-full px-4 py-2 ${
        selectedValue === value ? "bg-[#006397]" : "bg-[#E8EDF2]"
      }`}
    >
      <Text
        className={`text-[12px] font-bold ${
          selectedValue === value ? "text-white" : "text-[#44515F]"
        }`}
      >
        {label ?? value}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={["top", "bottom"]}>
      <AdminHeader title="Nguoi dung" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-4 pb-24"
      >
        <Text className="text-[22px] font-extrabold text-[#191C1F]">Quản lý người dùng</Text>
        <Text className="mt-1 text-[14px] leading-[22px] text-[#5b6470]">
          Xem danh sách, tìm kiếm, lọc, xem chi tiết và cập nhật role/trạng thái tài khoản.
        </Text>

        <View className="mt-4 rounded-[16px] bg-white p-4 shadow-sm">
          <View className="h-12 flex-row items-center rounded-[12px] bg-[#F4F6F8] px-4">
            <Feather name="search" size={18} color="#6b7682" />
            <TextInput
              className="ml-3 flex-1 text-[14px] text-[#191C1F]"
              placeholder="Tìm theo tên, email, số điện thoại..."
              placeholderTextColor="#97a0aa"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <Text className="mt-4 text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">
            Lọc theo vai trò
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
            {ROLE_FILTERS.map((value) =>
              renderFilterPill(value, roleFilter, () => setRoleFilter(value), value.toUpperCase()),
            )}
          </ScrollView>

          <Text className="mt-4 text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">
            Lọc theo trạng thái
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
            {STATUS_FILTERS.map((value) =>
              renderFilterPill(
                value,
                statusFilter,
                () => setStatusFilter(value),
                value.toUpperCase(),
              ),
            )}
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
                Hien co {filteredUsers.length}/{users.length} người dùng phù hợp bộ lọc.
              </Text>
            </View>

            {filteredUsers.map((user) => (
              <Pressable
                key={user.id}
                onPress={() => openUserDetail(user.id)}
                className="rounded-[14px] bg-white p-4"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-4">
                    <Text className="text-[15px] font-bold text-[#191C1F]">{user.fullName}</Text>
                    <Text className="mt-1 text-[12px] text-[#5b6470]">{user.email}</Text>
                    {!!user.phone && (
                      <Text className="text-[12px] text-[#5b6470]">{user.phone}</Text>
                    )}
                  </View>
                  <Feather name="chevron-right" size={18} color="#97a0aa" />
                </View>

                <View className="mt-3 flex-row flex-wrap gap-2">
                  <View className="rounded-full bg-[#E8F1F8] px-3 py-1">
                    <Text className="text-[11px] font-bold text-[#0f4d75]">
                      Role: {user.role}
                    </Text>
                  </View>
                  <View
                    className={`rounded-full px-3 py-1 ${
                      user.status === "blocked"
                        ? "bg-[#FDECEC]"
                        : user.status === "inactive"
                          ? "bg-[#FFF5E6]"
                          : "bg-[#EAF7EF]"
                    }`}
                  >
                    <Text
                      className={`text-[11px] font-bold ${
                        user.status === "blocked"
                          ? "text-[#A92A2A]"
                          : user.status === "inactive"
                            ? "text-[#9A6400]"
                            : "text-[#1D7A38]"
                      }`}
                    >
                      {user.status}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}

            {filteredUsers.length === 0 && (
              <View className="items-center rounded-[14px] bg-white p-6">
                <Text className="text-[14px] text-[#5b6470]">
                  Không có người dùng phù hợp với tìm kiếm/bộ lọc hiện tại.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <Modal visible={!!selectedUser} animationType="slide" transparent onRequestClose={() => setSelectedUser(null)}>
        <View className="flex-1 justify-end bg-black/30">
          <View className="max-h-[85%] rounded-t-[24px] bg-white px-5 pb-8 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[18px] font-extrabold text-[#191C1F]">Chi tiết người dùng</Text>
              <Pressable onPress={() => setSelectedUser(null)} className="h-10 w-10 items-center justify-center">
                <Feather name="x" size={20} color="#1a232d" />
              </Pressable>
            </View>

            {refreshingDetail && !selectedUser && (
              <View className="items-center py-6">
                <ActivityIndicator color="#006397" />
              </View>
            )}

            {selectedUser && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="rounded-[16px] bg-[#F8F9FB] p-4">
                  <Text className="text-[17px] font-bold text-[#191C1F]">{selectedUser.fullName}</Text>
                  <Text className="mt-1 text-[13px] text-[#5b6470]">{selectedUser.email}</Text>
                  {!!selectedUser.phone && (
                    <Text className="text-[13px] text-[#5b6470]">{selectedUser.phone}</Text>
                  )}

                  <View className="mt-4 gap-2">
                    <Text className="text-[13px] text-[#3f4850]">
                      Role: <Text className="font-bold">{selectedUser.role}</Text>
                    </Text>
                    <Text className="text-[13px] text-[#3f4850]">
                      Trạng thái: <Text className="font-bold">{selectedUser.status}</Text>
                    </Text>
                    <Text className="text-[13px] text-[#3f4850]">
                      Admin level: <Text className="font-bold">{selectedUser.adminLevel ?? "-"}</Text>
                    </Text>
                    <Text className="text-[13px] text-[#3f4850]">
                      Đã xác minh: <Text className="font-bold">{selectedUser.isVerified ? "Có" : "Chưa"}</Text>
                    </Text>
                  </View>
                </View>

                <Text className="mt-5 text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">
                  Hành động nhanh
                </Text>
                <View className="mt-3 gap-3">
                  <Pressable
                    onPress={() => handleToggleStatus(selectedUser)}
                    className="items-center justify-center rounded-[12px] border border-[#D5DCE5] py-3"
                  >
                    <Text className="text-[13px] font-bold text-[#344252]">
                      {selectedUser.status === "blocked" ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                    </Text>
                  </Pressable>

                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={() => handleSetRole(selectedUser, "customer")}
                      className="flex-1 items-center justify-center rounded-[12px] bg-[#EEF2F6] py-3"
                    >
                      <Text className="text-[13px] font-bold text-[#344252]">Đặt role customer</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleSetRole(selectedUser, "admin")}
                      className="flex-1 items-center justify-center rounded-[12px] bg-[#006397] py-3"
                    >
                      <Text className="text-[13px] font-bold text-white">Đặt role admin</Text>
                    </Pressable>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
