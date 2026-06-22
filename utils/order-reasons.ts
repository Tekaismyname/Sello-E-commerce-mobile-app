export type OrderReasonOption = {
  code: string;
  key: string;
  fallback: string;
};

export const CANCEL_REASON_OPTIONS: OrderReasonOption[] = [
  { code: "CHANGED_MIND", key: "reason_changed_mind", fallback: "Changed my mind" },
  { code: "FOUND_CHEAPER", key: "reason_found_cheaper", fallback: "Found a cheaper price elsewhere" },
  { code: "WRONG_ORDER", key: "reason_wrong_order", fallback: "Ordered the wrong product/info" },
  { code: "SHIPPING_TOO_SLOW", key: "reason_shipping_slow", fallback: "Estimated delivery is too slow" },
  { code: "OTHER", key: "reason_other", fallback: "Other reason" },
];

export const RETURN_REASON_OPTIONS: OrderReasonOption[] = [
  { code: "WRONG_ITEM", key: "reason_wrong_item", fallback: "Received the wrong item" },
  { code: "DAMAGED", key: "reason_damaged", fallback: "Item is damaged or defective" },
  { code: "NOT_AS_DESCRIBED", key: "reason_not_as_described", fallback: "Not as described" },
  { code: "CHANGED_MIND", key: "reason_changed_mind", fallback: "Changed my mind" },
  { code: "LATE_DELIVERY", key: "reason_late_delivery", fallback: "Delivery took too long" },
  { code: "OTHER", key: "reason_other", fallback: "Other reason" },
];

export const getReasonLabel = (code?: string | null): string | undefined => {
  if (!code) return undefined;
  return [...CANCEL_REASON_OPTIONS, ...RETURN_REASON_OPTIONS].find((option) => option.code === code)
    ?.fallback;
};
