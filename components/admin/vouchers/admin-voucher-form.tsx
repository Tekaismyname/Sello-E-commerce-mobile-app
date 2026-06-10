import { AdminVoucher } from "@/types/admin";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View, Platform, ActivityIndicator } from "react-native";
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

const parseSafeDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  const clean = dateStr.trim();
  if (!clean) return null;
  // Try standard parsing
  const d = new Date(clean);
  if (!Number.isNaN(d.getTime())) return d;
  // Try T separator replacement
  const tStr = clean.replace(" ", "T");
  const dT = new Date(tStr);
  if (!Number.isNaN(dT.getTime())) return dT;
  // Manual match for Hermes/strict JSE engines
  const match = clean.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/);
  if (match) {
    const [, y, m, day, h = "0", min = "0", s = "0"] = match;
    const parsed = new Date(Number(y), Number(m) - 1, Number(day), Number(h), Number(min), Number(s));
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
};

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

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const voucherTypeLabel: Record<"product" | "shipping" | "cashback", string> = {
    product: "Products",
    shipping: "Shipping",
    cashback: "Refund",
  };
  const discountTypeLabel: Record<"fixed" | "percent", string> = {
    fixed: "Fixed",
    percent: "Percent",
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
    setErrors({});
  }, [initialValue]);

  // Clean error when typing
  const handleTextChange = (field: string, val: string, setter: (v: string) => void) => {
    setter(val);
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const formatDateLabel = (isoString?: string | null, isEnd = false) => {
    if (!isoString) return isEnd ? "Unlimited" : "Start immediately";
    const d = parseSafeDate(isoString);
    if (!d) return isEnd ? "Unlimited" : "Start immediately";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const onStartChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartAt(selectedDate.toISOString());
      if (errors.startAt) {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.startAt;
          return copy;
        });
      }
    }
  };

  const onEndChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndAt(selectedDate.toISOString());
      if (errors.endAt) {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.endAt;
          return copy;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!code.trim()) {
      newErrors.code = "Voucher code is required";
    } else if (/\s/.test(code)) {
      newErrors.code = "Voucher code cannot contain spaces";
    }

    if (!name.trim()) {
      newErrors.name = "Voucher name is required";
    }

    const val = Number(discountValue);
    if (Number.isNaN(val) || val <= 0) {
      newErrors.discountValue = "Must be greater than 0";
    } else if (discountType === "percent" && val > 100) {
      newErrors.discountValue = "Cannot exceed 100%";
    }

    if (maxDiscountValue) {
      const maxVal = Number(maxDiscountValue);
      if (Number.isNaN(maxVal) || maxVal < 0) {
        newErrors.maxDiscountValue = "Cannot be negative";
      }
    }

    if (minOrderValue) {
      const minVal = Number(minOrderValue);
      if (Number.isNaN(minVal) || minVal < 0) {
        newErrors.minOrderValue = "Cannot be negative";
      }
    }

    if (usageLimit) {
      const limitVal = Number(usageLimit);
      if (Number.isNaN(limitVal) || limitVal < 0) {
        newErrors.usageLimit = "Cannot be negative";
      }
    }

    if (startAt && endAt) {
      const startDate = parseSafeDate(startAt);
      const endDate = parseSafeDate(endAt);
      if (startDate && endDate && endDate <= startDate) {
        newErrors.endAt = "Must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const formatDbDate = (isoStr: string | null | undefined) => {
      if (!isoStr) return null;
      const d = parseSafeDate(isoStr);
      if (!d) return null;
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    await onSubmit({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim() || null,
      voucherType,
      discountType,
      discountValue: Number(discountValue || "0"),
      maxDiscountValue: maxDiscountValue ? Number(maxDiscountValue) : null,
      minOrderValue: Number(minOrderValue || "0"),
      usageLimit: Number(usageLimit || "0"),
      startAt: startAt ? formatDbDate(startAt) : null,
      endAt: endAt ? formatDbDate(endAt) : null,
      isActive,
    });
  };

  return (
    <ScrollView className="flex-1 bg-[#F8F9FB]" contentContainerClassName="p-4 pb-24" showsVerticalScrollIndicator={false}>
      
      {/* Section 1: General Info */}
      <View className="mb-4 rounded-[16px] border border-[#F2F3F7] bg-white p-5 shadow-sm">
        <Text className="text-[13px] font-bold text-[#191C1F] uppercase tracking-[0.6px] mb-4">Voucher General Info</Text>
        
        <View className="gap-4">
          <View>
            <Text className="text-[12px] font-bold text-[#4B5563]">Voucher Code *</Text>
            <View className={`mt-2 flex-row items-center h-12 rounded-[12px] border bg-white px-3 ${
              errors.code ? "border-red-500 bg-red-50/10" : focusedField === "code" ? "border-[#006397]" : "border-[#E7E8EC]"
            }`}>
              <Feather name="tag" size={16} color={errors.code ? "#EF4444" : focusedField === "code" ? "#006397" : "#9CA3AF"} />
              <TextInput
                className="flex-1 ml-2 text-[14px] text-[#191C1F] h-full"
                value={code}
                onChangeText={(v) => handleTextChange("code", v.toUpperCase(), setCode)}
                placeholder="SUMMER50"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                onFocus={() => setFocusedField("code")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {errors.code && <Text className="mt-1 text-[11px] font-medium text-red-500">{errors.code}</Text>}
          </View>

          <View>
            <Text className="text-[12px] font-bold text-[#4B5563]">Voucher Name *</Text>
            <View className={`mt-2 flex-row items-center h-12 rounded-[12px] border bg-white px-3 ${
              errors.name ? "border-red-500 bg-red-50/10" : focusedField === "name" ? "border-[#006397]" : "border-[#E7E8EC]"
            }`}>
              <Feather name="edit-3" size={16} color={errors.name ? "#EF4444" : focusedField === "name" ? "#006397" : "#9CA3AF"} />
              <TextInput
                className="flex-1 ml-2 text-[14px] text-[#191C1F] h-full"
                value={name}
                onChangeText={(v) => handleTextChange("name", v, setName)}
                placeholder="Summer Promotion"
                placeholderTextColor="#9CA3AF"
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {errors.name && <Text className="mt-1 text-[11px] font-medium text-red-500">{errors.name}</Text>}
          </View>
        </View>
      </View>

      {/* Section 2: Discount settings */}
      <View className="mb-4 rounded-[16px] border border-[#F2F3F7] bg-white p-5 shadow-sm">
        <Text className="text-[13px] font-bold text-[#191C1F] uppercase tracking-[0.6px] mb-4">Discount Rules</Text>

        <Text className="text-[12px] font-bold text-[#4B5563]">Voucher Type</Text>
        <View className="mt-2 flex-row gap-1 mb-4 bg-[#F2F4F7] p-1 rounded-[12px]">
          {(["product", "shipping", "cashback"] as const).map((item) => {
            const isSelected = voucherType === item;
            const iconName = item === "product" ? "box" : item === "shipping" ? "truck" : "repeat";
            return (
              <Pressable
                key={item}
                onPress={() => setVoucherType(item)}
                className={`flex-1 flex-row h-9 items-center justify-center rounded-[10px] gap-1 ${
                  isSelected ? "bg-white shadow-sm" : "bg-transparent"
                }`}
              >
                <Feather name={iconName} size={13} color={isSelected ? "#006397" : "#6B7280"} />
                <Text className={`text-[12px] font-bold ${isSelected ? "text-[#006397]" : "text-[#6B7280]"}`}>
                  {voucherTypeLabel[item]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="text-[12px] font-bold text-[#4B5563]">Discount Type</Text>
        <View className="mt-2 flex-row gap-1 mb-4 bg-[#F2F4F7] p-1 rounded-[12px]">
          {(["fixed", "percent"] as const).map((item) => {
            const isSelected = discountType === item;
            const iconName = item === "fixed" ? "dollar-sign" : "percent";
            return (
              <Pressable
                key={item}
                onPress={() => {
                  setDiscountType(item);
                  setDiscountValue("0");
                }}
                className={`flex-1 flex-row h-9 items-center justify-center rounded-[10px] gap-1 ${
                  isSelected ? "bg-white shadow-sm" : "bg-transparent"
                }`}
              >
                <Feather name={iconName} size={13} color={isSelected ? "#006397" : "#6B7280"} />
                <Text className={`text-[12px] font-bold ${isSelected ? "text-[#006397]" : "text-[#6B7280]"}`}>
                  {discountTypeLabel[item]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-[12px] font-bold text-[#4B5563]">Discount Value *</Text>
            <View className={`mt-2 flex-row items-center h-12 rounded-[12px] border bg-white px-3 ${
              errors.discountValue ? "border-red-500 bg-red-50/10" : focusedField === "discountValue" ? "border-[#006397]" : "border-[#E7E8EC]"
            }`}>
              <Feather 
                name={discountType === "fixed" ? "dollar-sign" : "percent"} 
                size={16} 
                color={errors.discountValue ? "#EF4444" : focusedField === "discountValue" ? "#006397" : "#9CA3AF"} 
              />
              <TextInput
                className="flex-1 ml-2 text-[14px] text-[#191C1F] h-full font-semibold"
                keyboardType="numeric"
                value={discountValue}
                onChangeText={(v) => handleTextChange("discountValue", onlyDigits(v), setDiscountValue)}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                onFocus={() => setFocusedField("discountValue")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {errors.discountValue && <Text className="mt-1 text-[11px] font-medium text-red-500">{errors.discountValue}</Text>}
          </View>

          <View className="flex-1">
            <Text className="text-[12px] font-bold text-[#4B5563]">Max Discount</Text>
            <View className={`mt-2 flex-row items-center h-12 rounded-[12px] border bg-white px-3 ${
              errors.maxDiscountValue ? "border-red-500 bg-red-50/10" : focusedField === "maxDiscountValue" ? "border-[#006397]" : "border-[#E7E8EC]"
            }`}>
              <Feather name="arrow-up-circle" size={16} color={errors.maxDiscountValue ? "#EF4444" : focusedField === "maxDiscountValue" ? "#006397" : "#9CA3AF"} />
              <TextInput
                className="flex-1 ml-2 text-[14px] text-[#191C1F] h-full"
                keyboardType="numeric"
                value={maxDiscountValue}
                onChangeText={(v) => handleTextChange("maxDiscountValue", onlyDigits(v), setMaxDiscountValue)}
                placeholder="Unlimited"
                placeholderTextColor="#9CA3AF"
                onFocus={() => setFocusedField("maxDiscountValue")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {errors.maxDiscountValue && <Text className="mt-1 text-[11px] font-medium text-red-500">{errors.maxDiscountValue}</Text>}
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-[12px] font-bold text-[#4B5563]">Min Order Value</Text>
            <View className={`mt-2 flex-row items-center h-12 rounded-[12px] border bg-white px-3 ${
              errors.minOrderValue ? "border-red-500 bg-red-50/10" : focusedField === "minOrderValue" ? "border-[#006397]" : "border-[#E7E8EC]"
            }`}>
              <Feather name="shopping-cart" size={16} color={errors.minOrderValue ? "#EF4444" : focusedField === "minOrderValue" ? "#006397" : "#9CA3AF"} />
              <TextInput
                className="flex-1 ml-2 text-[14px] text-[#191C1F] h-full"
                keyboardType="numeric"
                value={minOrderValue}
                onChangeText={(v) => handleTextChange("minOrderValue", onlyDigits(v), setMinOrderValue)}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                onFocus={() => setFocusedField("minOrderValue")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {errors.minOrderValue && <Text className="mt-1 text-[11px] font-medium text-red-500">{errors.minOrderValue}</Text>}
          </View>

          <View className="flex-1">
            <Text className="text-[12px] font-bold text-[#4B5563]">Usage Limit</Text>
            <View className={`mt-2 flex-row items-center h-12 rounded-[12px] border bg-white px-3 ${
              errors.usageLimit ? "border-red-500 bg-red-50/10" : focusedField === "usageLimit" ? "border-[#006397]" : "border-[#E7E8EC]"
            }`}>
              <Feather name="users" size={16} color={errors.usageLimit ? "#EF4444" : focusedField === "usageLimit" ? "#006397" : "#9CA3AF"} />
              <TextInput
                className="flex-1 ml-2 text-[14px] text-[#191C1F] h-full"
                keyboardType="numeric"
                value={usageLimit}
                onChangeText={(v) => handleTextChange("usageLimit", onlyDigits(v), setUsageLimit)}
                placeholder="100"
                placeholderTextColor="#9CA3AF"
                onFocus={() => setFocusedField("usageLimit")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {errors.usageLimit && <Text className="mt-1 text-[11px] font-medium text-red-500">{errors.usageLimit}</Text>}
          </View>
        </View>
      </View>

      {/* Section 3: Period */}
      <View className="mb-4 rounded-[16px] border border-[#F2F3F7] bg-white p-5 shadow-sm">
        <Text className="text-[13px] font-bold text-[#191C1F] uppercase tracking-[0.6px] mb-4">Validity Period</Text>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-[12px] font-bold text-[#4B5563]">Start Date</Text>
            <Pressable
              onPress={() => setShowStartPicker(true)}
              className={`mt-2 h-12 flex-row items-center justify-between rounded-[12px] border bg-white px-3 active:bg-gray-50 ${
                focusedField === "startAt" ? "border-[#006397]" : "border-[#E7E8EC]"
              }`}
            >
              <View className="flex-row items-center flex-1 mr-1">
                <Feather name="calendar" size={16} color={startAt ? "#006397" : "#9CA3AF"} />
                <Text className={`ml-2 text-[13px] flex-1 ${startAt ? "text-[#191C1F] font-semibold" : "text-[#9CA3AF]"}`} numberOfLines={1}>
                  {formatDateLabel(startAt, false)}
                </Text>
              </View>
              {startAt ? (
                <Pressable onPress={() => setStartAt("")} className="p-1">
                  <Feather name="x" size={14} color="#EF4444" />
                </Pressable>
              ) : null}
            </Pressable>
          </View>
          
          <View className="flex-1">
            <Text className="text-[12px] font-bold text-[#4B5563]">End Date</Text>
            <Pressable
              onPress={() => setShowEndPicker(true)}
              className={`mt-2 h-12 flex-row items-center justify-between rounded-[12px] border bg-white px-3 active:bg-gray-50 ${
                errors.endAt ? "border-red-500 bg-red-50/10" : focusedField === "endAt" ? "border-[#006397]" : "border-[#E7E8EC]"
              }`}
            >
              <View className="flex-row items-center flex-1 mr-1">
                <Feather name="calendar" size={16} color={endAt ? "#006397" : "#9CA3AF"} />
                <Text className={`ml-2 text-[13px] flex-1 ${endAt ? "text-[#191C1F] font-semibold" : "text-[#9CA3AF]"}`} numberOfLines={1}>
                  {formatDateLabel(endAt, true)}
                </Text>
              </View>
              {endAt ? (
                <Pressable onPress={() => setEndAt("")} className="p-1">
                  <Feather name="x" size={14} color="#EF4444" />
                </Pressable>
              ) : null}
            </Pressable>
          </View>
        </View>
        {errors.endAt && <Text className="mt-1 text-[11px] font-medium text-red-500">{errors.endAt}</Text>}

        {showStartPicker && (
          <DateTimePicker
            value={parseSafeDate(startAt) ?? new Date()}
            mode="date"
            display="default"
            onChange={onStartChange}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={parseSafeDate(endAt) ?? new Date()}
            mode="date"
            display="default"
            onChange={onEndChange}
          />
        )}
      </View>

      {/* Section 4: Details & Status */}
      <View className="mb-4 rounded-[16px] border border-[#F2F3F7] bg-white p-5 shadow-sm">
        <Text className="text-[13px] font-bold text-[#191C1F] uppercase tracking-[0.6px] mb-4">Terms & Status</Text>

        <Text className="text-[12px] font-bold text-[#4B5563]">Description</Text>
        <View className={`mt-2 min-h-[90px] rounded-[12px] border bg-white px-3 py-2.5 ${
          focusedField === "description" ? "border-[#006397]" : "border-[#E7E8EC]"
        }`}>
          <TextInput
            className="flex-1 text-[14px] text-[#191C1F]"
            multiline
            value={description}
            onChangeText={setDescription}
            placeholder="Write voucher usage conditions or details..."
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
            onFocus={() => setFocusedField("description")}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        <View className="mt-4 flex-row items-center justify-between rounded-[12px] border border-[#E7E8EC] bg-[#F8F9FA] px-4 py-3">
          <View>
            <Text className="text-[13px] font-bold text-[#191C1F]">Voucher Active Status</Text>
            <Text className="text-[11px] text-[#6B7280] mt-0.5">Toggle to show/hide to customers</Text>
          </View>
          <Switch 
            value={isActive} 
            onValueChange={setIsActive} 
            trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
            thumbColor={isActive ? "#006397" : "#F3F4F6"}
          />
        </View>
      </View>

      {/* Submit Button */}
      <Pressable
        disabled={loading}
        className="mt-2 h-12 flex-row items-center justify-center rounded-[12px] bg-[#006397] disabled:opacity-60 shadow-sm active:opacity-90"
        onPress={handleSave}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
        ) : (
          <Feather name="save" size={16} color="#ffffff" className="mr-2" />
        )}
        <Text className="text-[15px] font-bold text-white ml-2">Save Voucher</Text>
      </Pressable>
    </ScrollView>
  );
}
