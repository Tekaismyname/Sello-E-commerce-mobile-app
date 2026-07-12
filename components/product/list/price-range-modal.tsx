import { useSettings } from "@/contexts/settings-context";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from "react-native";

type PriceRangeModalProps = {
  visible: boolean;
  initialMin: number | null;
  initialMax: number | null;
  onApply: (min: number | null, max: number | null) => void;
  onClose: () => void;
};

const parsePrice = (value: string): number | null => {
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return null;
  return Number(digits);
};

export function PriceRangeModal({ visible, initialMin, initialMax, onApply, onClose }: PriceRangeModalProps) {
  const { t } = useSettings();
  const [minText, setMinText] = useState("");
  const [maxText, setMaxText] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Re-seed the inputs each time the modal opens with the active range.
  useEffect(() => {
    if (visible) {
      setMinText(initialMin != null ? String(initialMin) : "");
      setMaxText(initialMax != null ? String(initialMax) : "");
      setValidationError(null);
    }
  }, [visible, initialMin, initialMax]);

  const handleApply = () => {
    const min = parsePrice(minText);
    const max = parsePrice(maxText);

    if (min == null && max == null) {
      setValidationError(t("price_range_required", "Enter at least one of min or max price."));
      return;
    }

    if (min != null && max != null && min > max) {
      setValidationError(t("price_range_invalid", "Min price must not exceed max price."));
      return;
    }

    onApply(min, max);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="w-full">
          <View className="rounded-[16px] bg-white p-5">
            <Text className="text-[16px] font-extrabold text-[#191C1F]">
              {t("price_range_title", "Custom price range")}
            </Text>
            <Text className="mt-1 text-[12px] text-[#6b7682]">
              {t("price_range_subtitle", "Amounts in VND. Leave one side empty for an open range.")}
            </Text>

            <View className="mt-4 flex-row items-center gap-3">
              <View className="flex-1">
                <Text className="mb-1 text-[12px] font-bold text-[#3f4a57]">
                  {t("price_range_min", "From")}
                </Text>
                <TextInput
                  value={minText}
                  onChangeText={setMinText}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  className="h-[44px] rounded-[10px] border border-[#dbe1e8] bg-[#f8fafc] px-3 text-[14px] text-[#191C1F]"
                />
              </View>
              <Text className="mt-5 text-[14px] font-bold text-[#8d97a5]">—</Text>
              <View className="flex-1">
                <Text className="mb-1 text-[12px] font-bold text-[#3f4a57]">
                  {t("price_range_max", "To")}
                </Text>
                <TextInput
                  value={maxText}
                  onChangeText={setMaxText}
                  keyboardType="number-pad"
                  placeholder="5000000"
                  placeholderTextColor="#9CA3AF"
                  className="h-[44px] rounded-[10px] border border-[#dbe1e8] bg-[#f8fafc] px-3 text-[14px] text-[#191C1F]"
                />
              </View>
            </View>

            {validationError ? (
              <Text className="mt-3 text-[12px] font-semibold text-[#B91C1C]">{validationError}</Text>
            ) : null}

            <View className="mt-5 flex-row gap-3">
              <Pressable
                onPress={onClose}
                className="h-[44px] flex-1 items-center justify-center rounded-[12px] bg-[#ebeff5] active:opacity-75"
              >
                <Text className="text-[14px] font-bold text-[#3f4a57]">{t("cancel", "Cancel")}</Text>
              </Pressable>
              <Pressable
                onPress={handleApply}
                className="h-[44px] flex-1 items-center justify-center rounded-[12px] bg-[#006397] active:opacity-75"
              >
                <Text className="text-[14px] font-bold text-white">{t("apply", "Apply")}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
