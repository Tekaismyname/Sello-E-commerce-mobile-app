import { AdminVoucher } from "@/types/admin";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";

type Props = {
  initialValue?: AdminVoucher | null;
  loading?: boolean;
  onSubmit: (payload: {
    code: string;
    name: string;
    description?: string | null;
    voucherType: "product" | "shipping" | "cashback";
    discountType: "percent" | "fixed";
    discountValue: number;
    maxDiscountValue?: number | null;
    minOrderValue?: number;
    usageLimit?: number;
    startAt?: string | null;
    endAt?: string | null;
    isActive?: boolean;
  }) => Promise<void>;
};

const onlyDigits = (value: string) => value.replace(/[^0-9]/g, "");

export function AdminVoucherForm({ initialValue, loading, onSubmit }: Props) {
  const [code, setCode] = useState(initialValue?.code ?? "");
  const [name, setName] = useState(initialValue?.name ?? "");
  const [description, setDescription] = useState(initialValue?.description ?? "");
  const [voucherType, setVoucherType] = useState<"product" | "shipping" | "cashback">(initialValue?.voucherType ?? "product");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">(initialValue?.discountType ?? "fixed");
  const [discountValue, setDiscountValue] = useState(String(initialValue?.discountValue ?? 0));
  const [maxDiscountValue, setMaxDiscountValue] = useState(initialValue?.maxDiscountValue ? String(initialValue.maxDiscountValue) : "");
  const [minOrderValue, setMinOrderValue] = useState(String(initialValue?.minOrderValue ?? 0));
  const [usageLimit, setUsageLimit] = useState(String(initialValue?.usageLimit ?? 100));
  const [startAt, setStartAt] = useState(initialValue?.startAt ?? "");
  const [endAt, setEndAt] = useState(initialValue?.endAt ?? "");
  const [isActive, setIsActive] = useState(initialValue?.isActive ?? true);

  // Picker modal visible states
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const voucherTypeLabel: Record<"product" | "shipping" | "cashback", string> = {
    product: "Products",
    shipping: "Shipping",
    cashback: "Refund",
  };
  const discountTypeLabel: Record<"fixed" | "percent", string> = {
    fixed: "Fixed Amount",
    percent: "Percentage",
  };

  useEffect(() => {
    setCode(initialValue?.code ?? "");
    setName(initialValue?.name ?? "");
    setDescription(initialValue?.description ?? "");
    setVoucherType(initialValue?.voucherType ?? "product");
    setDiscountType(initialValue?.discountType ?? "fixed");
    setDiscountValue(String(initialValue?.discountValue ?? 0));
    setMaxDiscountValue(initialValue?.maxDiscountValue ? String(initialValue.maxDiscountValue) : "");
    setMinOrderValue(String(initialValue?.minOrderValue ?? 0));
    setUsageLimit(String(initialValue?.usageLimit ?? 100));
    setStartAt(initialValue?.startAt ?? "");
    setEndAt(initialValue?.endAt ?? "");
    setIsActive(initialValue?.isActive ?? true);
  }, [initialValue]);

  // Date Formatting Helper
  const formatDateLabel = (isoString?: string | null, isEnd = false) => {
    if (!isoString) return isEnd ? "Vô thời hạn" : "Bắt đầu ngay lập tức";
    try {
      const d = new Date(isoString);
      if (Number.isNaN(d.getTime())) return isEnd ? "Vô thời hạn" : "Bắt đầu ngay lập tức";
      return d.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isEnd ? "Vô thời hạn" : "Bắt đầu ngay lập tức";
    }
  };

  const onStartChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartAt(selectedDate.toISOString());
    }
  };

  const onEndChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndAt(selectedDate.toISOString());
    }
  };

  return (
    <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24" showsVerticalScrollIndicator={false}>
      <View className="rounded-[16px] bg-white p-4">
        <Text className="text-[14px] font-bold text-[#111827]">Voucher Code</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" value={code} onChangeText={setCode} placeholder="SUMMER50" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Voucher Name</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" value={name} onChangeText={setName} placeholder="Summer Sale" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Voucher Type</Text>
        <View className="mt-2 flex-row gap-2">
          {(["product", "shipping", "cashback"] as const).map((item) => (
            <Pressable key={item} onPress={() => setVoucherType(item)} className={`flex-1 h-10 items-center justify-center rounded-[10px] ${voucherType === item ? "bg-[#2F95D2]" : "bg-[#EEF2F7]"}`}>
              <Text className={`text-[12px] font-bold ${voucherType === item ? "text-white" : "text-[#334155]"}`}>
                {voucherTypeLabel[item]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Discount Type</Text>
        <View className="mt-2 flex-row gap-2">
          {(["fixed", "percent"] as const).map((item) => (
            <Pressable key={item} onPress={() => setDiscountType(item)} className={`flex-1 h-10 items-center justify-center rounded-[10px] ${discountType === item ? "bg-[#2F95D2]" : "bg-[#EEF2F7]"}`}>
              <Text className={`text-[12px] font-bold ${discountType === item ? "text-white" : "text-[#334155]"}`}>
                {discountTypeLabel[item]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Discount Value</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" keyboardType="numeric" value={discountValue} onChangeText={(v) => setDiscountValue(onlyDigits(v))} placeholder="50000" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Max Discount (optional)</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" keyboardType="numeric" value={maxDiscountValue} onChangeText={(v) => setMaxDiscountValue(onlyDigits(v))} placeholder="100000" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Min Order Value</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" keyboardType="numeric" value={minOrderValue} onChangeText={(v) => setMinOrderValue(onlyDigits(v))} placeholder="0" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Usage Limit</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" keyboardType="numeric" value={usageLimit} onChangeText={(v) => setUsageLimit(onlyDigits(v))} placeholder="100" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Ngày bắt đầu</Text>
        <View className="mt-2 flex-row items-center gap-2">
          <Pressable
            onPress={() => setShowStartPicker(true)}
            className="h-12 flex-1 flex-row items-center justify-between rounded-[12px] bg-[#F3F5FA] px-4 active:bg-[#E2E8F0]"
          >
            <Text className={`text-[14px] ${startAt ? "text-[#111827] font-semibold" : "text-[#97A0AB]"}`}>
              {formatDateLabel(startAt, false)}
            </Text>
            <Feather name="calendar" size={16} color="#6B7280" />
          </Pressable>
          {!!startAt && (
            <Pressable
              onPress={() => setStartAt("")}
              className="h-12 w-12 items-center justify-center rounded-[12px] bg-[#FEE2E2] active:bg-[#FCA5A5]"
            >
              <Feather name="trash-2" size={16} color="#EF4444" />
            </Pressable>
          )}
        </View>

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Ngày kết thúc</Text>
        <View className="mt-2 flex-row items-center gap-2">
          <Pressable
            onPress={() => setShowEndPicker(true)}
            className="h-12 flex-1 flex-row items-center justify-between rounded-[12px] bg-[#F3F5FA] px-4 active:bg-[#E2E8F0]"
          >
            <Text className={`text-[14px] ${endAt ? "text-[#111827] font-semibold" : "text-[#97A0AB]"}`}>
              {formatDateLabel(endAt, true)}
            </Text>
            <Feather name="calendar" size={16} color="#6B7280" />
          </Pressable>
          {!!endAt && (
            <Pressable
              onPress={() => setEndAt("")}
              className="h-12 w-12 items-center justify-center rounded-[12px] bg-[#FEE2E2] active:bg-[#FCA5A5]"
            >
              <Feather name="trash-2" size={16} color="#EF4444" />
            </Pressable>
          )}
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startAt ? new Date(startAt) : new Date()}
            mode="date"
            display="default"
            onChange={onStartChange}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endAt ? new Date(endAt) : new Date()}
            mode="date"
            display="default"
            onChange={onEndChange}
          />
        )}

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Description</Text>
        <TextInput className="mt-2 min-h-[92px] rounded-[12px] bg-[#F3F5FA] px-3 py-3" multiline value={description} onChangeText={setDescription} placeholder="Usage Condition Details" />

        <View className="mt-4 flex-row items-center justify-between rounded-[12px] bg-[#F8FAFC] px-3 py-3">
          <Text className="text-[14px] font-semibold text-[#111827]">Active</Text>
          <Switch value={isActive} onValueChange={setIsActive} />
        </View>
      </View>

      <Pressable
        disabled={loading || !code.trim() || !name.trim()}
        className="mt-4 h-12 items-center justify-center rounded-[12px] bg-[#2F95D2] disabled:opacity-60"
        onPress={async () => {
          await onSubmit({
            code: code.trim(),
            name: name.trim(),
            description: description.trim() || null,
            voucherType,
            discountType,
            discountValue: Number(discountValue || "0"),
            maxDiscountValue: maxDiscountValue ? Number(maxDiscountValue) : null,
            minOrderValue: Number(minOrderValue || "0"),
            usageLimit: Number(usageLimit || "0"),
            startAt: startAt.trim() || null,
            endAt: endAt.trim() || null,
            isActive,
          });
        }}
      >
        <Text className="text-[15px] font-bold text-white">Save Voucher</Text>
      </Pressable>
    </ScrollView>
  );
}
