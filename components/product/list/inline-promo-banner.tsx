import { Pressable, Text, View } from "react-native";

export function InlinePromoBanner() {
  return (
    <View className="mt-3 overflow-hidden rounded-[16px] bg-[#b7d8f2] px-4 py-4">
      <Text className="text-[11px] font-bold uppercase tracking-[1px] text-[#5f7f97]">ƯU ĐÃI</Text>
      <Text className="mt-1 max-w-[70%] text-[31px] font-extrabold leading-[34px] text-[#12314f]">
        Bộ sưu tập Xuân Hè ưu đãi đến 50%
      </Text>
      <Text className="mt-1 max-w-[60%] text-[11px] font-semibold text-[#2f5a7c]">
        Dành riêng cho thành viên Editorial Rewards
      </Text>
      <Pressable className="mt-3 h-8 w-[110px] items-center justify-center rounded-full bg-[#2e7fd0]">
        <Text className="text-[12px] font-bold text-white">Khám phá ngay</Text>
      </Pressable>
    </View>
  );
}
