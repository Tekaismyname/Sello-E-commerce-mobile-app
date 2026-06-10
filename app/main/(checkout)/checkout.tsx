import { AddressForm } from "@/components/main/address/address-form";
import { CheckoutAddressSelector } from "@/components/main/checkout/checkout-address-selector";
import { CheckoutFooterBar } from "@/components/main/checkout/checkout-footer-bar";
import { CheckoutOrderSummary } from "@/components/main/checkout/checkout-order-summary";
import { CheckoutPaymentSelector } from "@/components/main/checkout/checkout-payment-selector";
import { CheckoutPricing } from "@/components/main/checkout/checkout-pricing";
import { CheckoutSelectedAddress } from "@/components/main/checkout/checkout-selected-address";
import { CheckoutVoucherRow } from "@/components/main/checkout/checkout-voucher-row";
import { useAuth } from "@/contexts/auth-context";
import { useCheckout } from "@/hooks/customer/use-checkout";
import { addressService, cartService } from "@/services/customer.service";
import { Address, CartItem, CreateAddressPayload, UpdateAddressPayload } from "@/types/customer";
import { triggerLocalNotification } from "@/utils/local-notification";
import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CheckoutScreen() {
  const { token } = useAuth();
  const {
    preview,
    loading,
    submitting,
    error,
    voucherCode,
    selectedAddressId,
    selectedPaymentMethodId,
    pricing,
    setVoucherCode,
    setSelectedAddressId,
    setSelectedPaymentMethodId,
    applyVoucher,
    fetchPreview,
    placeOrder,
  } = useCheckout(token);
  const [showAddressOptions, setShowAddressOptions] = useState(false);
  const [showVoucherInput, setShowVoucherInput] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  const selectedAddress = useMemo(
    () => preview?.addresses.find((item) => item.id === selectedAddressId) ?? null,
    [preview?.addresses, selectedAddressId],
  );

  const refreshCheckout = async () => {
    await fetchPreview(voucherCode);
  };

  const handlePlaceOrder = async () => {
    try {
      const result = await placeOrder();
      if (!result) return;

      const data = (result.data ?? {}) as any;
      const orderId = Number(data.orderId ?? data.id ?? 0);
      const paymentId = Number(data.paymentId ?? 0);
      const paymentType = String(data.paymentType ?? "cod");
      const paymentMethod = preview?.paymentMethods.find((item) => item.id === selectedPaymentMethodId);
      const params = new URLSearchParams({
        orderId: String(orderId),
        paymentId: String(paymentId),
        amount: String(pricing.totalAmount),
        method: paymentMethod?.name ?? paymentMethod?.code ?? "Payment",
        paymentType,
        qrCodeUrl: String(data.qrCodeUrl ?? ""),
        paymentUrl: String(data.paymentUrl ?? ""),
      });

      router.replace((`/main/payment?${params.toString()}` as unknown) as Href);

      triggerLocalNotification(
        "Order created successfully!",
        `Your Sello order worth ${new Intl.NumberFormat("vi-VN").format(pricing.totalAmount)}d has been created successfully.`,
      );
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Unable to place the order.");
    }
  };

  const openCreateAddress = () => {
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  const openEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const saveAddress = async (payload: CreateAddressPayload | UpdateAddressPayload) => {
    if (!token) return;

    setSavingAddress(true);
    try {
      const response = editingAddress
        ? await addressService.updateAddress(token, editingAddress.id, payload)
        : await addressService.createAddress(token, payload as CreateAddressPayload);

      if (response.data?.id) {
        setSelectedAddressId(response.data.id);
      }

      setShowAddressForm(false);
      await refreshCheckout();
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Unable to save the address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleChangeQuantity = async (item: CartItem, nextQuantity: number) => {
    if (!token || nextQuantity < 1) return;

    setUpdatingItemId(item.id);
    try {
      await cartService.updateCartItem(token, item.id, { quantity: nextQuantity });
      await refreshCheckout();
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Unable to update the quantity.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F2F4F8]" edges={["top"]}>
      <View className="h-[56px] flex-row items-center justify-center px-4">
        <Pressable className="absolute left-4 h-10 w-10 items-center justify-center" onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#0369A1" />
        </Pressable>
        <Text className="text-[20px] font-extrabold text-[#0F4C6B]">Checkout</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0369A1" />
        </View>
      ) : (
        <>
          <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8 pt-2" showsVerticalScrollIndicator={false}>
            {!!error && (
              <View className="mb-3 rounded-[12px] bg-[#FFF1F0] p-3">
                <Text className="text-[13px] font-semibold text-[#BA1A1A]">{error}</Text>
              </View>
            )}

            <CheckoutSelectedAddress
              address={selectedAddress}
              onChangePress={() => setShowAddressOptions((prev) => !prev)}
            />

            {showAddressOptions && (
              <View className="mt-2 rounded-[16px] bg-white p-3">
                <View className="mb-3 flex-row gap-2">
                  <Pressable
                    className="h-10 flex-1 flex-row items-center justify-center rounded-[10px] bg-[#0369A1]"
                    onPress={openCreateAddress}
                  >
                    <Feather name="plus" size={15} color="white" />
                    <Text className="ml-2 text-[13px] font-bold text-white">Add address</Text>
                  </Pressable>
                  {selectedAddress ? (
                    <Pressable
                      className="h-10 flex-1 flex-row items-center justify-center rounded-[10px] bg-[#EAF5FC]"
                      onPress={() => openEditAddress(selectedAddress)}
                    >
                      <Feather name="edit-2" size={15} color="#0369A1" />
                      <Text className="ml-2 text-[13px] font-bold text-[#0369A1]">Edit address</Text>
                    </Pressable>
                  ) : null}
                </View>
                <CheckoutAddressSelector
                  addresses={preview?.addresses ?? []}
                  selectedAddressId={selectedAddressId}
                  onSelectAddress={(addressId) => {
                    setSelectedAddressId(addressId);
                    setShowAddressOptions(false);
                  }}
                />
              </View>
            )}

            <View className="mt-3">
              <CheckoutOrderSummary
                items={preview?.items ?? []}
                updatingItemId={updatingItemId}
                onChangeQuantity={handleChangeQuantity}
              />
            </View>

            <View className="mt-3">
              <CheckoutVoucherRow
                appliedCode={preview?.voucher?.code}
                onPress={() => setShowVoucherInput((prev) => !prev)}
              />
            </View>

            {showVoucherInput && (
              <View className="mt-2 rounded-[14px] bg-white p-3">
                <View className="flex-row gap-2">
                  <TextInput
                    className="h-11 flex-1 rounded-[10px] bg-[#F5F7FB] px-3 text-[13px] text-[#1F2934]"
                    placeholder="Enter voucher code"
                    placeholderTextColor="#94A0AE"
                    value={voucherCode}
                    onChangeText={setVoucherCode}
                  />
                  <Pressable
                    onPress={applyVoucher}
                    className="h-11 items-center justify-center rounded-[10px] bg-[#0369A1] px-4"
                  >
                    <Text className="text-[12px] font-bold text-white">Apply</Text>
                  </Pressable>
                </View>
              </View>
            )}

            <View className="mt-3 rounded-[16px] bg-white p-4">
              <Text className="text-[17px] font-extrabold text-[#1F2934]">Payment method</Text>
              <View className="mt-3">
                <CheckoutPaymentSelector
                  paymentMethods={preview?.paymentMethods ?? []}
                  selectedPaymentMethodId={selectedPaymentMethodId}
                  onSelectPaymentMethod={setSelectedPaymentMethodId}
                />
              </View>
            </View>

            <View className="mt-3">
              <CheckoutPricing
                subtotal={pricing.subtotal}
                shippingFee={pricing.shippingFee}
                discount={pricing.discount}
                totalAmount={pricing.totalAmount}
              />
            </View>
          </ScrollView>

          <CheckoutFooterBar
            totalAmount={pricing.totalAmount}
            disabled={!preview?.items.length || !selectedAddressId || !selectedPaymentMethodId}
            submitting={submitting}
            onSubmit={handlePlaceOrder}
          />

          <Modal visible={showAddressForm} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-[#F3F5FA]">
              <View className="h-[56px] flex-row items-center justify-between bg-white px-4">
                <Text className="text-[18px] font-extrabold text-[#0F4C6B]">
                  {editingAddress ? "Edit address" : "Add new address"}
                </Text>
                <Pressable className="h-10 w-10 items-center justify-center" onPress={() => setShowAddressForm(false)}>
                  <Feather name="x" size={20} color="#1F2934" />
                </Pressable>
              </View>
              <AddressForm initialValue={editingAddress} loading={savingAddress} onSubmit={saveAddress} />
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
}
