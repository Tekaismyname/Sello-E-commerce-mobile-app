import Constants, { ExecutionEnvironment } from "expo-constants";
import { Alert } from "react-native";

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let Notifications: any = null;
if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch (e) {
    console.warn("Failed to load expo-notifications dynamically:", e);
  }
}

export async function triggerLocalNotification(title: string, body: string) {
  if (isExpoGo) {
    // Direct alert for Expo Go
    Alert.alert(title, body);
  } else {
    try {
      if (Notifications) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: true,
          },
          trigger: null,
        });
      } else {
        Alert.alert(title, body);
      }
    } catch (e) {
      console.warn("expo-notifications failed, using Alert fallback:", e);
      Alert.alert(title, body);
    }
  }
}
