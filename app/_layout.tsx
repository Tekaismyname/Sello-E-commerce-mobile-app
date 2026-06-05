import "../global.css";
import { useEffect, useRef } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { Alert } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { notificationStore } from "@/utils/notification-store";
import { notificationService } from "@/services/customer.service";
import { adminService } from "@/services/admin.service";

// Detect if running inside Expo Go client to avoid native remote notification errors
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Dynamically load expo-notifications only if NOT in Expo Go to prevent bundle-time crashes
let Notifications: any = null;
if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch (e) {
    console.warn("Failed to load expo-notifications dynamically:", e);
  }
}

// Configure how notifications are displayed when the app is in the foreground
if (!isExpoGo && Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (e) {
    console.warn("Failed to set notification handler:", e);
  }
}

function RootLayoutInner() {
  const colorScheme = useColorScheme();
  const { token, user } = useAuth();
  
  const seenIds = useRef<Set<number>>(new Set());
  const isFirstLoad = useRef(true);
  const activeToken = useRef<string | null>(null);

  // Request notifications permissions on mount (skip in Expo Go)
  useEffect(() => {
    if (isExpoGo) return;

    async function requestPermissions() {
      try {
        const settings = (await Notifications.getPermissionsAsync()) as any;
        let isGranted = settings.granted || settings.status === "granted";
        if (!isGranted) {
          const permission = (await Notifications.requestPermissionsAsync()) as any;
          isGranted = permission.granted || permission.status === "granted";
        }
        if (!isGranted) {
          console.warn("Notification permissions not granted!");
        }
      } catch (err) {
        console.warn("Failed to request notification permissions:", err);
      }
    }
    requestPermissions();
  }, []);

  // Poll for notifications in the background
  useEffect(() => {
    if (!token || !user) {
      seenIds.current.clear();
      isFirstLoad.current = true;
      activeToken.current = null;
      notificationStore.setCustomerCount(0);
      notificationStore.setAdminCount(0);
      return;
    }

    activeToken.current = token;
    const isCustomer = user.role !== "admin";

    async function pollNotifications() {
      if (!token || activeToken.current !== token) return;

      try {
        if (isCustomer) {
          const response = await notificationService.getNotifications(token);
          const unreadCount = response.data.filter((n) => !n.isRead).length;
          notificationStore.setCustomerCount(unreadCount);

          // Detect new unread notifications
          const newItems = response.data.filter((n) => !seenIds.current.has(n.id));

          if (isFirstLoad.current) {
            response.data.forEach((n) => seenIds.current.add(n.id));
            isFirstLoad.current = false;
          } else if (newItems.length > 0) {
            for (const item of newItems) {
              seenIds.current.add(item.id);
              if (!item.isRead) {
                if (isExpoGo) {
                  // Direct in-app alert fallback for Expo Go to completely bypass native notifications module
                  Alert.alert(
                    item.title,
                    item.content || "Bạn có thông báo mới từ Sello!"
                  );
                } else {
                  try {
                    await Notifications.scheduleNotificationAsync({
                      content: {
                        title: item.title,
                        body: item.content || "Bạn có thông báo mới từ Sello!",
                        sound: true,
                        badge: unreadCount,
                      },
                      trigger: null,
                    });
                  } catch (e) {
                    console.warn("expo-notifications fallback activated:", e);
                    Alert.alert(
                      item.title,
                      item.content || "Bạn có thông báo mới từ Sello!"
                    );
                  }
                }
              }
            }
          }
        } else {
          // Admin view: Poll personal notifications (e.g. customer contact requests) instead of system-wide list
          const response = await notificationService.getNotifications(token);
          const unreadCount = response.data.filter((n) => !n.isRead).length;
          notificationStore.setAdminCount(unreadCount);

          const newItems = response.data.filter((n) => !seenIds.current.has(n.id));

          if (isFirstLoad.current) {
            response.data.forEach((n) => seenIds.current.add(n.id));
            isFirstLoad.current = false;
          } else if (newItems.length > 0) {
            for (const item of newItems) {
              seenIds.current.add(item.id);
              if (!item.isRead) {
                if (isExpoGo) {
                  // Direct in-app alert fallback for Admin in Expo Go
                  Alert.alert(
                    item.title,
                    item.content || "Bạn có thông báo mới!"
                  );
                } else {
                  try {
                    await Notifications.scheduleNotificationAsync({
                      content: {
                        title: item.title,
                        body: item.content || "Bạn có thông báo mới!",
                        sound: true,
                        badge: unreadCount,
                      },
                      trigger: null,
                    });
                  } catch (e) {
                    console.warn("expo-notifications fallback activated for Admin:", e);
                    Alert.alert(
                      item.title,
                      item.content || "Bạn có thông báo mới!"
                    );
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn("Error polling notifications:", err);
      }
    }

    // Run poll initially
    pollNotifications();

    // Setup interval polling (every 12 seconds)
    const interval = setInterval(pollNotifications, 12000);

    return () => {
      clearInterval(interval);
    };
  }, [token, user]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  );
}

