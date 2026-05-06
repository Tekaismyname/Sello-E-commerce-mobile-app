import { Feather } from "@expo/vector-icons";
import { Href, router, useLocalSearchParams } from "expo-router";
import { ImageBackground, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

export default function PaymentSuccessScreen() {
  const { orderId, amount } = useLocalSearchParams<{ orderId?: string; amount?: string }>();
  const normalizedOrderId = Number(orderId ?? 0);
  const total = Number(amount ?? 0);

  return (
    <SafeAreaView className="flex-1 bg-[#F6F8FC]" edges={["top", "bottom"]}>
      <View className="flex-row items-center justify-between px-6 pt-3">
        <Text className="text-[19px] font-extrabold text-[#0F4C6B]">Sello Commerce</Text>
        <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-[#E9EEF5]" onPress={() => router.replace("/main/home" as Href)}>
          <Feather name="x" size={20} color="#1F2934" />
        </Pressable>
      </View>

      <View className="flex-1 px-6 pt-8">
        <View className="items-center">
          <View className="h-[96px] w-[96px] items-center justify-center rounded-full bg-[#00A344] shadow-lg">
            <Feather name="check" size={48} color="white" />
          </View>
          <Text className="mt-8 text-center text-[30px] font-extrabold leading-[36px] text-[#1F2934]">
            Thanh toán thành công!
          </Text>
          <Text className="mt-3 text-center text-[16px] leading-[24px] text-[#4B5563]">
            Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
          </Text>
        </View>

        <View className="mt-8 rounded-[16px] bg-white p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-[15px] text-[#4B5563]">Mã đơn hàng</Text>
            <Text className="text-[16px] font-extrabold text-[#1F2934]">#EC-{normalizedOrderId || "20240985"}</Text>
          </View>
          <View className="my-4 h-px bg-[#EEF2F6]" />
          <View className="flex-row items-center justify-between">
            <Text className="text-[15px] text-[#4B5563]">Tổng thanh toán</Text>
            <Text className="text-[22px] font-extrabold text-[#0F6CBD]">{formatPrice(total)}</Text>
          </View>
          <View className="my-4 h-px bg-[#EEF2F6]" />
          <View className="flex-row items-start justify-between gap-4">
            <Text className="text-[15px] text-[#4B5563]">Dự kiến giao hàng</Text>
            <View className="items-end">
              <Text className="text-[15px] font-extrabold text-[#12805C]">Thứ Năm, 24 Thg 5</Text>
              <Text className="mt-1 text-[13px] text-[#4B5563]">Giao hàng tiêu chuẩn</Text>
            </View>
          </View>
        </View>

        <ImageBackground
          source={{ uri: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80" }}
          imageStyle={{ borderRadius: 12 }}
          className="mt-8 overflow-hidden rounded-[12px]"
        >
          <View className="bg-black/45 px-6 py-7">
            <Text className="text-[12px] font-bold uppercase text-[#BCE7F8]">Ưu đãi độc quyền</Text>
            <Text className="mt-2 text-[18px] font-extrabold text-white">Giảm 15% cho đơn hàng kế tiếp</Text>
          </View>
        </ImageBackground>

        <View className="mt-auto gap-3 pb-4">
          <Pressable
            className="h-[56px] flex-row items-center justify-center rounded-[12px] bg-[#2F95D2]"
            onPress={() => router.replace((`/main/order-tracking?orderId=${normalizedOrderId}` as unknown) as Href)}
          >
            <Feather name="truck" size={18} color="white" />
            <Text className="ml-3 text-[16px] font-extrabold text-white">Theo dõi đơn hàng</Text>
          </Pressable>
          <Pressable
            className="h-[56px] flex-row items-center justify-center rounded-[12px] bg-[#E9EEF5]"
            onPress={() => router.replace("/main/home" as Href)}
          >
            <Feather name="shopping-bag" size={18} color="#0F4C6B" />
            <Text className="ml-3 text-[16px] font-extrabold text-[#0F4C6B]">Tiếp tục mua sắm</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
