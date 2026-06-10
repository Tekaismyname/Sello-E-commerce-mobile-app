import { useCallback, useEffect, useMemo, useState } from "react";
import { checkoutService } from "@/services/customer.service";
import { CheckoutPreview, CreateOrderPayload } from "@/types/customer";

export function useCheckout(token: string) {
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = useCallback(
    async (voucher?: string) => {
      if (!token) {
        setError("Please sign in to continue to checkout.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await checkoutService.previewCheckout(
          token,
          voucher?.trim() ? { voucherCode: voucher.trim() } : undefined,
        );

        setPreview(response.data);

        if (response.data.addresses.length && !selectedAddressId) {
          const defaultAddress = response.data.addresses.find((item) => item.isDefault);
          setSelectedAddressId(defaultAddress?.id ?? response.data.addresses[0]!.id);
        }

        if (response.data.paymentMethods.length && !selectedPaymentMethodId) {
          setSelectedPaymentMethodId(response.data.paymentMethods[0]!.id);
        }
      } catch (err: any) {
        setError(err.message ?? "Unable to load checkout information.");
      } finally {
        setLoading(false);
      }
    },
    [selectedAddressId, selectedPaymentMethodId, token],
  );

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  const applyVoucher = useCallback(async () => {
    if (!token) return;
    if (!voucherCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await checkoutService.applyVoucher(token, {
        code: voucherCode.trim(),
      });
      setPreview(response.data);
    } catch (err: any) {
      setError(err.message ?? "Unable to apply the voucher.");
    } finally {
      setLoading(false);
    }
  }, [token, voucherCode]);

  const placeOrder = useCallback(async () => {
    if (!token || !selectedAddressId || !selectedPaymentMethodId) {
      throw new Error("Please select an address and a payment method.");
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: CreateOrderPayload = {
        addressId: selectedAddressId,
        paymentMethodId: selectedPaymentMethodId,
        voucherCode: voucherCode.trim() || undefined,
        note: note.trim() || undefined,
      };

      const response = await checkoutService.createOrder(token, payload);
      return response;
    } catch (err: any) {
      const message = err.message ?? "Unable to place the order.";
      setError(message);
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  }, [note, selectedAddressId, selectedPaymentMethodId, token, voucherCode]);

  const pricing = useMemo(() => {
    if (!preview) {
      return {
        subtotal: 0,
        shippingFee: 0,
        discount: 0,
        totalAmount: 0,
      };
    }

    return preview.pricing;
  }, [preview]);

  return {
    preview,
    loading,
    submitting,
    error,
    voucherCode,
    selectedAddressId,
    selectedPaymentMethodId,
    note,
    pricing,
    setVoucherCode,
    setSelectedAddressId,
    setSelectedPaymentMethodId,
    setNote,
    applyVoucher,
    fetchPreview,
    placeOrder,
  };
}
