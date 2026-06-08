import { AdminNotification } from "@/types/admin";
import { Text, View } from "react-native";

type Props = {
  notifications: AdminNotification[];
};

export function AdminNotificationHistory({ notifications }: Props) {
  return (
    <View className="mt-3 rounded-[16px] bg-white p-4">
      <Text className="text-[16px] font-extrabold text-[#111827]">Recent Notifications</Text>
      <View className="mt-3 gap-2">
        {notifications.slice(0, 6).map((item) => (
          <View key={item.id} className="rounded-[12px] bg-[#F8FAFD] p-3">
            <Text className="text-[14px] font-bold text-[#111827]">{item.title}</Text>
            <Text className="mt-1 text-[12px] text-[#4B5563]" numberOfLines={2}>{item.content}</Text>
            <Text className="mt-1 text-[11px] text-[#6B7280]">{item.notificationType}</Text>
          </View>
        ))}

        {!notifications.length && (
          <Text className="text-[13px] text-[#6B7280]">No notifications yet.</Text>
        )}
      </View>
    </View>
  );
}
