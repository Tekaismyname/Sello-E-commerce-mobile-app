import type { Order } from "@/types/customer";
import type { Href } from "expo-router";

const ACTIVE_ORDER_STATUSES = new Set(["pending", "confirmed"]);
const CONTINUABLE_PAYMENT_STATUSES = new Set(["pending", "unpaid", "processing"]);
const COMPLETED_PAYMENT_STATUSES = new Set(["paid", "success", "completed"]);

const normalizeStatus = (value?: string | null) => (value ?? "").trim().toLowerCase();

const getPaymentType = (order: Order) => {
  const methodCode = normalizeStatus(order.payment?.methodCode);

  if (methodCode === "cod") return "cod";
  if (methodCode === "paypal") return "paypal";
  return methodCode || "online";
};

export const canContinueOrderPayment = (order: Order) => {
  const paymentType = getPaymentType(order);
  const orderPaymentStatus = normalizeStatus(order.paymentStatus);
  const paymentStatus = normalizeStatus(order.payment?.paymentStatus);
  const knownPaymentStatuses = [paymentStatus, orderPaymentStatus].filter(Boolean);

  return (
    ACTIVE_ORDER_STATUSES.has(order.status) &&
    paymentType !== "cod" &&
    !!order.payment?.id &&
    !knownPaymentStatuses.some((status) => COMPLETED_PAYMENT_STATUSES.has(status)) &&
    knownPaymentStatuses.some((status) => CONTINUABLE_PAYMENT_STATUSES.has(status))
  );
};

export const buildOrderPaymentHref = (order: Order): Href => {
  const payment = order.payment;
  const paymentType = getPaymentType(order);
  const params = new URLSearchParams({
    orderId: String(order.id),
    paymentId: String(payment?.id ?? 0),
    amount: String(payment?.amount || order.totalAmount || 0),
    method: payment?.methodName || payment?.methodCode || "Thanh toan",
    paymentType,
  });

  if (payment?.qrCodeUrl) {
    params.set("qrCodeUrl", payment.qrCodeUrl);
  }

  if (payment?.paymentUrl) {
    params.set("paymentUrl", payment.paymentUrl);
  }

  return (`/main/payment?${params.toString()}` as unknown) as Href;
};
