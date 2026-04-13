import { AdminLevel, UserRole } from '../../auth/types/auth.types';

export class UpdateSystemConfigDto {
  categoryStatuses?: Array<{ categoryId: number; status: 'active' | 'inactive' }>;
  paymentMethodStatuses?: Array<{
    paymentMethodId: number;
    status: 'active' | 'inactive';
  }>;
  voucherStatuses?: Array<{ voucherId: number; isActive: boolean }>;
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
