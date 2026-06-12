import "../global.css";
import { useEffect, useRef } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, router, Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { Alert } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { SettingsProvider, useSettings } from "@/contexts/settings-context";
import { SelloToast } from "@/components/ui";
import { notificationStore } from "@/utils/notification-store";
import { notificationService } from "@/services/customer.service";
import { adminService } from "@/services/admin.service";

import { cssInterop } from "nativewind";
import { Image as ExpoImage } from "expo-image";

// Register expo-image globally with NativeWind to support Tailwind class names
cssInterop(ExpoImage, { className: "style" });

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
  const { showToast } = useSettings();
  
  const seenIds = useRef<Set<number>>(new Set());
  const isFirstLoad = useRef(true);
  const activeToken = useRef<string | null>(null);

  // Lắng nghe sự kiện click vào thông báo để chuyển trang
  useEffect(() => {
    if (isExpoGo || !Notifications) return;

    const subscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const data = response.notification.request.content.data;
      if (data && data.url) {
        setTimeout(() => {
          router.push(data.url as Href);
        }, 500);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

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
                  showToast(
                    item.title,
                    item.content || "Bạn có thông báo mới từ Sello!",
                    "info"
                  );
                } else {
                  try {
                    let url = "/main/home";
                    if (item.notificationType === "order") {
                      url = "/main/orders";
                    }

                    await Notifications.scheduleNotificationAsync({
                      content: {
                        title: item.title,
                        body: item.content || "You have a new notification from Sello!",
                        sound: true,
                        badge: unreadCount,
                        data: { url },
                      },
                      trigger: null,
                    });
                  } catch (e) {
                    console.warn("expo-notifications fallback activated:", e);
                    showToast(
                      item.title,
                      item.content || "Bạn có thông báo mới từ Sello!",
                      "info"
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
                  showToast(
                    item.title,
                    item.content || "Bạn có thông báo mới!",
                    "info"
                  );
                } else {
                  try {
                    let url = "/admin/orders";

                    await Notifications.scheduleNotificationAsync({
                      content: {
                        title: item.title,
                        body: item.content || "You have a new notification!",
                        sound: true,
                        badge: unreadCount,
                        data: { url },
                      },
                      trigger: null,
                    });
                  } catch (e) {
                    console.warn("expo-notifications fallback activated for Admin:", e);
                    showToast(
                      item.title,
                      item.content || "Bạn có thông báo mới!",
                      "info"
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
      <SelloToast />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <RootLayoutInner />
      </SettingsProvider>
    </AuthProvider>
  );
}

