import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/services/admin.service";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AdminUserItem = {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  adminLevel?: number | null;
  status: "active" | "blocked" | "inactive";
};

export default function AdminUsersScreen() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Vui lÃ²ng Ä‘Äƒng nháº­p tÃ i khoáº£n admin.");
      setLoading(false);
      return;
    }

    try {
      const res = await adminService.listUsers(token);
      setUsers((res.data ?? []) as AdminUserItem[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user: AdminUserItem) => {
    if (!token) return;

    const nextStatus = user.status === "blocked" ? "active" : "blocked";

    try {
      await adminService.updateUserStatus(token, user.id, nextStatus);
      fetchUsers();
    } catch (err: any) {
      Alert.alert("Lá»—i", err.message);
    }
  };

  const handleToggleRole = async (user: AdminUserItem) => {
    if (!token) return;

    const nextRole = user.role === "admin" ? "customer" : "admin";
    const nextAdminLevel = nextRole === "admin" ? 3 : null;

    try {
      await adminService.updateUserRole(token, user.id, nextRole, nextAdminLevel);
      fetchUsers();
    } catch (err: any) {
      Alert.alert("Lá»—i", err.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={["top", "bottom"]}>
      <AdminHeader title="NgÆ°á»i dÃ¹ng" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="p-4 pb-24">
        <Text className="text-[22px] font-extrabold text-[#191C1F]">Quáº£n lÃ½ ngÆ°á»i dÃ¹ng</Text>

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
            {users.map((user) => (
              <View key={user.id} className="rounded-[14px] bg-white p-4">
                <Text className="text-[15px] font-bold text-[#191C1F]">{user.fullName}</Text>
                <Text className="mt-1 text-[12px] text-[#5b6470]">{user.email}</Text>
                {user.phone ? <Text className="text-[12px] text-[#5b6470]">{user.phone}</Text> : null}

                <View className="mt-2 flex-row items-center gap-2">
                  <View className="rounded-full bg-[#E8F1F8] px-3 py-1">
                    <Text className="text-[11px] font-bold text-[#0f4d75]">Role: {user.role}</Text>
                  </View>
                  <View className={`rounded-full px-3 py-1 ${user.status === "blocked" ? "bg-[#FDECEC]" : "bg-[#EAF7EF]"}`}>
                    <Text className={`text-[11px] font-bold ${user.status === "blocked" ? "text-[#A92A2A]" : "text-[#1D7A38]"}`}>
                      {user.status}
                    </Text>
                  </View>
                </View>

                <View className="mt-3 flex-row gap-2">
                  <Pressable
                    onPress={() => handleToggleStatus(user)}
                    className="flex-1 items-center justify-center rounded-[10px] border border-[#D5DCE5] py-2"
                  >
                    <Text className="text-[12px] font-bold text-[#344252]">
                      {user.status === "blocked" ? "Má»Ÿ khÃ³a" : "KhÃ³a tÃ i khoáº£n"}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleToggleRole(user)}
                    className="flex-1 items-center justify-center rounded-[10px] bg-[#006397] py-2"
                  >
                    <Text className="text-[12px] font-bold text-white">
                      {user.role === "admin" ? "Vá» customer" : "LÃªn admin"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}

            {users.length === 0 && (
              <View className="rounded-[14px] bg-white p-6 items-center">
                <Text className="text-[14px] text-[#5b6470]">KhÃ´ng cÃ³ dá»¯ liá»‡u user.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
