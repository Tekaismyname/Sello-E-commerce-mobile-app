import { orderService } from "@/services/customer.service";
import { Feather } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

export default function PaymentProcessingScreen() {
  const params = useLocalSearchParams<{
    orderId?: string;
    paymentId?: string;
    amount?: string;
    method?: string;
    paymentType?: string;
  }>();
  const isFocused = useIsFocused();
  const handledRef = useRef(false);
  const [attemptText, setAttemptText] = useState("Initializing");

  const orderId = Number(params.orderId ?? 0);
  const paymentId = Number(params.paymentId ?? 0);
  const amount = Number(params.amount ?? 0);
  const method = params.method ?? "Payment";
  const paymentType = params.paymentType ?? "online";

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
    if (!isFocused) return;
    if (handledRef.current) return;
    handledRef.current = true;
    let cancelled = false;
    const replaceIfActive = (href: Href) => {
      if (!cancelled) router.replace(href);
    };

    const runPayment = async () => {
      try {
        if (paymentType === "cod") {
          setAttemptText("Confirming COD order");
          await new Promise((resolve) => setTimeout(resolve, 800));
          replaceIfActive((`/main/payment-success?${nextParams}` as unknown) as Href);
          return;
        }

        if (!paymentId) {
          replaceIfActive((`/main/payment-failed?${nextParams}&reason=Payment%20ID%20not%20found` as unknown) as Href);
          return;
        }

        const maxAttempts = 40;
        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          if (cancelled) return;
          setAttemptText(`Checking status attempt ${attempt + 1}/${maxAttempts}`);
          const statusResponse = await orderService.getMockPaymentStatus(paymentId);
          if (cancelled) return;
          const paymentStatus = statusResponse.data.paymentStatus;

          if (paymentStatus === "success" || paymentStatus === "paid") {
            replaceIfActive((`/main/payment-success?${nextParams}` as unknown) as Href);
            return;
          }

          if (paymentStatus === "failed" || paymentStatus === "expired") {
            const reason = encodeURIComponent(statusResponse.data.failReason ?? "Transaction was not confirmed");
            replaceIfActive((`/main/payment-failed?${nextParams}&reason=${reason}` as unknown) as Href);
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        replaceIfActive((`/main/payment-failed?${nextParams}&reason=QR%20confirmation%20timed%20out` as unknown) as Href);
      } catch (error: any) {
        const reason = encodeURIComponent(error?.message ?? "Unable to complete the transaction");
        replaceIfActive((`/main/payment-failed?${nextParams}&reason=${reason}` as unknown) as Href);
      }
    };

    runPayment();
    return () => {
      cancelled = true;
    };
  }, [isFocused, nextParams, paymentId, paymentType]);

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
            <Text className="ml-2 text-[12px] font-bold text-[#12805C]">Waiting for QR</Text>
          </View>

          <Text className="mt-10 text-center text-[26px] font-extrabold text-[#1F2934]">Waiting for payment confirmation</Text>
          <Text className="mt-3 text-center text-[15px] leading-[23px] text-[#4B5563]">
            The system is checking the {formatPrice(amount)} transaction via {method}. The order will only be confirmed after Sello Mock Bank returns the result to the backend.
          </Text>
        </View>

        <View className="mt-10 gap-3">
          <View className="flex-row items-center rounded-[14px] bg-[#EEF8F2] px-4 py-3">
            <Feather name="check-circle" size={20} color="#12805C" />
            <Text className="ml-3 text-[14px] font-bold text-[#1F2934]">Order created successfully</Text>
          </View>
          <View className="flex-row items-center rounded-[14px] bg-white px-4 py-3">
            <ActivityIndicator size="small" color="#0F6CBD" />
            <View className="ml-3 flex-1">
              <Text className="text-[14px] font-bold text-[#0F4C6B]">Waiting for QR confirmation</Text>
              <Text className="mt-1 text-[12px] font-semibold text-[#64748B]">{attemptText}</Text>
            </View>
          </View>
          <View className="flex-row items-center rounded-[14px] px-4 py-3 opacity-50">
            <Feather name="more-horizontal" size={20} color="#64748B" />
            <Text className="ml-3 text-[14px] font-bold text-[#64748B]">Order update</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
