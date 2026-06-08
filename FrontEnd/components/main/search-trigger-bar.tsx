import { Feather } from "@expo/vector-icons";
import { UIInput } from "@/components/ui";

type SearchTriggerBarProps = {
  placeholder: string;
  onPress: () => void;
};

export function SearchTriggerBar({ placeholder, onPress }: SearchTriggerBarProps) {
  return (
    <UIInput
      editable={false}
      pointerEvents="none"
      onContainerPress={onPress}
      inputClassName="text-[15px] text-[#8c96a2]"
      inputRowClassName="bg-[#eef1f5]"
      leftSlot={<Feather name="search" size={18} color="#8c96a2" />}
      placeholder={placeholder}
      placeholderTextColor="#8c96a2"
      wrapperClassName="mb-4"
    />
  );
}
