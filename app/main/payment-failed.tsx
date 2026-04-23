import { Feather } from "@expo/vector-icons";
import { Href, router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

export default function PaymentFailedScreen() {
  const params = useLocalSearchParams<{
    orderId?: string;
    paymentId?: string;
    amount?: string;
    method?: string;
    reason?: string;
  }>();
  const orderId = Number(params.orderId ?? 0);
  const paymentId = Number(params.paymentId ?? 0);
  const amount = Number(params.amount ?? 0);
  const method = params.method ?? "Thanh toan";
  const reason = params.reason ?? "Giao dich khong the hoan tat";

  const retryParams = new URLSearchParams({
    orderId: String(orderId),
    paymentId: String(paymentId),
    amount: String(amount),
    method,
    paymentType: "online",
    result: "success",
  }).toString();

  return (
    <SafeAreaView className="flex-1 bg-[#F6F8FC]" edges={["top", "bottom"]}>
      <View className="flex-row items-center px-6 pt-3">
        <Pressable className="h-10 w-10 items-center justify-center" onPress={() => router.replace("/main/orders" as Href)}>
          <Feather name="x" size={22} color="#1F2934" />
        </Pressable>
        <Text className="ml-10 text-[19px] font-extrabold text-[#0F4C6B]">Sello Commerce</Text>
      </View>

      <View className="flex-1 px-6 pt-10">
        <View className="items-center">
          <View className="h-[96px] w-[96px] items-center justify-center rounded-full bg-[#FFE1DE]">
            <View className="h-[56px] w-[56px] items-center justify-center rounded-full bg-[#C00018]">
              <Feather name="alert-circle" size={34} color="white" />
            </View>
          </View>
          <Text className="mt-8 text-center text-[30px] font-extrabold text-[#1F2934]">Thanh toan that bai</Text>
        </View>

        <View className="mt-6 rounded-[16px] bg-white p-5">
          <Text className="text-center text-[15px] font-bold text-[#1F2934]">Loi: {reason}</Text>
          <Text className="mt-2 text-center text-[14px] leading-[21px] text-[#4B5563]">
            Rat tiec, giao dich cua ban khong the hoan tat. Vui long thu lai hoac su dung phuong thuc khac.
          </Text>
        </View>

        <View className="mt-8 rounded-[16px] bg-white p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-[15px] text-[#4B5563]">Ma don hang</Text>
            <Text className="text-[16px] font-extrabold text-[#1F2934]">#EC-{orderId || "992810"}</Text>
          </View>
          <View className="my-4 h-px bg-[#EEF2F6]" />
          <View className="flex-row items-center justify-between">
            <Text className="text-[15px] text-[#4B5563]">Tong tien</Text>
            <Text className="text-[22px] font-extrabold text-[#0F6CBD]">{formatPrice(amount)}</Text>
          </View>
          <View className="my-4 h-px bg-[#EEF2F6]" />
          <View className="flex-row items-center justify-between">
            <Text className="text-[15px] text-[#4B5563]">Phuong thuc</Text>
            <Text className="text-[16px] font-extrabold text-[#1F2934]">{method}</Text>
          </View>
        </View>

        <View className="mt-auto gap-3 pb-6">
          <Pressable
            className="h-[56px] flex-row items-center justify-center rounded-[12px] bg-[#2F95D2]"
            onPress={() => router.replace((`/main/payment-processing?${retryParams}` as unknown) as Href)}
          >
            <Feather name="refresh-cw" size={18} color="white" />
            <Text className="ml-3 text-[16px] font-extrabold text-white">Thu lai</Text>
          </Pressable>
          <Pressable
            className="h-[56px] flex-row items-center justify-center rounded-[12px] bg-[#E9EEF5]"
            onPress={() => router.replace("/main/checkout" as Href)}
          >
            <Feather name="credit-card" size={18} color="#0F4C6B" />
            <Text className="ml-3 text-[16px] font-extrabold text-[#0F4C6B]">Doi phuong thuc thanh toan</Text>
          </Pressable>
          <Text className="mt-4 text-center text-[13px] text-[#64748B]">
            Gap su co khac? <Text className="font-bold text-[#0F4C6B]">Lien he ho tro</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
