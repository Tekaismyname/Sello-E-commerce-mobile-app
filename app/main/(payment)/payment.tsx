import { useAuth } from "@/contexts/auth-context";
import { orderService } from "@/services/customer.service";
import { Feather } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { Href, router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

const buildFallbackQr = (payload: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(payload)}`;

const getQueryParam = (url: string, paramName: string): string | null => {
  const match = url.match(new RegExp(`[?&]${paramName}=([^&#]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export default function PaymentScreen() {
  const { token: userToken } = useAuth();
  const params = useLocalSearchParams<{
    orderId?: string;
    paymentId?: string;
    amount?: string;
    method?: string;
    paymentType?: string;
    qrCodeUrl?: string;
    paymentUrl?: string;
  }>();

  const orderId = Number(params.orderId ?? 0);
  const paymentId = Number(params.paymentId ?? 0);
  const amount = Number(params.amount ?? 0);
  const method = params.method ?? "Payment";
  const paymentType = params.paymentType ?? "online";
  const paymentUrl = params.paymentUrl ?? "";
  const isOnlinePayment = paymentType !== "cod";
  const isFocused = useIsFocused();
  const redirectedRef = useRef(false);
  const [statusMessage, setStatusMessage] = useState(
    paymentType === "paypal" ? "Waiting for PayPal payment" : "Waiting for QR confirmation",
  );
  const [isChecking, setIsChecking] = useState(isOnlinePayment && paymentType !== "paypal");
  const [isProcessingPaypal, setIsProcessingPaypal] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const fallbackPayload = JSON.stringify({
    type: "SELLO_MOCK_PAYMENT",
    orderId,
    paymentId,
    amount,
    currency: "VND",
    paymentUrl,
  });
  const qrCodeUrl = params.qrCodeUrl || (isOnlinePayment ? buildFallbackQr(fallbackPayload) : "");
  const nextParams = useMemo(
    () =>
      new URLSearchParams({
        orderId: String(orderId),
        paymentId: String(paymentId),
        amount: String(amount),
        method,
        paymentType,
      }),
    [amount, method, orderId, paymentId, paymentType],
  );

  useEffect(() => {
    redirectedRef.current = false;
  }, [paymentId]);

  useEffect(() => {
    if (!isFocused || !isOnlinePayment || !paymentId || redirectedRef.current) return;

    let cancelled = false;
    const checkStatus = async () => {
      if (redirectedRef.current) return;

      try {
        if (paymentType !== "paypal") {
          setIsChecking(true);
        }
        const response = await orderService.getMockPaymentStatus(paymentId);
        if (cancelled) return;

        if (response.data.expiresAt) {
          setExpiresAt(new Date(response.data.expiresAt));
        }

        const nextStatus = response.data.paymentStatus;
        const nextMessage =
          nextStatus === "success" || nextStatus === "paid"
            ? paymentType === "paypal"
              ? "PayPal confirmation received"
              : "Confirmation received from Sello Mock Bank"
            : nextStatus === "failed"
              ? "Transaction was declined"
              : nextStatus === "expired"
                ? "Payment has expired"
                : paymentType === "paypal"
                  ? "Waiting for PayPal payment"
                  : "Waiting for QR confirmation";
        setStatusMessage(nextMessage);

        if (nextStatus === "success" || nextStatus === "paid") {
          redirectedRef.current = true;
          router.replace((`/main/payment-success?${nextParams.toString()}` as unknown) as Href);
        } else if (nextStatus === "failed" || nextStatus === "expired") {
          redirectedRef.current = true;
          router.replace(
            (`/main/payment-failed?${nextParams.toString()}&reason=${encodeURIComponent(
              response.data.failReason ?? nextMessage,
            )}` as unknown) as Href,
          );
        }
      } catch {
        if (!cancelled && paymentType !== "paypal") {
          setStatusMessage("Unable to reach the payment status");
        }
      } finally {
        if (!cancelled && paymentType !== "paypal") {
          setIsChecking(false);
        }
      }
    };

    checkStatus();
    const intervalId = setInterval(checkStatus, 3000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [isFocused, isOnlinePayment, nextParams, paymentId, paymentType]);

  useEffect(() => {
    if (!expiresAt || !isOnlinePayment) {
      setTimeLeft("");
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = expiresAt.getTime() - now;

      if (diff <= 0) {
        setTimeLeft("00:00");
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      const minutesStr = String(minutes).padStart(2, "0");
      const secondsStr = String(seconds).padStart(2, "0");

      setTimeLeft(`${minutesStr}:${secondsStr}`);
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, [expiresAt, isOnlinePayment]);

  const goProcessing = () => {
    router.replace((`/main/payment-processing?${nextParams.toString()}` as unknown) as Href);
  };

  const handlePaypalCheckout = async () => {
    if (!paymentUrl || isProcessingPaypal) return;

    try {
      setIsProcessingPaypal(true);
      setStatusMessage("Redirecting to PayPal...");

      const result = await WebBrowser.openAuthSessionAsync(paymentUrl, "selloecommerce://checkout/paypal/success");

      if (result.type === "success" && result.url) {
        const paypalOrderId = getQueryParam(result.url, "token");

        if (paypalOrderId) {
          setStatusMessage("Confirming with PayPal...");

          const response = await orderService.capturePaypalOrder(userToken || "", paymentId, paypalOrderId);

          if (response.status === "COMPLETED") {
            redirectedRef.current = true;
            router.replace((`/main/payment-success?${nextParams.toString()}` as unknown) as Href);
          } else {
            redirectedRef.current = true;
            router.replace(
              (`/main/payment-failed?${nextParams.toString()}&reason=${encodeURIComponent(
                response.message || "PayPal payment was not successful.",
              )}` as unknown) as Href,
            );
          }
        } else {
          setIsProcessingPaypal(false);
          Alert.alert("Error", "PayPal order ID could not be found.");
        }
      } else {
        setIsProcessingPaypal(false);
        setStatusMessage("Waiting for PayPal payment");
      }
    } catch (err: any) {
      setIsProcessingPaypal(false);
      setStatusMessage("Payment failed");
      Alert.alert("Error", err.message ?? "An error occurred during the PayPal payment flow.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F6F8FC]" edges={["top", "bottom"]}>
      <View className="h-[56px] flex-row items-center justify-center px-4">
        <Pressable
          className="absolute left-4 h-10 w-10 items-center justify-center"
          onPress={() => router.replace("/main/orders" as Href)}
        >
          <Feather name="arrow-left" size={20} color="#0F4C6B" />
        </Pressable>
        <Text className="text-[20px] font-extrabold text-[#0F4C6B]">Checkout</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-24 pt-3" showsVerticalScrollIndicator={false}>
        <View className="rounded-[16px] bg-white p-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-[13px] font-bold uppercase text-[#64748B]">Order number</Text>
              <Text className="mt-1 text-[20px] font-extrabold text-[#1F2934]">#EC-{orderId || "000000"}</Text>
            </View>
            <View className="rounded-full bg-[#EAF5FC] px-3 py-1">
              <Text className="text-[12px] font-bold text-[#0F6CBD]">{paymentType.toUpperCase()}</Text>
            </View>
          </View>

          <View className="mt-5 rounded-[14px] bg-[#F6F8FC] p-4">
            <Text className="text-[13px] font-bold text-[#64748B]">Total payment</Text>
            <Text className="mt-1 text-[30px] font-extrabold text-[#0F6CBD]">{formatPrice(amount)}</Text>
            <Text className="mt-2 text-[14px] text-[#4B5563]">Method: {method}</Text>
          </View>
        </View>

        <View className="mt-4 rounded-[16px] bg-white p-5">
          {paymentType === "paypal" ? (
            <View className="items-center py-4">
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-2xl bg-[#003087]/10">
                <Feather name="credit-card" size={24} color="#003087" />
              </View>

              <Text className="text-[20px] font-extrabold text-[#003087]">PayPal Sandbox</Text>

              {!!paymentUrl && (
                <View className="mt-4 rounded-[20px] border border-[#E1E7EF] bg-white p-4">
                  <Image source={{ uri: buildFallbackQr(paymentUrl) }} className="h-[240px] w-[240px]" resizeMode="contain" />
                </View>
              )}

              <View className="mt-4 flex-row items-center rounded-full bg-[#EAF5FC] px-4 py-2">
                <ActivityIndicator size="small" color="#0F6CBD" />
                <Text className="ml-2 text-[12px] font-bold text-[#0F6CBD]">{statusMessage}</Text>
              </View>

              {timeLeft ? (
                <View className="mt-3 flex-row items-center rounded-full border border-[#FEE2E2] bg-[#FEF2F2] px-3 py-1.5">
                  <Feather name="clock" size={12} color="#EF4444" />
                  <Text className="ml-1.5 text-[12px] font-bold text-[#EF4444]">Time left: {timeLeft}</Text>
                </View>
              ) : null}

              <Text className="mt-4 text-center text-[18px] font-extrabold text-[#1F2934]">Scan QR to pay</Text>
              <Text className="mt-2 px-4 text-center text-[13px] leading-[19px] text-[#64748B]">
                Scan the QR code using another phone to pay, or tap the button below to pay directly on this device. The transaction will be confirmed automatically after completion.
              </Text>

              <Pressable
                className="mt-6 h-[52px] w-full flex-row items-center justify-center rounded-[12px] bg-[#FFC439] px-6 active:bg-[#E5AF30]"
                onPress={handlePaypalCheckout}
                disabled={isProcessingPaypal}
              >
                <Feather name="external-link" size={16} color="#003087" />
                <Text className="ml-2 text-[15px] font-bold text-[#003087]">
                  {isProcessingPaypal ? "Processing..." : "Open PayPal checkout"}
                </Text>
              </Pressable>
            </View>
          ) : isOnlinePayment ? (
            <View className="items-center">
              <View className="rounded-[18px] bg-[#0F4C6B] px-3 py-1">
                <Text className="text-[12px] font-bold text-white">Sello Mock Bank</Text>
              </View>

              <View className="mt-4 rounded-[20px] border border-[#E1E7EF] bg-white p-4">
                <Image source={{ uri: qrCodeUrl }} className="h-[240px] w-[240px]" resizeMode="contain" />
              </View>

              <View className="mt-4 flex-row items-center rounded-full bg-[#EAF5FC] px-4 py-2">
                {isChecking ? <ActivityIndicator size="small" color="#0F6CBD" /> : <Feather name="clock" size={14} color="#0F6CBD" />}
                <Text className="ml-2 text-[12px] font-bold text-[#0F6CBD]">{statusMessage}</Text>
              </View>

              {timeLeft ? (
                <View className="mt-3 flex-row items-center rounded-full border border-[#FEE2E2] bg-[#FEF2F2] px-3 py-1.5">
                  <Feather name="clock" size={12} color="#EF4444" />
                  <Text className="ml-1.5 text-[12px] font-bold text-[#EF4444]">Time left: {timeLeft}</Text>
                </View>
              ) : null}

              <Text className="mt-4 text-center text-[18px] font-extrabold text-[#1F2934]">Scan QR to confirm</Text>
              <Text className="mt-2 text-center text-[14px] leading-[21px] text-[#64748B]">
                Scan the QR code with another phone, open the Sello Mock Bank page, and confirm the payment. The order will only be confirmed after the backend receives the result.
              </Text>

              {!!paymentUrl && (
                <Pressable
                  className="mt-4 h-[44px] flex-row items-center justify-center rounded-[12px] bg-[#EAF5FC] px-4"
                  onPress={() => Linking.openURL(paymentUrl)}
                >
                  <Feather name="external-link" size={16} color="#0F6CBD" />
                  <Text className="ml-2 text-[13px] font-extrabold text-[#0F6CBD]">Open mock bank page</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View className="items-center">
              <View className="h-[120px] w-[120px] items-center justify-center rounded-full bg-[#EAF5FC]">
                <Feather name="package" size={48} color="#0F6CBD" />
              </View>
              <Text className="mt-4 text-center text-[18px] font-extrabold text-[#1F2934]">Cash on delivery</Text>
              <Text className="mt-2 text-center text-[14px] leading-[21px] text-[#64748B]">
                Your order has been created. Confirm to move it to the fulfillment stage.
              </Text>
            </View>
          )}
        </View>

        {isOnlinePayment ? (
          <View className="mt-4 rounded-[16px] bg-white p-4">
            <View className="flex-row items-start">
              <Feather name="shield" size={18} color="#12805C" />
              <View className="ml-3 flex-1">
                <Text className="text-[14px] font-extrabold text-[#1F2934]">
                  {paymentType === "paypal" ? "Secure payment with PayPal" : "Status verified by QR"}
                </Text>
                <Text className="mt-1 text-[13px] leading-[19px] text-[#64748B]">
                  {paymentType === "paypal"
                    ? "The transaction is secured and processed through the PayPal Sandbox testing environment."
                    : "The button below only takes you to the waiting screen. The system will not confirm payment until the QR flow is approved."}
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View className="border-t border-[#E1E7EF] bg-white px-5 py-4">
        <Pressable
          className="h-[56px] flex-row items-center justify-center rounded-[12px] bg-[#2F95D2]"
          onPress={paymentType === "paypal" ? handlePaypalCheckout : goProcessing}
          disabled={paymentType === "paypal" && isProcessingPaypal}
        >
          <Feather name={paymentType === "paypal" ? "credit-card" : isOnlinePayment ? "clock" : "truck"} size={18} color="white" />
          <Text className="ml-3 text-[16px] font-extrabold text-white">
            {paymentType === "paypal" ? "Pay with PayPal" : isOnlinePayment ? "Wait for QR confirmation" : "Confirm order"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
