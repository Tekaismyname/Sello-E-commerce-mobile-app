import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthMessage } from "@/components/auth/auth-message";
import { useAuthAction } from "@/hooks/auth/use-auth-action";

export default function AccountCompletionScreen() {
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [address, setAddress] = useState("");
  const { loading, errorMessage, setErrorMessage, runAuthAction } = useAuthAction();

  const submitCompletion = async () => {
    setErrorMessage("");

    if (!dob.trim() || !gender || !address.trim()) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    // Here we would normally call an API to update the user profile
    await runAuthAction(async () => {
      return new Promise((resolve) => setTimeout(resolve, 800));
    });

    router.replace("/main/home" as Href);
  };

  const skipCompletion = () => {
    router.replace("/main/home" as Href);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fd]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-10 pt-8"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-[#eef1f5]">
              <Feather name="camera" size={32} color="#8c96a2" />
              <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-[2px] border-white bg-[#157bb8]">
                <Feather name="plus" size={16} color="white" />
              </View>
            </View>
            <Text className="mt-8 text-center text-[30px] font-extrabold text-[#191c1f]">
              Hoàn tất hồ sơ
            </Text>
            <Text className="mt-3 text-center text-[15px] leading-[22px] text-[#3f4850]">
              Cập nhật thông tin để trải nghiệm mua sắm cá nhân hóa tốt hơn.
            </Text>
          </View>

          <View className="mt-8 gap-4">
            <View>
              <Text className="mb-2 ml-1 text-[14px] font-medium text-[#3f4850]">Ngày sinh</Text>
              <View className="h-[52px] flex-row items-center rounded-[12px] border border-[#d9dadf] bg-white px-4">
                <Feather name="calendar" size={18} color="#6b7682" />
                <TextInput
                  className="ml-3 flex-1 text-[16px] text-[#191c1f]"
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#97a0aa"
                  keyboardType="numeric"
                  value={dob}
                  onChangeText={setDob}
                />
              </View>
            </View>

            <View>
              <Text className="mb-2 ml-1 text-[14px] font-medium text-[#3f4850]">Giới tính</Text>
              <View className="flex-row gap-2">
                <Pressable
                  className={`h-[48px] flex-1 flex-row items-center justify-center gap-2 rounded-[12px] border ${
                    gender === "male" ? "border-[#157bb8] bg-[#eef7fd]" : "border-[#d9dadf] bg-white"
                  }`}
                  onPress={() => setGender("male")}
                >
                  <Text
                    className={`text-[14px] font-semibold ${
                      gender === "male" ? "text-[#157bb8]" : "text-[#3f4850]"
                    }`}
                  >
                    Nam
                  </Text>
                </Pressable>

                <Pressable
                  className={`h-[48px] flex-1 flex-row items-center justify-center gap-2 rounded-[12px] border ${
                    gender === "female" ? "border-[#157bb8] bg-[#eef7fd]" : "border-[#d9dadf] bg-white"
                  }`}
                  onPress={() => setGender("female")}
                >
                  <Text
                    className={`text-[14px] font-semibold ${
                      gender === "female" ? "text-[#157bb8]" : "text-[#3f4850]"
                    }`}
                  >
                    Nữ
                  </Text>
                </Pressable>

                <Pressable
                  className={`h-[48px] flex-1 flex-row items-center justify-center gap-2 rounded-[12px] border ${
                    gender === "other" ? "border-[#157bb8] bg-[#eef7fd]" : "border-[#d9dadf] bg-white"
                  }`}
                  onPress={() => setGender("other")}
                >
                  <Text
                    className={`text-[14px] font-semibold ${
                      gender === "other" ? "text-[#157bb8]" : "text-[#3f4850]"
                    }`}
                  >
                    Khác
                  </Text>
                </Pressable>
              </View>
            </View>

            <View>
              <Text className="mb-2 ml-1 text-[14px] font-medium text-[#3f4850]">Địa chỉ</Text>
              <View className="h-[52px] flex-row items-center rounded-[12px] border border-[#d9dadf] bg-white px-4">
                <Feather name="map-pin" size={18} color="#6b7682" />
                <TextInput
                  className="ml-3 flex-1 text-[16px] text-[#191c1f]"
                  placeholder="Nhập địa chỉ của bạn"
                  placeholderTextColor="#97a0aa"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>

            <AuthMessage kind="error" text={errorMessage} />

            <AuthButton
              title="Hoàn tất"
              loading={loading}
              className="mt-4 shadow-[0px_10px_18px_rgba(21,123,184,0.28)]"
              onPress={submitCompletion}
            />

            <Pressable className="mt-2 h-[52px] items-center justify-center" onPress={skipCompletion}>
              <Text className="text-[15px] font-semibold text-[#6b7682]">Bỏ qua, tôi sẽ cập nhật sau</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
