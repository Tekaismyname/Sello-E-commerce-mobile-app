import { useAuth } from "@/contexts/auth-context";
import { orderService } from "@/services/customer.service";
import { Feather } from "@expo/vector-icons";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

export default function PaymentProcessingScreen() {
  const { token } = useAuth();
  const params = useLocalSearchParams<{
    orderId?: string;
    paymentId?: string;
    amount?: string;
    method?: string;
    paymentType?: string;
    result?: "success" | "failed";
  }>();
  const handledRef = useRef(false);

  const orderId = Number(params.orderId ?? 0);
  const paymentId = Number(params.paymentId ?? 0);
  const amount = Number(params.amount ?? 0);
  const method = params.method ?? "Thanh toan";
  const paymentType = params.paymentType ?? "online";
  const targetResult = params.result ?? "success";

  const nextParams = useMemo(
    () =>
      new URLSearchParams({
        orderId: String(orderId),
        paymentId: String(paymentId),
        amount: String(amount),
        method,
      }).toString(),
    [amount, method, orderId, paymentId],
  );

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const runPayment = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1300));

        if (paymentType !== "cod" && paymentId > 0) {
          await orderService.mockPaymentCallback(paymentId, { result: targetResult });
        }

        await new Promise((resolve) => setTimeout(resolve, 800));

        if (targetResult === "failed") {
          router.replace((`/main/payment-failed?${nextParams}&reason=So%20du%20khong%20du` as unknown) as Href);
          return;
        }

        router.replace((`/main/payment-success?${nextParams}` as unknown) as Href);
      } catch (error: any) {
        const reason = encodeURIComponent(error?.message ?? "Khong the hoan tat giao dich");
        router.replace((`/main/payment-failed?${nextParams}&reason=${reason}` as unknown) as Href);
      }
    };

    runPayment();
  }, [nextParams, paymentId, paymentType, targetResult, token]);

  return (
    <SafeAreaView className="flex-1 bg-[#F6F8FC]" edges={["top", "bottom"]}>
      <View className="flex-row items-center justify-between px-6 pt-3">
        <Text className="text-[19px] font-extrabold text-[#0F4C6B]">Sello Commerce</Text>
        <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-[#E9EEF5]" onPress={() => router.back()}>
          <Feather name="x" size={20} color="#1F2934" />
        </Pressable>
      </View>

      <View className="flex-1 justify-center px-6">
        <View className="items-center">
          <View className="rounded-full bg-[#EAF5FC] p-7">
            <View className="h-[148px] w-[148px] items-center justify-center rounded-full border-[6px] border-[#0F6CBD] bg-white">
              <Feather name="lock" size={42} color="#0F6CBD" />
            </View>
          </View>

          <View className="mt-4 flex-row items-center rounded-full bg-[#E9F8EF] px-3 py-1">
            <ActivityIndicator size="small" color="#12805C" />
            <Text className="ml-2 text-[12px] font-bold text-[#12805C]">Đang bảo mật</Text>
          </View>

          <Text className="mt-10 text-center text-[26px] font-extrabold text-[#1F2934]">Đang xử lý thanh toán</Text>
          <Text className="mt-3 text-center text-[15px] leading-[23px] text-[#4B5563]">
            Vui lòng không thoát ứng dụng. Đang xác thực giao dịch {formatPrice(amount)} qua {method}.
          </Text>
        </View>

        <View className="mt-10 gap-3">
          <View className="flex-row items-center rounded-[14px] bg-[#EEF8F2] px-4 py-3">
            <Feather name="check-circle" size={20} color="#12805C" />
            <Text className="ml-3 text-[14px] font-bold text-[#1F2934]">Khởi tạo đơn hàng thành công</Text>
          </View>
          <View className="flex-row items-center rounded-[14px] bg-white px-4 py-3">
            <ActivityIndicator size="small" color="#0F6CBD" />
            <Text className="ml-3 text-[14px] font-bold text-[#0F4C6B]">Xác thực với ngân hàng...</Text>
          </View>
          <View className="flex-row items-center rounded-[14px] px-4 py-3 opacity-50">
            <Feather name="more-horizontal" size={20} color="#64748B" />
            <Text className="ml-3 text-[14px] font-bold text-[#64748B]">Hoàn tất giao dịch</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
