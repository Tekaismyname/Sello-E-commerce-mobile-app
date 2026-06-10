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
import { SocialAuthOptions } from "@/components/auth/social-auth-options";
import { useAuthAction } from "@/hooks/auth/use-auth-action";
import { authService } from "@/services/auth.service";
import { OtpDeliveryMethod } from "@/types/auth";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<OtpDeliveryMethod>("email");
  const { loading, errorMessage, setErrorMessage, runAuthAction } = useAuthAction();

  const submitRegister = async () => {
    setErrorMessage("");

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage("Please enter your full name, email, and phone number.");
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Password confirmation does not match.");
      return;
    }

    const response = await runAuthAction(() =>
      authService.register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
        deliveryMethod,
      }),
    );

    if (!response) {
      return;
    }

    const query = new URLSearchParams({
      purpose: "register",
      identifier: deliveryMethod === "email" ? email.trim() : phone.trim(),
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
            <Text className="mt-8 text-center text-[36px] font-extrabold text-[#191c1f]">
              Create a new account
            </Text>
            <Text className="mt-3 text-center text-[16px] leading-[24px] text-[#3f4850]">
              Join Sello to save orders, track deals, and enjoy a smoother shopping experience.
            </Text>
          </View>

          <View className="mt-10 gap-4">
            <View className="h-[52px] flex-row items-center rounded-[12px] border border-[#d9dadf] bg-white px-4">
              <Feather name="user" size={18} color="#6b7682" />
              <TextInput
                className="ml-3 flex-1 text-[16px] text-[#191c1f]"
                placeholder="Full name"
                placeholderTextColor="#97a0aa"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View className="h-[52px] flex-row items-center rounded-[12px] border border-[#d9dadf] bg-white px-4">
              <Feather name="mail" size={18} color="#6b7682" />
              <TextInput
                className="ml-3 flex-1 text-[16px] text-[#191c1f]"
                placeholder="Email"
                placeholderTextColor="#97a0aa"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View className="h-[52px] flex-row items-center rounded-[12px] border border-[#d9dadf] bg-white px-4">
              <Feather name="phone" size={18} color="#6b7682" />
              <TextInput
                className="ml-3 flex-1 text-[16px] text-[#191c1f]"
                placeholder="Phone number"
                placeholderTextColor="#97a0aa"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View className="h-[52px] flex-row items-center rounded-[12px] border border-[#d9dadf] bg-white px-4">
              <Feather name="lock" size={18} color="#6b7682" />
              <TextInput
                className="ml-3 flex-1 text-[16px] text-[#191c1f]"
                placeholder="Password"
                placeholderTextColor="#97a0aa"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={18}
                  color="#6b7682"
                />
              </Pressable>
            </View>

            <View className="h-[52px] flex-row items-center rounded-[12px] border border-[#d9dadf] bg-white px-4">
              <Feather name="shield" size={18} color="#6b7682" />
              <TextInput
                className="ml-3 flex-1 text-[16px] text-[#191c1f]"
                placeholder="Confirm password"
                placeholderTextColor="#97a0aa"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Pressable onPress={() => setShowConfirmPassword((prev) => !prev)}>
                <Feather
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={18}
                  color="#6b7682"
                />
              </Pressable>
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

            <AuthMessage kind="error" text={errorMessage} />

            <AuthButton
              title="Create Account"
              loading={loading}
              className="mt-1 shadow-[0px_10px_18px_rgba(21,123,184,0.28)]"
              onPress={submitRegister}
            />
          </View>

          <SocialAuthOptions
            onGooglePress={() =>
              setErrorMessage("Google sign-up will be added in the next step.")
            }
            onApplePress={() =>
              setErrorMessage("Apple sign-up will be added in the next step.")
            }
          />

          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-[14px] text-[#3f4850]">Already have an account?</Text>
            <Pressable onPress={() => router.replace("/auth/login" as Href)}>
              <Text className="text-[14px] font-semibold text-[#157bb8]">Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
