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
import { SelloAuthLogo } from "@/components/auth/sello-auth-logo";
import { useAuthAction } from "@/hooks/auth/use-auth-action";
import { authService } from "@/services/auth.service";
import { OtpDeliveryMethod } from "@/types/auth";

export default function ForgotPasswordScreen() {
  const [identifier, setIdentifier] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<OtpDeliveryMethod>("email");
  const { loading, errorMessage, setErrorMessage, runAuthAction } = useAuthAction();

  const submitForgotPassword = async () => {
    setErrorMessage("");

    if (!identifier.trim()) {
      setErrorMessage("Please enter your email or phone number.");
      return;
    }

    const response = await runAuthAction(() =>
      authService.forgotPassword({
        identifier: identifier.trim(),
        deliveryMethod,
      }),
    );

    if (!response) {
      return;
    }

    const query = new URLSearchParams({
      purpose: "reset_password",
      identifier: identifier.trim(),
      targetValue: response.otp.targetValue,
      previewCode: response.otp.otpCodePreview ?? "",
    }).toString();

    router.push((`/auth/otp?${query}` as unknown) as Href);
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
            <SelloAuthLogo />
            <Text className="mt-8 text-center text-[34px] font-extrabold text-[#191c1f]">
              Forgot Password
            </Text>
            <Text className="mt-3 text-center text-[16px] leading-[24px] text-[#3f4850]">
              Enter your account details and we&apos;ll send you an OTP so you can reset your password quickly.
            </Text>
          </View>

          <View className="mt-10 gap-4">
            <View className="h-[52px] flex-row items-center rounded-[12px] border border-[#d9dadf] bg-white px-4">
              <Feather name="mail" size={18} color="#6b7682" />
              <TextInput
                className="ml-3 flex-1 text-[16px] text-[#191c1f]"
                placeholder="Email or phone number"
                placeholderTextColor="#97a0aa"
                autoCapitalize="none"
                value={identifier}
                onChangeText={setIdentifier}
              />
            </View>

            <View className="rounded-[12px] border border-[#d9dadf] bg-white p-3">
              <Text className="mb-3 text-[14px] font-semibold text-[#3f4850]">
                Receive OTP via
              </Text>
              <View className="flex-row gap-2">
                <Pressable
                  className={`h-[42px] flex-1 flex-row items-center justify-center gap-2 rounded-[10px] ${
                    deliveryMethod === "email" ? "bg-[#157bb8]" : "bg-[#e6e8ec]"
                  }`}
                  onPress={() => setDeliveryMethod("email")}
                >
                  <Feather
                    name="mail"
                    size={16}
                    color={deliveryMethod === "email" ? "#ffffff" : "#3f4850"}
                  />
                  <Text
                    className={`text-[14px] font-semibold ${
                      deliveryMethod === "email" ? "text-white" : "text-[#3f4850]"
                    }`}
                  >
                    Email
                  </Text>
                </Pressable>

                <Pressable
                  className={`h-[42px] flex-1 flex-row items-center justify-center gap-2 rounded-[10px] ${
                    deliveryMethod === "phone" ? "bg-[#157bb8]" : "bg-[#e6e8ec]"
                  }`}
                  onPress={() => setDeliveryMethod("phone")}
                >
                  <Feather
                    name="smartphone"
                    size={16}
                    color={deliveryMethod === "phone" ? "#ffffff" : "#3f4850"}
                  />
                  <Text
                    className={`text-[14px] font-semibold ${
                      deliveryMethod === "phone" ? "text-white" : "text-[#3f4850]"
                    }`}
                  >
                    Phone
                  </Text>
                </Pressable>
              </View>
            </View>

            <Text className="rounded-[10px] bg-[#eef4fb] px-3 py-2 text-[13px] text-[#0f4c81]">
              The OTP will expire after a few minutes. Please double-check your email or phone number before sending.
            </Text>

            <AuthMessage kind="error" text={errorMessage} />

            <AuthButton
              title="Send OTP"
              loading={loading}
              className="mt-1 shadow-[0px_10px_18px_rgba(21,123,184,0.28)]"
              onPress={submitForgotPassword}
            />
          </View>

          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-[14px] text-[#3f4850]">Remember your password?</Text>
            <Pressable onPress={() => router.replace("/auth/login" as Href)}>
              <Text className="text-[14px] font-semibold text-[#157bb8]">Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
