import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-2xl font-bold text-[#191c1f]">This is a modal</Text>
      <Link
        href="/"
        dismissTo
        className="mt-4 rounded-[10px] bg-[#157bb8] px-4 py-2 text-white"
      >
        Go to home screen
      </Link>
    </View>
  );
}
