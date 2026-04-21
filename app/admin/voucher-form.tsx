import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/services/admin.service";
import { AdminVoucher } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const onlyNumber = (value: string) => Number(value.replace(/[^0-9]/g, "") || "0");
const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

type DateField = "start" | "end";

const toDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateInput = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) return null;
  return parsed;
};

const formatDateLabel = (value: string) => {
  const parsed = parseDateInput(value);
  return parsed ? parsed.toLocaleDateString("vi-VN") : "Chon ngay";
};

export default function AdminVoucherFormScreen() {
  const { id } = useLocalSearchParams();
  const editingId = Number(Array.isArray(id) ? id[0] : id);
  const isEditing = Number.isFinite(editingId) && editingId > 0;
  const { token, user } = useAuth();
  const permissions = user?.permissions ?? [];
  const canSave = permissions.includes(isEditing ? "vouchers:update" : "vouchers:create");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [voucherType, setVoucherType] = useState<AdminVoucher["voucherType"]>("product");
  const [discountType, setDiscountType] = useState<AdminVoucher["discountType"]>("percent");
  const [discountValue, setDiscountValue] = useState("10");
  const [maxDiscountValue, setMaxDiscountValue] = useState("50000");
  const [minOrderValue, setMinOrderValue] = useState("0");
  const [usageLimit, setUsageLimit] = useState("100");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [calendarField, setCalendarField] = useState<DateField | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    return [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
  }, [calendarMonth]);

  const openCalendar = (field: DateField) => {
    const selectedDate = parseDateInput(field === "start" ? startAt : endAt);
    setCalendarMonth(selectedDate ?? new Date());
    setCalendarField(field);
  };

  const selectCalendarDate = (day: number) => {
    const selected = toDateInput(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
    if (calendarField === "start") {
      setStartAt(selected);
    }
    if (calendarField === "end") {
      setEndAt(selected);
    }
    setCalendarField(null);
  };

  const fetchVoucher = useCallback(async () => {
    if (!token || !isEditing) return;
    setLoading(true);
    try {
      const response = await adminService.listVouchers(token);
      const voucher = response.data.find((item) => item.id === editingId);
      if (voucher) {
        setCode(voucher.code);
        setName(voucher.name);
        setDescription(voucher.description ?? "");
        setVoucherType(voucher.voucherType);
        setDiscountType(voucher.discountType);
        setDiscountValue(String(voucher.discountValue));
        setMaxDiscountValue(String(voucher.maxDiscountValue ?? ""));
        setMinOrderValue(String(voucher.minOrderValue));
        setUsageLimit(String(voucher.usageLimit));
        setStartAt(voucher.startAt ? voucher.startAt.slice(0, 10) : "");
        setEndAt(voucher.endAt ? voucher.endAt.slice(0, 10) : "");
        setActive(voucher.isActive);
      }
    } catch (nextError: any) {
      Alert.alert("Loi", nextError.message);
    } finally {
      setLoading(false);
    }
  }, [editingId, isEditing, token]);

  useEffect(() => {
    fetchVoucher();
  }, [fetchVoucher]);

  const handleSave = async () => {
    if (!token || !canSave) return;
    if (!code.trim() || !name.trim()) {
      Alert.alert("Thieu thong tin", "Vui long nhap ma va ten voucher.");
      return;
    }
    if (startAt && !parseDateInput(startAt)) {
      Alert.alert("Ngay khong hop le", "Ngay bat dau phai la ngay co that.");
      return;
    }
    if (endAt && !parseDateInput(endAt)) {
      Alert.alert("Ngay khong hop le", "Ngay het han phai la ngay co that.");
      return;
    }
    if (startAt && endAt && parseDateInput(startAt)!.getTime() > parseDateInput(endAt)!.getTime()) {
      Alert.alert("Khoang ngay khong hop le", "Ngay bat dau phai truoc ngay het han.");
      return;
    }
    if (discountType === "percent" && onlyNumber(discountValue) > 100) {
      Alert.alert("Gia tri khong hop le", "Voucher phan tram khong duoc vuot qua 100%.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim() || null,
        voucherType,
        discountType,
        discountValue: onlyNumber(discountValue),
        maxDiscountValue: maxDiscountValue ? onlyNumber(maxDiscountValue) : null,
        minOrderValue: onlyNumber(minOrderValue),
        usageLimit: onlyNumber(usageLimit),
        startAt: startAt ? `${startAt} 00:00:00` : null,
        endAt: endAt ? `${endAt} 23:59:59` : null,
        isActive: active,
      };
      if (isEditing) {
        await adminService.updateVoucher(token, editingId, payload);
      } else {
        await adminService.createVoucher(token, payload);
      }
      Alert.alert("Thanh cong", "Da luu voucher.", [
        { text: "OK", onPress: () => router.replace("/admin/vouchers" as Href) },
      ]);
    } catch (nextError: any) {
      Alert.alert("Loi", nextError.message);
    } finally {
      setSaving(false);
    }
  };

  const renderChoice = <T extends string>(items: T[], value: T, onChange: (value: T) => void) => (
    <View className="mt-2 flex-row gap-2">
      {items.map((item) => {
        const selected = item === value;
        return (
          <Pressable
            key={item}
            onPress={() => onChange(item)}
            className={`flex-1 rounded-[12px] px-3 py-3 ${selected ? "bg-[#0F84C8]" : "bg-[#F3F5F8]"}`}
          >
            <Text className={`text-center text-[12px] font-bold ${selected ? "text-white" : "text-[#30343A]"}`}>
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F6F8FC]" edges={["top", "bottom"]}>
      <View className="flex-row items-center justify-between bg-white px-4 py-3">
        <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center">
          <Feather name="arrow-left" size={20} color="#1F2934" />
        </Pressable>
        <Text className="text-[16px] font-extrabold text-[#0F6CBD]">{isEditing ? "Sua Voucher" : "Tao Voucher Moi"}</Text>
        <View className="h-10 w-10" />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0F6CBD" />
        </View>
      ) : (
        <ScrollView contentContainerClassName="p-4 pb-28">
          <View className="rounded-[16px] bg-white p-4">
            <Text className="text-[15px] font-bold text-[#1F2934]">Thong tin chung</Text>
            <Text className="mt-4 text-[12px] font-bold text-[#30343A]">Ma Voucher</Text>
            <TextInput className="mt-2 h-12 rounded-[10px] bg-[#F3F5F8] px-4" placeholder="VD: SUMMER2024" value={code} onChangeText={setCode} />
            <Text className="mt-4 text-[12px] font-bold text-[#30343A]">Ten Voucher</Text>
            <TextInput className="mt-2 h-12 rounded-[10px] bg-[#F3F5F8] px-4" placeholder="Ten hien thi" value={name} onChangeText={setName} />
            <TextInput className="mt-3 min-h-[76px] rounded-[10px] bg-[#F3F5F8] px-4 py-3" placeholder="Mo ta..." multiline value={description} onChangeText={setDescription} />
            <View className="mt-4 flex-row items-center justify-between">
              <Text className="text-[13px] font-bold text-[#30343A]">Trang thai</Text>
              <Switch value={active} onValueChange={setActive} trackColor={{ true: "#22A06B" }} />
            </View>
          </View>

          <View className="mt-4 rounded-[16px] bg-white p-4">
            <Text className="text-[15px] font-bold text-[#1F2934]">Gia tri giam</Text>
            <Text className="mt-4 text-[12px] font-bold text-[#30343A]">Loai voucher</Text>
            {renderChoice(["product", "shipping", "cashback"] as const, voucherType, setVoucherType)}
            <Text className="mt-4 text-[12px] font-bold text-[#30343A]">Loai giam gia</Text>
            {renderChoice(["percent", "fixed"] as const, discountType, setDiscountType)}
            <TextInput className="mt-3 h-12 rounded-[10px] bg-[#F3F5F8] px-4 text-right" keyboardType="numeric" value={discountValue} onChangeText={setDiscountValue} />
            <Text className="mt-3 text-[12px] font-bold text-[#30343A]">Giam toi da</Text>
            <TextInput className="mt-2 h-12 rounded-[10px] bg-[#F3F5F8] px-4 text-right" keyboardType="numeric" value={maxDiscountValue} onChangeText={setMaxDiscountValue} />
          </View>

          <View className="mt-4 rounded-[16px] bg-white p-4">
            <Text className="text-[15px] font-bold text-[#1F2934]">Dieu kien su dung</Text>
            <Text className="mt-2 text-[12px] leading-5 text-[#6B7280]">
              Voucher chi ap dung khi don hang dat gia tri toi thieu, con luot su dung va nam trong khoang ngay hieu luc.
            </Text>
            <Text className="mt-4 text-[12px] font-bold text-[#30343A]">Gia tri don hang toi thieu</Text>
            <TextInput className="mt-3 h-12 rounded-[10px] bg-[#F3F5F8] px-4 text-right" keyboardType="numeric" placeholder="Gia tri don hang toi thieu" value={minOrderValue} onChangeText={setMinOrderValue} />
            <Text className="mt-2 text-[11px] text-[#7B8494]">Don hang phai co tam tinh bang hoac lon hon gia tri nay.</Text>
            <Text className="mt-4 text-[12px] font-bold text-[#30343A]">Gioi han so lan su dung</Text>
            <TextInput className="mt-3 h-12 rounded-[10px] bg-[#F3F5F8] px-4 text-right" keyboardType="numeric" placeholder="Gioi han so lan su dung" value={usageLimit} onChangeText={setUsageLimit} />
            <Text className="mt-2 text-[11px] text-[#7B8494]">Nhap 0 de khong gioi han so luot su dung.</Text>
            <View className="mt-4 flex-row gap-3">
              <Pressable onPress={() => openCalendar("start")} className="flex-1 rounded-[12px] bg-[#F3F5F8] px-4 py-3">
                <Text className="text-[11px] font-bold text-[#7B8494]">Ngay bat dau</Text>
                <View className="mt-2 flex-row items-center justify-between">
                  <Text className="text-[14px] font-bold text-[#1F2934]">{startAt ? formatDateLabel(startAt) : "Chon ngay"}</Text>
                  <Feather name="calendar" size={17} color="#0F84C8" />
                </View>
              </Pressable>
              <Pressable onPress={() => openCalendar("end")} className="flex-1 rounded-[12px] bg-[#F3F5F8] px-4 py-3">
                <Text className="text-[11px] font-bold text-[#7B8494]">Ngay het han</Text>
                <View className="mt-2 flex-row items-center justify-between">
                  <Text className="text-[14px] font-bold text-[#1F2934]">{endAt ? formatDateLabel(endAt) : "Chon ngay"}</Text>
                  <Feather name="calendar" size={17} color="#0F84C8" />
                </View>
              </Pressable>
            </View>
            <Text className="mt-2 text-[11px] text-[#7B8494]">Voucher chi hop le trong khoang ngay bat dau den ngay het han.</Text>
          </View>
        </ScrollView>
      )}

      <Modal visible={calendarField !== null} transparent animationType="fade" onRequestClose={() => setCalendarField(null)}>
        <View className="flex-1 justify-end bg-black/40 px-4 pb-6">
          <View className="rounded-[22px] bg-white p-4">
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                className="h-10 w-10 items-center justify-center rounded-full bg-[#EEF3F7]"
              >
                <Feather name="chevron-left" size={20} color="#1F2934" />
              </Pressable>
              <Text className="text-[16px] font-extrabold text-[#1F2934]">
                Thang {calendarMonth.getMonth() + 1}/{calendarMonth.getFullYear()}
              </Text>
              <Pressable
                onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                className="h-10 w-10 items-center justify-center rounded-full bg-[#EEF3F7]"
              >
                <Feather name="chevron-right" size={20} color="#1F2934" />
              </Pressable>
            </View>

            <View className="mt-4 flex-row">
              {weekDays.map((day) => (
                <Text key={day} className="flex-1 text-center text-[11px] font-bold text-[#7B8494]">
                  {day}
                </Text>
              ))}
            </View>

            <View className="mt-2 flex-row flex-wrap">
              {calendarDays.map((day, index) => {
                const selectedValue = calendarField === "start" ? startAt : endAt;
                const selected = day
                  ? selectedValue === toDateInput(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day))
                  : false;
                return (
                  <View key={`${day ?? "empty"}-${index}`} className="w-[14.285%] p-1">
                    {day ? (
                      <Pressable
                        onPress={() => selectCalendarDate(day)}
                        className={`h-10 items-center justify-center rounded-full ${selected ? "bg-[#0F84C8]" : "bg-[#F6F8FC]"}`}
                      >
                        <Text className={`font-bold ${selected ? "text-white" : "text-[#30343A]"}`}>{day}</Text>
                      </Pressable>
                    ) : (
                      <View className="h-10" />
                    )}
                  </View>
                );
              })}
            </View>

            <View className="mt-4 flex-row gap-3">
              <Pressable
                onPress={() => {
                  if (calendarField === "start") setStartAt("");
                  if (calendarField === "end") setEndAt("");
                  setCalendarField(null);
                }}
                className="flex-1 items-center rounded-[12px] bg-[#EEF3F7] py-4"
              >
                <Text className="font-bold text-[#30343A]">Xoa ngay</Text>
              </Pressable>
              <Pressable onPress={() => setCalendarField(null)} className="flex-1 items-center rounded-[12px] bg-[#0F84C8] py-4">
                <Text className="font-bold text-white">Dong</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View className="absolute bottom-0 left-0 right-0 flex-row gap-3 bg-white px-4 pb-8 pt-4">
        <Pressable onPress={() => router.back()} className="flex-1 items-center rounded-[12px] bg-[#EEF3F7] py-4">
          <Text className="font-bold text-[#30343A]">Huy</Text>
        </Pressable>
        <Pressable disabled={!canSave || saving} onPress={handleSave} className="flex-1 items-center rounded-[12px] bg-[#0F84C8] py-4">
          <Text className="font-bold text-white">{saving ? "Dang luu..." : "Luu Voucher"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
