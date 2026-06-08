import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthMessage } from "@/components/auth/auth-message";
import { SelloAuthLogo } from "@/components/auth/sello-auth-logo";
import { SocialAuthOptions } from "@/components/auth/social-auth-options";
import { useAuthAction } from "@/hooks/auth/use-auth-action";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/contexts/auth-context";
import { triggerLocalNotification } from "@/utils/local-notification";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const {
    loading,
    errorMessage,
    successMessage,
    setErrorMessage,
    setSuccessMessage,
    runAuthAction,
  } = useAuthAction();

  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedRemember = await AsyncStorage.getItem("sello_remember_me");
        if (savedRemember === "true") {
          const savedId = await AsyncStorage.getItem("sello_saved_identifier");
          const savedPw = await AsyncStorage.getItem("sello_saved_password");
          if (savedId) setIdentifier(savedId);
          if (savedPw) setPassword(savedPw);
          setRememberMe(true);
        }
      } catch (err) {
        console.warn("Error loading saved credentials:", err);
      }
    };
    loadSavedCredentials();
  }, []);

  const submitLogin = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage("Please enter all required fields.");
      return;
    }

    await runAuthAction(async () => {
      const response = await authService.login({
        identifier: identifier.trim(),
        password,
      });

      // Persist tokens + user to AsyncStorage
      await signIn(response);

      // Lưu lại hoặc xóa thông tin đăng nhập tùy vào rememberMe
      try {
        if (rememberMe) {
          await AsyncStorage.setItem("sello_remember_me", "true");
          await AsyncStorage.setItem("sello_saved_identifier", identifier.trim());
          await AsyncStorage.setItem("sello_saved_password", password);
        } else {
          await AsyncStorage.removeItem("sello_remember_me");
          await AsyncStorage.removeItem("sello_saved_identifier");
          await AsyncStorage.removeItem("sello_saved_password");
        }
      } catch (err) {
        console.warn("Error persisting saved credentials:", err);
      }

      triggerLocalNotification(
        "Đăng nhập thành công 🎉",
        `Chào mừng ${response.user.fullName} quay trở lại với Sello!`
      );

      setSuccessMessage(`Login success: ${response.user.fullName}`);
      const normalizedRole = response.user.role?.trim().toLowerCase();
      const redirectPath =
        normalizedRole === "admin"
          ? ("/admin/dashboard" as Href)
          : ("/main/home" as Href);

      setTimeout(() => {
        router.replace(redirectPath);
      }, 350);

      return response;
    });
  };

  const submitGoogleLogin = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    await runAuthAction(async () => {
      const response = await authService.loginWithGoogle();
      await signIn(response);

      setSuccessMessage(`Login success: ${response.user.fullName}`);
      const normalizedRole = response.user.role?.trim().toLowerCase();
      const redirectPath =
        normalizedRole === "admin"
          ? ("/admin/dashboard" as Href)
          : ("/main/home" as Href);

      setTimeout(() => {
        router.replace(redirectPath);
      }, 350);

      return response;
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fd]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-8 pt-8"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center">
            <SelloAuthLogo />
            <Text className="mt-8 text-center text-[36px] font-extrabold text-[#191c1f]">
              Welcome back
            </Text>
            <Text className="mt-3 text-center text-[16px] leading-[24px] text-[#3f4850]">
              Sign in to continue your Sello shopping journey.
            </Text>
          </View>

          <View className="mt-10 gap-4">
            <View>
              <Text className="mb-2 ml-1 text-[14px] font-medium text-[#3f4850]">
                Email or phone
              </Text>
              <View className="h-[52px] flex-row items-center rounded-[12px] border border-[#d9dadf] bg-white px-4">
                <Feather name="mail" size={18} color="#6b7682" />
                <TextInput
                  className="ml-3 flex-1 text-[16px] text-[#191c1f]"
                  placeholder="example@gmail.com"
                  placeholderTextColor="#97a0aa"
                  autoCapitalize="none"
                  value={identifier}
                  onChangeText={setIdentifier}
                />
              </View>
            </View>

            <View>
              <View className="mb-2 flex-row items-center justify-between px-1">
                <Text className="text-[14px] font-medium text-[#3f4850]">Password</Text>
                <Pressable onPress={() => router.push("/auth/forgot-password" as Href)}>
                  <Text className="text-[14px] font-semibold text-[#157bb8]">Forgot?</Text>
                </Pressable>
              </View>
              <View className="h-[52px] flex-row items-center rounded-[12px] border border-[#d9dadf] bg-white px-4">
                <Feather name="lock" size={18} color="#6b7682" />
                <TextInput
                  className="ml-3 flex-1 text-[16px] text-[#191c1f]"
                  placeholder="Enter password"
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
            </View>

            {/* Remember Me Checkbox */}
            <Pressable
              onPress={() => setRememberMe((prev) => !prev)}
              className="mt-1 flex-row items-center gap-2.5 px-1 py-1 active:opacity-75"
            >
              <View
                className={`h-5 w-5 items-center justify-center rounded-[6px] border ${
                  rememberMe ? "border-[#157bb8] bg-[#157bb8]" : "border-[#d9dadf] bg-white"
                }`}
              >
                {rememberMe && <Feather name="check" size={12} color="white" />}
              </View>
              <Text className="text-[14px] font-semibold text-[#3f4850]">Ghi nhớ đăng nhập</Text>
            </Pressable>

            <AuthMessage kind="error" text={errorMessage} />
            <AuthMessage kind="success" text={successMessage} />

            <AuthButton
              title="Sign in"
              loading={loading}
              className="mt-1 shadow-[0px_10px_18px_rgba(21,123,184,0.28)]"
              onPress={submitLogin}
            />
          </View>

          <SocialAuthOptions
            onGooglePress={submitGoogleLogin}
            onApplePress={() => setErrorMessage("Apple login will be added later.")}
          />

          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-[14px] text-[#3f4850]">No account yet?</Text>
            <Pressable onPress={() => router.push("/auth/register" as Href)}>
              <Text className="text-[14px] font-semibold text-[#157bb8]">Create one</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
