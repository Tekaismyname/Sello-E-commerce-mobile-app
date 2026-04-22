import { AdminVoucher } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

const formatCurrency = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

type Props = {
  voucher: AdminVoucher;
  onEdit?: (voucher: AdminVoucher) => void;
  onToggleStatus?: (voucher: AdminVoucher) => void;
  onDelete?: (voucher: AdminVoucher) => void;
};

export function AdminVoucherCard({ voucher, onEdit, onToggleStatus, onDelete }: Props) {
  const ratio = voucher.usageLimit > 0 ? Math.min(1, voucher.usedCount / voucher.usageLimit) : 0;

  return (
    <View className="rounded-[16px] bg-white p-4">
      <View className="flex-row items-center justify-between">
        <View className={`rounded-full px-3 py-1 ${voucher.isActive ? "bg-[#DCFCE7]" : "bg-[#FEE2E2]"}`}>
          <Text className={`text-[11px] font-bold ${voucher.isActive ? "text-[#15803D]" : "text-[#B91C1C]"}`}>
            {voucher.isActive ? "Active" : "Inactive"}
          </Text>
        </View>
        <Text className="text-[12px] text-[#6B7280]">ID: {voucher.id}</Text>
      </View>

      <Text className="mt-3 text-[28px] font-extrabold text-[#0369A1]">{voucher.code}</Text>
      <Text className="mt-1 text-[20px] font-bold text-[#111827]">
        {voucher.discountType === "percent" ? `${voucher.discountValue}%` : formatCurrency(voucher.discountValue)}
      </Text>
      <Text className="mt-1 text-[14px] text-[#4B5563]">Don toi thieu {formatCurrency(voucher.minOrderValue)}</Text>

      <View className="mt-4 h-2 rounded-full bg-[#E5E7EB]">
        <View className="h-2 rounded-full bg-[#2F95D2]" style={{ width: `${ratio * 100}%` }} />
      </View>
      <Text className="mt-1 text-[12px] text-[#6B7280]">Da dung: {voucher.usedCount}/{voucher.usageLimit}</Text>

      {onEdit || onToggleStatus || onDelete ? (
        <View className="mt-4 flex-row gap-2">
          {onEdit ? (
            <Pressable className="flex-1 h-10 items-center justify-center rounded-[10px] bg-[#E8F1FB]" onPress={() => onEdit(voucher)}>
              <Text className="text-[13px] font-bold text-[#0369A1]">Sua</Text>
            </Pressable>
          ) : null}
          {onToggleStatus ? (
            <Pressable className="flex-1 h-10 items-center justify-center rounded-[10px] bg-[#F3F4F6]" onPress={() => onToggleStatus(voucher)}>
              <Text className="text-[13px] font-bold text-[#374151]">{voucher.isActive ? "Tat" : "Bat"}</Text>
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable className="h-10 w-10 items-center justify-center rounded-[10px] bg-[#FEE2E2]" onPress={() => onDelete(voucher)}>
              <Feather name="trash-2" size={16} color="#B91C1C" />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
