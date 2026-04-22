import { AdminNotificationComposer } from "@/components/admin/notifications/admin-notification-composer";
import { AdminNotificationHistory } from "@/components/admin/notifications/admin-notification-history";
import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/auth/use-permissions";
import { useAdminNotificationsView } from "@/hooks/admin/use-admin-notifications-view";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminNotificationsScreen() {
  const { token } = useAuth();
  const { hasPermission } = usePermissions();
  const canRead = hasPermission("notifications:read");
  const canCreate = hasPermission("notifications:create");

  const { notifications, loading, submitting, error, createNotification } = useAdminNotificationsView(token);

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top", "bottom"]}>
      <AdminHeader title="Gui Thong bao" />
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24" showsVerticalScrollIndicator={false}>
        {!canRead ? (
          <View className="mt-4 rounded-[14px] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#B91C1C]">
              Ban khong co quyen xem thong bao admin.
            </Text>
          </View>
        ) : loading ? (
          <View className="mt-8 items-center">
            <ActivityIndicator size="large" color="#2F95D2" />
          </View>
        ) : (
          <>
            {!!error && (
              <View className="mb-3 rounded-[12px] bg-white p-3">
                <Text className="text-[13px] font-semibold text-[#B91C1C]">{error}</Text>
              </View>
            )}
            {canCreate ? (
              <AdminNotificationComposer
                loading={submitting}
                onSubmit={async (payload) => {
                  try {
                    await createNotification(payload);
                    Alert.alert("Thanh cong", "Da gui thong bao.");
                  } catch (err: any) {
                    Alert.alert("Loi", err?.message ?? "Khong the gui thong bao.");
                  }
                }}
              />
            ) : (
              <View className="mb-3 rounded-[12px] bg-white p-3">
                <Text className="text-[13px] text-[#9A6400]">
                  Ban khong co quyen tao thong bao moi.
                </Text>
              </View>
            )}
            <AdminNotificationHistory notifications={notifications} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
