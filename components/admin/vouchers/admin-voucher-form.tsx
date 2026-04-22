import { AdminVoucher } from "@/types/admin";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";

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

  return (
    <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24" showsVerticalScrollIndicator={false}>
      <View className="rounded-[16px] bg-white p-4">
        <Text className="text-[14px] font-bold text-[#111827]">Ma voucher</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" value={code} onChangeText={setCode} placeholder="SUMMER50" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Ten voucher</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" value={name} onChangeText={setName} placeholder="Giam gia mua he" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Loai voucher</Text>
        <View className="mt-2 flex-row gap-2">
          {(["product", "shipping", "cashback"] as const).map((item) => (
            <Pressable key={item} onPress={() => setVoucherType(item)} className={`flex-1 h-10 items-center justify-center rounded-[10px] ${voucherType === item ? "bg-[#2F95D2]" : "bg-[#EEF2F7]"}`}>
              <Text className={`text-[12px] font-bold ${voucherType === item ? "text-white" : "text-[#334155]"}`}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Loai giam</Text>
        <View className="mt-2 flex-row gap-2">
          {(["fixed", "percent"] as const).map((item) => (
            <Pressable key={item} onPress={() => setDiscountType(item)} className={`flex-1 h-10 items-center justify-center rounded-[10px] ${discountType === item ? "bg-[#2F95D2]" : "bg-[#EEF2F7]"}`}>
              <Text className={`text-[12px] font-bold ${discountType === item ? "text-white" : "text-[#334155]"}`}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Muc giam</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" keyboardType="numeric" value={discountValue} onChangeText={(v) => setDiscountValue(onlyDigits(v))} placeholder="50000" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Giam toi da (tuy chon)</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" keyboardType="numeric" value={maxDiscountValue} onChangeText={(v) => setMaxDiscountValue(onlyDigits(v))} placeholder="100000" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Don toi thieu</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" keyboardType="numeric" value={minOrderValue} onChangeText={(v) => setMinOrderValue(onlyDigits(v))} placeholder="0" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Gioi han su dung</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" keyboardType="numeric" value={usageLimit} onChangeText={(v) => setUsageLimit(onlyDigits(v))} placeholder="100" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Bat dau (ISO datetime)</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" value={startAt} onChangeText={setStartAt} placeholder="2026-04-21T00:00:00.000Z" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Ket thuc (ISO datetime)</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" value={endAt} onChangeText={setEndAt} placeholder="2026-05-21T00:00:00.000Z" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Mo ta</Text>
        <TextInput className="mt-2 min-h-[92px] rounded-[12px] bg-[#F3F5FA] px-3 py-3" multiline value={description} onChangeText={setDescription} placeholder="Chi tiet dieu kien su dung" />

        <View className="mt-4 flex-row items-center justify-between rounded-[12px] bg-[#F8FAFC] px-3 py-3">
          <Text className="text-[14px] font-semibold text-[#111827]">Kich hoat</Text>
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
        <Text className="text-[15px] font-bold text-white">Luu voucher</Text>
      </Pressable>
    </ScrollView>
  );
}
