import { Feather } from "@expo/vector-icons";
import { Href, router, useLocalSearchParams } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

const buildFallbackQr = (payload: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(payload)}`;

export default function PaymentScreen() {
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
  const method = params.method ?? "Thanh toan";
  const paymentType = params.paymentType ?? "online";
  const paymentUrl = params.paymentUrl ?? "";
  const isOnlinePayment = paymentType !== "cod";
  const fallbackPayload = JSON.stringify({
    type: "SELLO_MOCK_PAYMENT",
    orderId,
    paymentId,
    amount,
    currency: "VND",
    paymentUrl,
  });
  const qrCodeUrl = params.qrCodeUrl || (isOnlinePayment ? buildFallbackQr(fallbackPayload) : "");

  const goProcessing = () => {
    const nextParams = new URLSearchParams({
      orderId: String(orderId),
      paymentId: String(paymentId),
      amount: String(amount),
      method,
      paymentType,
      result: "success",
    });

    router.replace((`/main/payment-processing?${nextParams.toString()}` as unknown) as Href);
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
        <Text className="text-[20px] font-extrabold text-[#0F4C6B]">Payment</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-24 pt-3" showsVerticalScrollIndicator={false}>
        <View className="rounded-[16px] bg-white p-5">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[13px] font-bold uppercase text-[#64748B]">Ma don hang</Text>
              <Text className="mt-1 text-[20px] font-extrabold text-[#1F2934]">#EC-{orderId || "000000"}</Text>
            </View>
            <View className="rounded-full bg-[#EAF5FC] px-3 py-1">
              <Text className="text-[12px] font-bold text-[#0F6CBD]">{paymentType.toUpperCase()}</Text>
            </View>
          </View>

          <View className="mt-5 rounded-[14px] bg-[#F6F8FC] p-4">
            <Text className="text-[13px] font-bold text-[#64748B]">Tong thanh toan</Text>
            <Text className="mt-1 text-[30px] font-extrabold text-[#0F6CBD]">{formatPrice(amount)}</Text>
            <Text className="mt-2 text-[14px] text-[#4B5563]">Phuong thuc: {method}</Text>
          </View>
        </View>

        <View className="mt-4 items-center rounded-[16px] bg-white p-5">
          {isOnlinePayment ? (
            <>
              <View className="rounded-[20px] border border-[#E1E7EF] bg-white p-4">
                <Image source={{ uri: qrCodeUrl }} className="h-[240px] w-[240px]" resizeMode="contain" />
              </View>
              <Text className="mt-4 text-center text-[18px] font-extrabold text-[#1F2934]">Quet QR de thanh toan</Text>
              <Text className="mt-2 text-center text-[14px] leading-[21px] text-[#64748B]">
                Sau khi ban da thanh toan tren vi/ngan hang, bam nut Da thanh toan de he thong xac thuc mock payment.
              </Text>
            </>
          ) : (
            <>
              <View className="h-[120px] w-[120px] items-center justify-center rounded-full bg-[#EAF5FC]">
                <Feather name="package" size={48} color="#0F6CBD" />
              </View>
              <Text className="mt-4 text-center text-[18px] font-extrabold text-[#1F2934]">Thanh toan khi nhan hang</Text>
              <Text className="mt-2 text-center text-[14px] leading-[21px] text-[#64748B]">
                Don hang da duoc tao. Xac nhan de chuyen sang buoc xu ly don hang.
              </Text>
            </>
          )}
        </View>

        <View className="mt-4 rounded-[16px] bg-white p-4">
          <View className="flex-row items-start">
            <Feather name="shield" size={18} color="#12805C" />
            <View className="ml-3 flex-1">
              <Text className="text-[14px] font-extrabold text-[#1F2934]">Mock payment an toan cho demo</Text>
              <Text className="mt-1 text-[13px] leading-[19px] text-[#64748B]">
                Trang nay chi mo phong viec khach hang da quet QR. Du lieu that duoc cap nhat khi ban bam Da thanh toan.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="border-t border-[#E1E7EF] bg-white px-5 py-4">
        <Pressable
          className="h-[56px] flex-row items-center justify-center rounded-[12px] bg-[#2F95D2]"
          onPress={goProcessing}
        >
          <Feather name={isOnlinePayment ? "check-circle" : "truck"} size={18} color="white" />
          <Text className="ml-3 text-[16px] font-extrabold text-white">
            {isOnlinePayment ? "Da thanh toan" : "Xac nhan don hang"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
