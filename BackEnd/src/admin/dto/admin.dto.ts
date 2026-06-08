import { AdminLevel, UserRole } from '../../auth/types/auth.types';

export class UpdateSystemConfigDto {
  categoryStatuses?: Array<{ categoryId: number; status: 'active' | 'inactive' }>;
  paymentMethodStatuses?: Array<{
    paymentMethodId: number;
    status: 'active' | 'inactive';
  }>;
  voucherStatuses?: Array<{ voucherId: number; isActive: boolean }>;
}

export class CreateCategoryDto {
  name!: string;
  slug?: string;
  imageUrl?: string | null;
  parentId?: number | null;
  description?: string | null;
  status?: 'active' | 'inactive';
}

export class UpdateCategoryDto {
  name?: string;
  slug?: string | null;
  imageUrl?: string | null;
  parentId?: number | null;
  description?: string | null;
  status?: 'active' | 'inactive';
}

export class UpdateCategoryStatusDto {
  status!: 'active' | 'inactive';
}

export class CreateBrandDto {
  name!: string;
  slug?: string | null;
  logoUrl?: string | null;
  status?: 'active' | 'inactive';
}

export class UpdateBrandDto {
  name?: string;
  slug?: string | null;
  logoUrl?: string | null;
  status?: 'active' | 'inactive';
}

export class UpdateBrandStatusDto {
  status!: 'active' | 'inactive';
}

export class CreateVoucherDto {
  code!: string;
  name!: string;
  description?: string | null;
  voucherType!: 'product' | 'shipping' | 'cashback';
  discountType!: 'percent' | 'fixed';
  discountValue!: number;
  maxDiscountValue?: number | null;
  minOrderValue?: number;
  usageLimit?: number;
  startAt?: string | null;
  endAt?: string | null;
  isActive?: boolean;
}

export class UpdateVoucherDto {
  code?: string;
  name?: string;
  description?: string | null;
  voucherType?: 'product' | 'shipping' | 'cashback';
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  maxDiscountValue?: number | null;
  minOrderValue?: number;
  usageLimit?: number;
  startAt?: string | null;
  endAt?: string | null;
  isActive?: boolean;
}

export class UpdateVoucherStatusDto {
  isActive!: boolean;
}

export class CreateAdminNotificationDto {
  title!: string;
  content!: string;
  targetScope!: 'all_users' | 'customer_only' | 'admin_only';
  notificationType?: 'promotion' | 'order' | 'system';
  imageUrl?: string | null;
}

export class ModerateReviewDto {
  status!: 'visible' | 'hidden' | 'deleted';
  note?: string | null;
}

export class UpdateUserStatusDto {
  status!: 'active' | 'blocked';
}

export class UpdateUserRoleDto {
  role!: UserRole;
  adminLevel?: AdminLevel | null;
}

export class UpdateOrderStatusDto {
  status!:
    | 'pending'
    | 'confirmed'
    | 'packed'
    | 'shipping'
    | 'delivered'
    | 'cancelled'
    | 'returned';
  description?: string;
}

export class CreateProductImageDto {
  imageUrl!: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export class CreateProductVariantDto {
  skuVariant?: string;
  color?: string;
  size?: string;
  price!: number;
  stockQty?: number;
  weight?: number | null;
  imageUrl?: string;
  status?: 'active' | 'inactive';
}

export class CreateProductDto {
  categoryId!: number;
  brandId?: number | null;
  name!: string;
  slug?: string;
  sku?: string;
  shortDescription?: string;
  description?: string;
  basePrice!: number;
  comparePrice?: number | null;
  warrantyMonths?: number;
  status?: 'draft' | 'active' | 'out_of_stock' | 'inactive';
  images?: CreateProductImageDto[];
  variants?: CreateProductVariantDto[];
}

export class UpdateProductDto {
  categoryId?: number;
  brandId?: number | null;
  name?: string;
  slug?: string;
  sku?: string;
  shortDescription?: string;
  description?: string;
  basePrice?: number;
  comparePrice?: number | null;
  warrantyMonths?: number;
  status?: 'draft' | 'active' | 'out_of_stock' | 'inactive';
  images?: CreateProductImageDto[];
  variants?: CreateProductVariantDto[];
}

export class UpdateProductStatusDto {
  status!: 'draft' | 'active' | 'out_of_stock' | 'inactive';
}

export class ExportReportDto {
  reportType!: 'overview';
  format!: 'csv' | 'json';
}

export class ProcessReturnDto {
  action!: 'approve' | 'reject';
  description?: string;
}
