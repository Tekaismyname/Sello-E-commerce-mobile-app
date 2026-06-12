import React, { useEffect, useRef, useCallback } from "react";
import { Animated, Pressable, Text, View, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSettings, ToastType } from "@/contexts/settings-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function SelloToast() {
  const { toast, hideToast } = useSettings();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideToast();
    });
  }, [slideAnim, opacityAnim, hideToast]);

  useEffect(() => {
    if (toast.visible) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Animate In
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: insets.top + 10,
          useNativeDriver: true,
          tension: 65,
          friction: 9,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Set Auto Close Timeout
      timeoutRef.current = setTimeout(() => {
        handleDismiss();
      }, 4000);
    } else {
      // Animate Out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -150,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [toast.visible, insets.top, opacityAnim, slideAnim, handleDismiss]);

  if (!toast.visible) {
    return null;
  }

  // Define Colors and Icons based on ToastType
  const getToastConfig = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          bgColor: "#ECFDF5",
          borderColor: "#10B981",
          iconColor: "#059669",
          iconName: "check-circle" as const,
        };
      case "error":
        return {
          bgColor: "#FEF2F2",
          borderColor: "#EF4444",
          iconColor: "#DC2626",
          iconName: "alert-circle" as const,
        };
      case "warning":
        return {
          bgColor: "#FFFBEB",
          borderColor: "#F59E0B",
          iconColor: "#D97706",
          iconName: "alert-triangle" as const,
        };
      case "info":
      default:
        return {
          bgColor: "#EFF6FF",
          borderColor: "#3B82F6",
          iconColor: "#2563EB",
          iconName: "info" as const,
        };
    }
  };

  const { bgColor, borderColor, iconColor, iconName } = getToastConfig(toast.type);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          backgroundColor: bgColor,
          borderLeftColor: borderColor,
        },
      ]}
    >
      <Pressable onPress={handleDismiss} className="flex-row items-start justify-between w-full">
        <View className="flex-1 flex-row items-start pr-3">
          <View className="mr-3 mt-0.5">
            <Feather name={iconName} size={22} color={iconColor} />
          </View>
          <View className="flex-1">
            {toast.title ? (
              <Text className="text-[15px] font-extrabold text-[#1F2937] mb-0.5">
                {toast.title}
              </Text>
            ) : null}
            <Text className="text-[13px] font-semibold text-[#4B5563] leading-4">
              {toast.message}
            </Text>
          </View>
        </View>
        <Feather name="x" size={16} color="#9CA3AF" className="mt-0.5" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
