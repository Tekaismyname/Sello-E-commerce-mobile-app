export const CANCEL_REASON_CODES = [
  { code: 'CHANGED_MIND', label: 'Đổi ý, không muốn mua nữa' },
  { code: 'FOUND_CHEAPER', label: 'Tìm thấy giá tốt hơn ở nơi khác' },
  { code: 'WRONG_ORDER', label: 'Đặt nhầm sản phẩm hoặc thông tin' },
  { code: 'SHIPPING_TOO_SLOW', label: 'Thời gian giao hàng dự kiến quá lâu' },
  { code: 'OTHER', label: 'Lý do khác' },
] as const;

export const RETURN_REASON_CODES = [
  { code: 'WRONG_ITEM', label: 'Nhận sai sản phẩm' },
  { code: 'DAMAGED', label: 'Sản phẩm bị hư hỏng hoặc lỗi' },
  { code: 'NOT_AS_DESCRIBED', label: 'Sản phẩm không đúng như mô tả' },
  { code: 'CHANGED_MIND', label: 'Không còn nhu cầu sử dụng' },
  { code: 'LATE_DELIVERY', label: 'Giao hàng quá trễ' },
  { code: 'OTHER', label: 'Lý do khác' },
] as const;

export type CancelReasonCode = (typeof CANCEL_REASON_CODES)[number]['code'];
export type ReturnReasonCode = (typeof RETURN_REASON_CODES)[number]['code'];

export const getCancelReasonLabel = (code?: string | null) =>
  CANCEL_REASON_CODES.find((item) => item.code === code)?.label;

export const getReturnReasonLabel = (code?: string | null) =>
  RETURN_REASON_CODES.find((item) => item.code === code)?.label;
