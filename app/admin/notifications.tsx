import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { AdminNotificationComposer } from "@/components/admin/notifications/admin-notification-composer";
import { AdminNotificationHistory } from "@/components/admin/notifications/admin-notification-history";
import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { useSettings } from "@/contexts/settings-context";
import { usePermissions } from "@/hooks/auth/use-permissions";
import { useAdminNotificationsView } from "@/hooks/admin/use-admin-notifications-view";

export default function AdminNotificationsScreen() {
  const { token } = useAuth();
  const { showToast } = useSettings();
  const { hasPermission } = usePermissions();
  const canRead = hasPermission("notifications:read");
  const canCreate = hasPermission("notifications:create");

  const { notifications, loading, submitting, error, createNotification } = useAdminNotificationsView(token);
  const [isComposerVisible, setIsComposerVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top", "bottom"]}>
      <AdminHeader title="Send Notifications" />
      
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24" showsVerticalScrollIndicator={false}>
        {!canRead ? (
          <View className="mt-4 rounded-[14px] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#B91C1C]">
              You do not have permission to view admin notifications.
            </Text>
          </View>
        ) : loading ? (
          <View className="mt-8 items-center">
            <ActivityIndicator size="large" color="#0F6CBD" />
          </View>
        ) : (
          <>
            {!!error && (
              <View className="mb-3 rounded-[12px] bg-white p-3 border-l-4 border-red-500">
                <Text className="text-[13px] font-semibold text-[#B91C1C]">{error}</Text>
              </View>
            )}

            {canCreate && (
              <Pressable
                onPress={() => setIsComposerVisible(true)}
                className="mb-4 flex-row items-center justify-center gap-2 rounded-[14px] bg-[#0F6CBD] py-3.5 shadow-md shadow-blue-500/10 active:opacity-90"
              >
                <Feather name="plus-circle" size={16} color="white" />
                <Text className="text-[14px] font-extrabold text-white">Create New Notification</Text>
              </Pressable>
            )}

            <AdminNotificationHistory notifications={notifications} />
          </>
        )}
      </ScrollView>

      {/* Composer Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isComposerVisible}
        onRequestClose={() => setIsComposerVisible(false)}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-[24px] max-h-[92%] p-4 pb-10">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between border-b border-[#E5E7EB] pb-3 mb-4">
              <Text className="text-[16px] font-black text-[#111827]">Create New Notification</Text>
              <Pressable
                onPress={() => setIsComposerVisible(false)}
                className="h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6] active:bg-[#E5E7EB]"
              >
                <Feather name="x" size={16} color="#4B5563" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-6">
              {canCreate ? (
                <AdminNotificationComposer
                  loading={submitting}
                  onSubmit={async (payload) => {
                    try {
                      await createNotification(payload);
                      setIsComposerVisible(false);
                      showToast("Success", "Notification sent successfully.", "success");
                    } catch (err: any) {
                      showToast("Error", err?.message ?? "Cannot send notification.", "error");
                    }
                  }}
                />
              ) : (
                <View className="mb-3 rounded-[12px] bg-white p-3">
                  <Text className="text-[13px] text-[#9A6400]">
                    You do not have permission to create notifications.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
