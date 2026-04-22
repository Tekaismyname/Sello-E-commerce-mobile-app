import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type AdminOrderActionsProps = {
  onExport: () => void;
  onCreate: () => void;
  disableExport?: boolean;
  disableCreate?: boolean;
};

export function AdminOrderActions({ onExport, onCreate, disableExport, disableCreate }: AdminOrderActionsProps) {
  return (
    <View className="mt-4 flex-row gap-3">
      <Pressable
        onPress={onExport}
        disabled={disableExport}
        className="flex-1 h-[56px] rounded-[12px] bg-[#E8EDF3] flex-row items-center justify-center disabled:opacity-50"
      >
        <Feather name="download" size={17} color="#0369A1" />
        <Text className="ml-2 text-[16px] font-bold text-[#0369A1]">Xuat bao cao</Text>
      </Pressable>

      <Pressable
        onPress={onCreate}
        disabled={disableCreate}
        className="flex-1 h-[56px] rounded-[12px] bg-[#2F95D2] flex-row items-center justify-center disabled:opacity-50"
      >
        <Feather name="plus" size={17} color="white" />
        <Text className="ml-2 text-[16px] font-bold text-white">Tao don moi</Text>
      </Pressable>
    </View>
  );
}
