import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthCallbackScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/auth/login");
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fd]">
      <View className="flex-1 items-center justify-center px-6">
        <ActivityIndicator size="large" color="#157bb8" />
        <Text className="mt-4 text-center text-[16px] font-medium text-[#3f4850]">
          Completing Google sign-in...
        </Text>
      </View>
    </SafeAreaView>
  );
}
