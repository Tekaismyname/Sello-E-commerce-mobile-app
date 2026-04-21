import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { SelloHeader } from "@/components/main/sello-header";
import { profileService } from "@/services/customer.service";
import { authService } from "@/services/auth.service";
import { UserProfile } from "@/types/customer";
import { useAuth } from "@/contexts/auth-context";

export default function ProfileScreen() {
  const { token, refreshToken, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactVisible, setContactVisible] = useState(false);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [sendingContact, setSendingContact] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    profileService
      .getProfile(token)
      .then((res) => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore logout API errors and clear local state anyway.
    } finally {
      await signOut();
    }

    router.replace("/onboarding/welcome" as Href);
  };

  const handleContactAdmin = async () => {
    if (!token) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để liên hệ admin.");
      return;
    }

    if (!contactSubject.trim() || !contactMessage.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tiêu đề và nội dung cần hỗ trợ.");
      return;
    }

    setSendingContact(true);
    try {
      const response = await profileService.contactAdmin(token, {
        subject: contactSubject.trim(),
        message: contactMessage.trim(),
      });
      Alert.alert(
        "Đã gửi cho admin",
        response.data.insertedCount > 0
          ? "Admin sẽ nhận thông báo và phản hồi sớm nhất có thể."
          : "Hiện chưa có admin active để nhận thông báo.",
      );
      setContactSubject("");
      setContactMessage("");
      setContactVisible(false);
    } catch (error: any) {
      Alert.alert("Không thể gửi", error?.message ?? "Vui lòng thử lại.");
    } finally {
      setSendingContact(false);
    }
  };

  const displayName = profile?.fullName || "Sello Member";
  const displayEmail = profile?.email || "member@sello.app";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-[#f6f8fc]" edges={["top"]}>
      <SelloHeader />
      <ScrollView className="flex-1" contentContainerClassName="px-4 py-4">
        <View className="rounded-[16px] bg-white p-4">
          {loading ? (
            <ActivityIndicator size="small" color="#006397" />
          ) : (
            <>
              <View className="h-14 w-14 items-center justify-center rounded-full bg-[#dfeaff]">
                <Text className="text-[26px] font-extrabold text-[#2d6dff]">{initials}</Text>
              </View>
              <Text className="mt-3 text-[20px] font-extrabold text-[#1f2934]">{displayName}</Text>
              <Text className="text-[12px] text-[#7d8896]">{displayEmail}</Text>
              {profile?.phone && (
                <Text className="text-[12px] text-[#7d8896]">{profile.phone}</Text>
              )}
            </>
          )}
        </View>

        <View className="mt-4 gap-2">
          {[
            { label: "Thông tin tài khoản" },
            { label: "Địa chỉ giao hàng" },
            { label: "Phương thức thanh toán" },
            { label: "Thông báo", onPress: () => router.push("/main/notifications" as Href) },
            { label: "Liên hệ với admin", onPress: () => setContactVisible(true), icon: "message-circle" as const },
          ].map((item) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              className="h-[48px] flex-row items-center justify-between rounded-[12px] bg-white px-3"
            >
              <View className="flex-row items-center gap-3">
                {item.icon ? <Feather name={item.icon} size={17} color="#0F84C8" /> : null}
                <Text className="text-[14px] font-semibold text-[#364150]">{item.label}</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#7e8997" />
            </Pressable>
          ))}
        </View>

        <Pressable
          className="mt-6 h-[46px] items-center justify-center rounded-[12px] border border-[#d7deea] bg-white"
          onPress={handleLogout}
        >
          <Text className="text-[14px] font-bold text-[#BA1A1A]">Dang xuat</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={contactVisible} transparent animationType="fade" onRequestClose={() => setContactVisible(false)}>
        <View className="flex-1 justify-end bg-black/40 px-4 pb-6">
          <View className="rounded-[22px] bg-white p-5">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-[18px] font-extrabold text-[#1F2934]">Liên hệ với admin</Text>
                <Text className="mt-1 text-[12px] leading-5 text-[#607080]">
                  Nội dung này sẽ được gửi thành thông báo tới các admin đang hoạt động.
                </Text>
              </View>
              <Pressable onPress={() => setContactVisible(false)} className="h-9 w-9 items-center justify-center">
                <Feather name="x" size={20} color="#1F2934" />
              </Pressable>
            </View>

            <Text className="mt-4 text-[12px] font-bold text-[#30343A]">Tiêu đề</Text>
            <TextInput
              className="mt-2 h-12 rounded-[12px] bg-[#F3F5F8] px-4 text-[14px] text-[#1F2934]"
              placeholder="VD: Cần hỗ trợ đơn hàng"
              placeholderTextColor="#97A0AB"
              value={contactSubject}
              onChangeText={setContactSubject}
            />

            <Text className="mt-4 text-[12px] font-bold text-[#30343A]">Nội dung</Text>
            <TextInput
              className="mt-2 min-h-[120px] rounded-[12px] bg-[#F3F5F8] px-4 py-3 text-[14px] text-[#1F2934]"
              placeholder="Nhập vấn đề bạn cần admin hỗ trợ..."
              placeholderTextColor="#97A0AB"
              multiline
              textAlignVertical="top"
              value={contactMessage}
              onChangeText={setContactMessage}
            />

            <Pressable
              disabled={sendingContact}
              onPress={handleContactAdmin}
              className="mt-5 flex-row items-center justify-center gap-2 rounded-[14px] bg-[#0F84C8] py-4 disabled:opacity-60"
            >
              {sendingContact ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Feather name="send" size={16} color="#FFFFFF" />}
              <Text className="text-[14px] font-extrabold text-white">
                {sendingContact ? "Đang gửi..." : "Gửi cho admin"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
