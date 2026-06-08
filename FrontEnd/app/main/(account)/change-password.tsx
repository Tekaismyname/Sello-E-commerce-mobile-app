import { useAuth } from "@/contexts/auth-context";
import { profileService } from "@/services/customer.service";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChangePasswordScreen() {
  const { token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
      if (!token) {
        Alert.alert("Lỗi", "Vui long dang nhap lai.");
      return;
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Thiếu dữ liệu", "Vui long nhap day du thong tin.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Mật khẩu yếu", "Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Không khớp", "ác nhận mật khẩu mới chưa khớp.");
      return;
    }

    try {
      setSaving(true);
      await profileService.updatePassword(token, {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      Alert.alert("Thành công", "Đã cập nhật mật khẩu.");
      router.back();
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không thể đổi mật khẩu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top", "bottom"]}>
      <View className="h-[56px] flex-row items-center px-4">
        <Pressable className="h-10 w-10 items-center justify-center" onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#0369A1" />
        </Pressable>
        <Text className="ml-2 text-[18px] font-extrabold text-[#0F4C6B]">Doi mat khau</Text>
      </View>

      <View className="p-4">
        <View className="rounded-[14px] bg-white p-4">
          <Text className="text-[13px] font-bold text-[#111827]">Mật khẩu hiện tại</Text>
          <TextInput
            className="mt-2 h-12 rounded-[10px] bg-[#F3F5FA] px-3"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />

          <Text className="mt-4 text-[13px] font-bold text-[#111827]">Mật khẩu mới</Text>
          <TextInput
            className="mt-2 h-12 rounded-[10px] bg-[#F3F5FA] px-3"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <Text className="mt-4 text-[13px] font-bold text-[#111827]">Xác nhận mật khẩu mới</Text>
          <TextInput
            className="mt-2 h-12 rounded-[10px] bg-[#F3F5FA] px-3"
            secureTextEntry
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
          />

          <Pressable
            className="mt-5 h-12 items-center justify-center rounded-[12px] bg-[#2F95D2] disabled:opacity-60"
            disabled={saving}
            onPress={submit}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-[15px] font-bold text-white">Cap nhat mat khau</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
