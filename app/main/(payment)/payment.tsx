import { orderService } from "@/services/customer.service";
import { Feather } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

const buildFallbackQr = (payload: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(payload)}`;

export default function PaymentScreen() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 480;
  const isWeb = Platform.OS === "web";
  const isFocused = useIsFocused();

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
  const redirectedRef = useRef(false);
  const autoOpenedRef = useRef(false);
  const [statusMessage, setStatusMessage] = useState(
    paymentType === "paypal" ? "Waiting for PayPal payment" : "Waiting for QR confirmation",
  );
  const [isChecking, setIsChecking] = useState(isOnlinePayment && paymentType !== "paypal");
  const [isProcessingPaypal, setIsProcessingPaypal] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

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

  const goProcessing = () => {
    router.replace((`/main/payment-processing?${nextParams.toString()}` as unknown) as Href);
  };

  const handlePaypalCheckout = useCallback(async () => {
    if (!paymentUrl) {
      Alert.alert(
        "Payment error",
        "PayPal payment URL was not found. Please recreate the order or try again later.",
      );
      return;
    }

    if (isProcessingPaypal) return;

    if (isWeb) {
      try {
        setIsProcessingPaypal(true);
        setStatusMessage("Opening PayPal checkout...");
        const win = window.open(paymentUrl, "_blank");

        if (win) {
          setStatusMessage("Waiting for PayPal payment in a new window...");
        } else {
          setStatusMessage("Payment popup was blocked. Please allow popups.");
          Alert.alert("Popup blocked", "Please allow popups or open PayPal checkout directly.", [
            { text: "Close" },
            { text: "Open directly", onPress: () => Linking.openURL(paymentUrl) },
          ]);
        }
      } catch (err: any) {
        Alert.alert("Error", err.message ?? "Unable to open PayPal checkout.");
      } finally {
        setIsProcessingPaypal(false);
      }
      return;
    }

    try {
      setIsProcessingPaypal(true);
      setStatusMessage("Redirecting to PayPal...");
      await WebBrowser.openBrowserAsync(paymentUrl);
      setStatusMessage("Waiting for PayPal payment...");
    } catch (err: any) {
      setStatusMessage("Payment failed");
      Alert.alert("Error", err.message ?? "An error occurred during PayPal payment.");
    } finally {
      setIsProcessingPaypal(false);
    }
  }, [isProcessingPaypal, isWeb, paymentUrl]);

  useEffect(() => {
    redirectedRef.current = false;
    autoOpenedRef.current = false;
  }, [paymentId]);

  useEffect(() => {
    if (paymentType === "paypal" && paymentUrl && isFocused && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      const timer = setTimeout(() => {
        handlePaypalCheckout();
      }, 600);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [handlePaypalCheckout, isFocused, paymentType, paymentUrl]);

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
              : "Sello Mock Bank confirmation received"
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
          try {
            WebBrowser.dismissBrowser();
          } catch {}
          router.replace((`/main/payment-success?${nextParams.toString()}` as unknown) as Href);
        } else if (nextStatus === "failed" || nextStatus === "expired") {
          redirectedRef.current = true;
          try {
            WebBrowser.dismissBrowser();
          } catch {}
          router.replace(
            (`/main/payment-failed?${nextParams.toString()}&reason=${encodeURIComponent(
              response.data.failReason ?? nextMessage,
            )}` as unknown) as Href,
          );
        }
      } catch {
        if (!cancelled && paymentType !== "paypal") {
          setStatusMessage("Unable to connect to payment status");
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
      const diff = expiresAt.getTime() - Date.now();

      if (diff <= 0) {
        setTimeLeft("00:00");
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setTimeLeft(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, [expiresAt, isOnlinePayment]);

  return (
    <SafeAreaView className="flex-1 bg-[#F6F8FC]" edges={["top", "bottom"]}>
      <View className="h-[56px] flex-row items-center justify-center px-4">
        <Pressable
          className="absolute left-4 h-10 w-10 items-center justify-center"
          onPress={() => router.replace("/main/orders" as Href)}
        >
          <Feather name="arrow-left" size={20} color="#0F4C6B" />
        </Pressable>
        <Text className="text-[20px] font-extrabold text-[#0F4C6B]">Payment</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-24 pt-3" showsVerticalScrollIndicator={false}>
        <View className="rounded-[16px] bg-white p-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-[13px] font-bold uppercase text-[#64748B]">Order ID</Text>
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
                <View
                  className="mt-4 rounded-[20px] border border-[#E1E7EF] bg-white"
                  style={{ padding: isSmallScreen ? 10 : 16 }}
                >
                  <Image
                    source={{ uri: buildFallbackQr(paymentUrl) }}
                    style={{ height: isSmallScreen ? 160 : 240, width: isSmallScreen ? 160 : 240 }}
                    resizeMode="contain"
                  />
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
                Scan the QR code with another device, or use the button below to pay on this device. The transaction
                will be confirmed automatically after completion.
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

              <View
                className="mt-4 rounded-[20px] border border-[#E1E7EF] bg-white"
                style={{ padding: isSmallScreen ? 10 : 16 }}
              >
                <Image
                  source={{ uri: qrCodeUrl }}
                  style={{ height: isSmallScreen ? 160 : 240, width: isSmallScreen ? 160 : 240 }}
                  resizeMode="contain"
                />
              </View>

              <View className="mt-4 flex-row items-center rounded-full bg-[#EAF5FC] px-4 py-2">
                {isChecking ? (
                  <ActivityIndicator size="small" color="#0F6CBD" />
                ) : (
                  <Feather name="clock" size={14} color="#0F6CBD" />
                )}
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
                Scan the QR code with another device, open Sello Mock Bank, and confirm the payment. The order is
                confirmed only after the backend receives the result.
              </Text>

              {!!paymentUrl && (
                <Pressable
                  className="mt-4 h-[44px] flex-row items-center justify-center rounded-[12px] bg-[#EAF5FC] px-4"
                  onPress={() => WebBrowser.openBrowserAsync(paymentUrl)}
                >
                  <Feather name="external-link" size={16} color="#0F6CBD" />
                  <Text className="ml-2 text-[13px] font-extrabold text-[#0F6CBD]">Open mock bank</Text>
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
                Your order has been created. Confirm to move to order processing.
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
                  {paymentType === "paypal" ? "Secure PayPal payment" : "Status verified by QR"}
                </Text>
                <Text className="mt-1 text-[13px] leading-[19px] text-[#64748B]">
                  {paymentType === "paypal"
                    ? "The transaction is secured and processed through the PayPal Sandbox environment."
                    : "The button below only moves you to the waiting screen. The system will not confirm payment until the QR payment is accepted."}
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
