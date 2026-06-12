import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, Switch, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSettings, Language, ThemeMode } from "@/contexts/settings-context";

export default function SettingsScreen() {
  const { language, theme, setLanguage, setTheme, t, clearAppCache } = useSettings();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setTheme(mode);
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    await clearAppCache();
    setClearingCache(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f6f8fc]" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center border-b border-[#E7EEF5] bg-white px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="mr-3 h-8 w-8 items-center justify-center rounded-full active:bg-[#f0f2f5]"
        >
          <Feather name="arrow-left" size={20} color="#191C1F" />
        </Pressable>
        <Text className="text-[17px] font-extrabold text-[#191C1F]">
          {t("settings_title", "Cài đặt hệ thống")}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-4">
        {/* Language Section */}
        <View className="rounded-[16px] bg-white p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Feather name="globe" size={16} color="#2d6dff" />
            <Text className="text-[14px] font-extrabold text-[#1F2937]">
              {t("language_label", "Ngôn ngữ")}
            </Text>
          </View>
          
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => handleLanguageChange("vi")}
              className={`flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-[12px] border ${
                language === "vi"
                  ? "bg-[#EAF4FF] border-[#2d6dff]"
                  : "bg-white border-[#E5E7EB]"
              }`}
            >
              <Text className={`text-[13px] font-bold ${language === "vi" ? "text-[#2d6dff]" : "text-[#4B5563]"}`}>
                Tiếng Việt (Có dấu)
              </Text>
              {language === "vi" && <Feather name="check" size={14} color="#2d6dff" />}
            </Pressable>

            <Pressable
              onPress={() => handleLanguageChange("en")}
              className={`flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-[12px] border ${
                language === "en"
                  ? "bg-[#EAF4FF] border-[#2d6dff]"
                  : "bg-white border-[#E5E7EB]"
              }`}
            >
              <Text className={`text-[13px] font-bold ${language === "en" ? "text-[#2d6dff]" : "text-[#4B5563]"}`}>
                English
              </Text>
              {language === "en" && <Feather name="check" size={14} color="#2d6dff" />}
            </Pressable>
          </View>
        </View>

        {/* Theme Section */}
        <View className="rounded-[16px] bg-white p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Feather name="sliders" size={16} color="#2d6dff" />
            <Text className="text-[14px] font-extrabold text-[#1F2937]">
              {t("theme_label", "Giao diện (Theme)")}
            </Text>
          </View>

          <View className="flex-row gap-2">
            {(["light", "dark", "system"] as ThemeMode[]).map((mode) => {
              const label =
                mode === "light"
                  ? t("theme_light", "Sáng")
                  : mode === "dark"
                  ? t("theme_dark", "Tối")
                  : t("theme_system", "Hệ thống");

              const icon =
                mode === "light" ? "sun" : mode === "dark" ? "moon" : "monitor";

              const isSelected = theme === mode;

              return (
                <Pressable
                  key={mode}
                  onPress={() => handleThemeChange(mode)}
                  className={`flex-1 flex-col items-center gap-1.5 py-3 rounded-[12px] border ${
                    isSelected
                      ? "bg-[#EAF4FF] border-[#2d6dff]"
                      : "bg-white border-[#E5E7EB]"
                  }`}
                >
                  <Feather
                    name={icon as any}
                    size={16}
                    color={isSelected ? "#2d6dff" : "#4B5563"}
                  />
                  <Text className={`text-[12px] font-bold ${isSelected ? "text-[#2d6dff]" : "text-[#4B5563]"}`}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Notifications Section */}
        <View className="rounded-[16px] bg-white p-4 gap-4">
          <View className="flex-row items-center gap-2">
            <Feather name="bell" size={16} color="#2d6dff" />
            <Text className="text-[14px] font-extrabold text-[#1F2937]">
              {t("notification_settings", "Cài đặt thông báo")}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-[13px] font-bold text-[#374151]">
                {t("push_notifications", "Thông báo đẩy")}
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: "#E5E7EB", true: "#93C5FD" }}
              thumbColor={pushEnabled ? "#2d6dff" : "#F3F4F6"}
            />
          </View>

          <View className="flex-row items-center justify-between border-t border-[#F3F4F6] pt-3">
            <View className="flex-1">
              <Text className="text-[13px] font-bold text-[#374151]">
                {t("email_notifications", "Thông báo Email")}
              </Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: "#E5E7EB", true: "#93C5FD" }}
              thumbColor={emailEnabled ? "#2d6dff" : "#F3F4F6"}
            />
          </View>
        </View>

        {/* Security / Biometrics Section */}
        <View className="rounded-[16px] bg-white p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-2">
              <Feather name="shield" size={16} color="#2d6dff" />
              <Text className="text-[13px] font-bold text-[#374151]">
                {t("biometric_login", "Đăng nhập bằng vân tay/khuôn mặt")}
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: "#E5E7EB", true: "#93C5FD" }}
              thumbColor={biometricsEnabled ? "#2d6dff" : "#F3F4F6"}
            />
          </View>
        </View>

        {/* Utilities */}
        <View className="rounded-[16px] bg-white p-4 gap-3">
          <View className="flex-row items-center gap-2">
            <Feather name="tool" size={16} color="#2d6dff" />
            <Text className="text-[14px] font-extrabold text-[#1F2937]">
              {t("clear_cache", "Xóa bộ nhớ đệm")}
            </Text>
          </View>
          <Text className="text-[12px] text-[#6B7280]">
            {t("clear_cache_desc", "Xóa dữ liệu tạm thời để giải phóng dung lượng ứng dụng.")}
          </Text>
          <Pressable
            onPress={handleClearCache}
            disabled={clearingCache}
            className="flex-row items-center justify-center gap-2 bg-[#F3F4F6] active:bg-[#E5E7EB] py-3 rounded-[12px]"
          >
            {clearingCache ? (
              <ActivityIndicator size="small" color="#4B5563" />
            ) : (
              <>
                <Feather name="trash-2" size={15} color="#4B5563" />
                <Text className="text-[13px] font-bold text-[#4B5563]">
                  {t("clear_cache", "Xóa bộ nhớ đệm")}
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Version Info */}
        <View className="items-center py-4">
          <Text className="text-[11px] font-semibold text-[#9CA3AF]">
            {t("app_version", "Phiên bản ứng dụng")} v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
