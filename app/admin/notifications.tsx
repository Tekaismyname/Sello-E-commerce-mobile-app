import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/services/admin.service";
import { AdminNotification } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const targetOptions = [
  { value: "all_users", label: "Tat ca nguoi dung", description: "Gui den tat ca tai khoan active" },
  { value: "customer_only", label: "Nhom nguoi dung cu the", description: "Loc theo role customer" },
  { value: "admin_only", label: "Admin", description: "Gui den cac tai khoan admin" },
] as const;

export default function AdminNotificationsScreen() {
  const { token, user } = useAuth();
  const permissions = user?.permissions ?? [];
  const canCreate = permissions.includes("notifications:create");
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetScope, setTargetScope] = useState<(typeof targetOptions)[number]["value"]>("all_users");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await adminService.listNotifications(token);
      setNotifications(response.data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSend = async () => {
    if (!token || !canCreate) return;
    if (!title.trim() || !content.trim()) {
      Alert.alert("Thieu thong tin", "Vui long nhap tieu de va noi dung thong bao.");
      return;
    }

    setSending(true);
    try {
      const response = await adminService.createNotification(token, {
        title: title.trim(),
        content: content.trim(),
        targetScope,
        notificationType: "promotion",
        imageUrl: imageUrl.trim() || null,
      });
      Alert.alert("Da gui thong bao", `Da tao ${response.data.insertedCount} thong bao.`);
      setTitle("");
      setContent("");
      setImageUrl("");
      await fetchNotifications();
    } catch (nextError: any) {
      Alert.alert("Loi", nextError.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F6F8FC]" edges={["top", "bottom"]}>
      <AdminHeader title="Gui Thong bao" />
      <ScrollView contentContainerClassName="p-5 pb-24">
        <View className="rounded-[18px] bg-white p-4">
          <Text className="text-[18px] font-extrabold text-[#0F6CBD]">Tao moi thong bao</Text>
          <Text className="mt-1 text-[13px] leading-[19px] text-[#607080]">
            Soan thao va chuan bi gui thong bao day den nguoi dung tren ung dung.
          </Text>
          <View className="my-5 h-px bg-[#EEF3F7]" />

          <Text className="text-[13px] font-bold text-[#30343A]">Tieu de thong bao *</Text>
          <TextInput className="mt-2 h-12 rounded-[10px] bg-[#F3F5F8] px-4" placeholder="Vi du: Khuyen mai cuoi tuan" value={title} onChangeText={setTitle} />

          <Text className="mt-5 text-[13px] font-bold text-[#30343A]">Noi dung tin nhan *</Text>
          <TextInput className="mt-2 min-h-[112px] rounded-[10px] bg-[#F3F5F8] px-4 py-3" multiline textAlignVertical="top" placeholder="Nhap noi dung thong bao tai day..." value={content} onChangeText={setContent} />

          <Text className="mt-5 text-[13px] font-bold text-[#30343A]">Doi tuong nhan tin *</Text>
          <View className="mt-2 gap-3">
            {targetOptions.map((option) => {
              const selected = targetScope === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setTargetScope(option.value)}
                  className={`rounded-[12px] border px-4 py-3 ${selected ? "border-[#0F84C8] bg-[#F3FAFF]" : "border-[#D8E2EC] bg-white"}`}
                >
                  <Text className="text-[14px] font-bold text-[#30343A]">{option.label}</Text>
                  <Text className="mt-1 text-[12px] text-[#607080]">{option.description}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="mt-5 text-[13px] font-bold text-[#30343A]">Anh dinh kem (tuy chon)</Text>
          <View className="mt-2 items-center rounded-[12px] border border-dashed border-[#CCD6E0] bg-[#F7FAFD] p-5">
            <Feather name="image" size={24} color="#607080" />
            <TextInput className="mt-3 h-11 w-full rounded-[10px] bg-white px-4" placeholder="URL anh JPEG, PNG..." value={imageUrl} onChangeText={setImageUrl} />
          </View>

          <Pressable disabled={!canCreate || sending} onPress={handleSend} className={`mt-6 flex-row items-center justify-center gap-2 rounded-[12px] py-4 ${canCreate ? "bg-[#0F84C8]" : "bg-[#CBD7E1]"}`}>
            <Feather name="send" size={16} color="#FFFFFF" />
            <Text className="text-[15px] font-extrabold text-white">{sending ? "Dang gui..." : "Gui Thong bao ngay"}</Text>
          </Pressable>
        </View>

        <Text className="mt-6 text-[17px] font-extrabold text-[#1F2934]">Thong bao gan day</Text>
        {loading ? (
          <View className="mt-5 items-center">
            <ActivityIndicator color="#0F6CBD" />
          </View>
        ) : (
          <View className="mt-3 gap-3">
            {notifications.slice(0, 8).map((item) => (
              <View key={item.id} className="rounded-[14px] bg-white p-4">
                <Text className="text-[14px] font-bold text-[#1F2934]">{item.title}</Text>
                <Text className="mt-1 text-[12px] text-[#607080]" numberOfLines={2}>{item.content}</Text>
                <Text className="mt-2 text-[11px] text-[#97A0AB]">
                  {item.userName} - {new Date(item.createdAt).toLocaleString("vi-VN")}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
