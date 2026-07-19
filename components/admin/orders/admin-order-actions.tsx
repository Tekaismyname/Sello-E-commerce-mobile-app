import { Feather } from "@expo/vector-icons";
import { Alert, Pressable, Text, View } from "react-native";

type AdminOrderActionsProps = {
  onExport: () => void;
  onCreate: () => void;
  disableExport?: boolean;
  disableCreate?: boolean;
};

export function AdminOrderActions({
  onExport,
  onCreate,
  disableExport,
  disableCreate,
}: AdminOrderActionsProps) {
  const handleExportPress = () => {
    if (disableExport) {
      Alert.alert(
        "No Permission",
        "Your account does not have permission to export reports."
      );
    } else {
      onExport();
    }
  };

  const handleCreatePress = () => {
    if (disableCreate) {
      Alert.alert(
        "No Permission",
        "Your account does not have permission to create orders."
      );
    } else {
      onCreate();
    }
  };

  return (
    <View className="mt-4 flex-row gap-3">
      <Pressable
        onPress={handleExportPress}
        className={`flex-1 h-[56px] rounded-[12px] bg-[#E8EDF3] flex-row items-center justify-center ${
          disableExport ? "opacity-50" : ""
        }`}
      >
        <Feather name="download" size={17} color="#0369A1" />
        <Text className="ml-2 text-[16px] font-bold text-[#0369A1]">Export Report</Text>
      </Pressable>

      <Pressable
        onPress={handleCreatePress}
        className={`flex-1 h-[56px] rounded-[12px] bg-[#2F95D2] flex-row items-center justify-center ${
          disableCreate ? "opacity-50" : ""
        }`}
      >
        <Feather name="plus" size={17} color="white" />
        <Text className="ml-2 text-[16px] font-bold text-white">Create New Order</Text>
      </Pressable>
    </View>
  );
}
