export class AddCartItemDto {
  productId!: number;
  variantId?: number | null;
  quantity!: number;
}

export class UpdateCartItemDto {
  quantity!: number;
}

export class SelectCartItemDto {
  selected!: boolean;
}

export class CheckoutPreviewDto {
  voucherCode?: string;
}

export class ApplyVoucherDto {
  code!: string;
}

export class CreateOrderDto {
  addressId!: number;
  paymentMethodId!: number;
  voucherCode?: string;
  note?: string;
}

export class MockPaymentCallbackDto {
  result!: 'success' | 'failed';
}

export class CancelOrderDto {
  reasonCode?: string;
  note?: string;
}

export class RequestReturnDto {
  reasonCode?: string;
  note?: string;
}

export class UpdateProfileDto {
  fullName?: string;
  avatarUrl?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  emailOptIn?: boolean;
}

export class UpdatePasswordDto {
  currentPassword!: string;
  newPassword!: string;
  confirmNewPassword!: string;
}

export class CreateAddressDto {
  recipientName!: string;
  phone!: string;
  province!: string;
  district!: string;
  ward!: string;
  detailAddress!: string;
  addressType?: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
}

export class UpdateAddressDto {
  recipientName?: string;
  phone?: string;
  province?: string;
  district?: string;
  ward?: string;
  detailAddress?: string;
  addressType?: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
}

export class SetDefaultAddressDto {
  isDefault!: boolean;
}

export class CreateReviewDto {
  productId!: number;
  rating!: number;
  title?: string;
  comment?: string;
  media?: Array<{ mediaUrl: string; mediaType?: 'image' | 'video' }>;
}

export class AddWishlistItemDto {
  productId!: number;
}

export class ContactAdminDto {
  subject!: string;
  message!: string;
}
