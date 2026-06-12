import { AdminNotification } from "@/types/admin";
import { Text, View, Pressable } from "react-native";
import { Href, router } from "expo-router";

type Props = {
  notifications: AdminNotification[];
};

export function AdminNotificationHistory({ notifications }: Props) {
  const handleItemPress = (item: AdminNotification) => {
    let url: Href = "/admin/dashboard";
    if (item.notificationType === "order") {
      url = "/admin/orders";
    } else if (item.notificationType === "promotion") {
      url = "/admin/vouchers";
    } else if (item.notificationType === "system") {
      url = "/admin/system";
    }
    router.push(url);
  };

  return (
    <View className="mt-3 rounded-[16px] bg-white p-4">
      <Text className="text-[16px] font-extrabold text-[#111827]">Recent Notifications</Text>
      <View className="mt-3 gap-2">
        {notifications.slice(0, 10).map((item) => (
          <Pressable
            key={item.id}
            onPress={() => handleItemPress(item)}
            className="rounded-[12px] bg-[#F8FAFD] p-3 active:bg-[#EFF6FF] border border-transparent active:border-[#BFDBFE]"
          >
            <Text className="text-[14px] font-bold text-[#111827]">{item.title}</Text>
            <Text className="mt-1 text-[12px] text-[#4B5563]" numberOfLines={2}>{item.content}</Text>
            <View className="mt-2 flex-row items-center justify-between">
              <View className="rounded-full bg-[#E0F2FE] px-2.5 py-0.5">
                <Text className="text-[10px] font-black text-[#0369A1] uppercase">{item.notificationType}</Text>
              </View>
              {item.createdAt ? (
                <Text className="text-[10px] font-bold text-[#9CA3AF]">
                  {new Date(item.createdAt).toLocaleDateString("en-US")}
                </Text>
              ) : null}
            </View>
          </Pressable>
        ))}

        {!notifications.length && (
          <Text className="text-[13px] text-[#6B7280]">No notifications yet.</Text>
        )}
      </View>
    </View>
  );
}
