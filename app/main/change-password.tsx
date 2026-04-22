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
      Alert.alert("Loi", "Vui long dang nhap lai.");
      return;
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Thieu du lieu", "Vui long nhap day du thong tin.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Mat khau yeu", "Mat khau moi phai co it nhat 8 ky tu.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Khong khop", "Xac nhan mat khau moi chua khop.");
      return;
    }

    try {
      setSaving(true);
      await profileService.updatePassword(token, {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      Alert.alert("Thanh cong", "Da cap nhat mat khau.");
      router.back();
    } catch (err: any) {
      Alert.alert("Loi", err?.message ?? "Khong the doi mat khau.");
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
          <Text className="text-[13px] font-bold text-[#111827]">Mat khau hien tai</Text>
          <TextInput
            className="mt-2 h-12 rounded-[10px] bg-[#F3F5FA] px-3"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />

          <Text className="mt-4 text-[13px] font-bold text-[#111827]">Mat khau moi</Text>
          <TextInput
            className="mt-2 h-12 rounded-[10px] bg-[#F3F5FA] px-3"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <Text className="mt-4 text-[13px] font-bold text-[#111827]">Xac nhan mat khau moi</Text>
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
