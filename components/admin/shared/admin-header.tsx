import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

export function AdminHeader({ title }: { title?: string }) {
  return (
    <View className="flex-row items-center justify-between bg-white px-4 py-3 shadow-sm z-10">
      <View className="flex-row items-center gap-4">
        <Pressable className="h-10 w-10 items-center justify-center">
          <Feather name="menu" size={24} color="#1a232d" />
        </Pressable>
        {title ? (
          <Text className="text-[20px] font-extrabold text-[#1a232d]">{title}</Text>
        ) : (
          <Text className="text-[24px] font-extrabold text-[#006397] tracking-tight">Sello</Text>
        )}
      </View>
      <View className="flex-row items-center gap-3">
        {title ? (
          <Pressable className="h-10 w-10 items-center justify-center">
            <Feather name="search" size={22} color="#1a232d" />
          </Pressable>
        ) : null}
        <Pressable className="h-10 w-10 items-center justify-center relative">
          <Feather name="bell" size={22} color="#1a232d" />
        </Pressable>
        {!title ? (
          <Pressable className="h-10 w-10 items-center justify-center">
            <Feather name="shopping-bag" size={22} color="#1a232d" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
