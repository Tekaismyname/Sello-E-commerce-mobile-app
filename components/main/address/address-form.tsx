import { Address } from "@/types/customer";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";

type Props = {
  initialValue?: Address | null;
  loading?: boolean;
  onSubmit: (payload: {
    recipientName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    detailAddress: string;
    addressType?: string;
    isDefault?: boolean;
  }) => Promise<void>;
};

export function AddressForm({ initialValue, loading, onSubmit }: Props) {
  const [recipientName, setRecipientName] = useState(initialValue?.recipientName ?? "");
  const [phone, setPhone] = useState(initialValue?.phone ?? "");
  const [province, setProvince] = useState(initialValue?.province ?? "");
  const [district, setDistrict] = useState(initialValue?.district ?? "");
  const [ward, setWard] = useState(initialValue?.ward ?? "");
  const [detailAddress, setDetailAddress] = useState(initialValue?.detailAddress ?? "");
  const [addressType, setAddressType] = useState(initialValue?.addressType ?? "Nhà riêng");
  const [isDefault, setIsDefault] = useState(initialValue?.isDefault ?? false);

  useEffect(() => {
    setRecipientName(initialValue?.recipientName ?? "");
    setPhone(initialValue?.phone ?? "");
    setProvince(initialValue?.province ?? "");
    setDistrict(initialValue?.district ?? "");
    setWard(initialValue?.ward ?? "");
    setDetailAddress(initialValue?.detailAddress ?? "");
    setAddressType(initialValue?.addressType ?? "Nhà riêng");
    setIsDefault(initialValue?.isDefault ?? false);
  }, [initialValue]);

  return (
    <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24" showsVerticalScrollIndicator={false}>
      <View className="rounded-[16px] bg-white p-4">
        <Text className="text-[14px] font-bold text-[#111827]">Người nhận</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" value={recipientName} onChangeText={setRecipientName} placeholder="Nguyễn Văn A" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Số điện thoại</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="0901234567" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Tỉnh/Thành phố</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" value={province} onChangeText={setProvince} placeholder="TP. Hồ Chí Minh" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Quận/Huyện</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" value={district} onChangeText={setDistrict} placeholder="Quận 1" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Phường/Xã</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" value={ward} onChangeText={setWard} placeholder="Bến Nghé" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Địa chỉ chi tiết</Text>
        <TextInput className="mt-2 min-h-[92px] rounded-[12px] bg-[#F3F5FA] px-3 py-3" multiline value={detailAddress} onChangeText={setDetailAddress} placeholder="Số nhà, tên đường..." />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Loại địa chỉ</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3" value={addressType} onChangeText={setAddressType} placeholder="Nhà riêng / Công ty" />

        <View className="mt-4 flex-row items-center justify-between rounded-[12px] bg-[#F8FAFC] px-3 py-3">
          <Text className="text-[14px] font-semibold text-[#111827]">Đặt làm địa chỉ mặc định</Text>
          <Switch value={isDefault} onValueChange={setIsDefault} />
        </View>
      </View>

      <Pressable
        disabled={loading || !recipientName.trim() || !phone.trim() || !province.trim() || !district.trim() || !ward.trim() || !detailAddress.trim()}
        className="mt-4 h-12 items-center justify-center rounded-[12px] bg-[#2F95D2] disabled:opacity-60"
        onPress={async () => {
          await onSubmit({
            recipientName: recipientName.trim(),
            phone: phone.trim(),
            province: province.trim(),
            district: district.trim(),
            ward: ward.trim(),
            detailAddress: detailAddress.trim(),
            addressType: addressType.trim() || undefined,
            isDefault,
          });
        }}
      >
        <Text className="text-[15px] font-bold text-white">Lưu địa chỉ</Text>
      </Pressable>
    </ScrollView>
  );
}
