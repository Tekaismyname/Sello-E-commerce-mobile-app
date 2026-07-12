import { Injectable, NotFoundException } from '@nestjs/common';
import { MySqlDatabaseService } from '../auth/services/mysql-database.service';

@Injectable()
export class ProductService {
  constructor(private readonly database: MySqlDatabaseService) {}

  async getProductDetail(productId: number) {
    const product = await this.database.getPublicProductDetail(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      message: 'Product detail fetched successfully',
      data: product,
    };
  }

  async getProductReviews(
    productId: number,
    query: { page?: string; limit?: string },
  ) {
    const result = await this.database.getPublicProductReviews(productId, {
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    });

    if (!result) {
      throw new NotFoundException('Product not found');
    }

    return {
      message: 'Product reviews fetched successfully',
      data: result,
    };
  }

  async listProducts(query: {
    search?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    page?: string;
    limit?: string;
  }) {
    const params = {
      search: query.search,
      categoryId: query.categoryId ? parseInt(query.categoryId, 10) : undefined,
      brandId: query.brandId ? parseInt(query.brandId, 10) : undefined,
      minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
      sortBy: query.sortBy,
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    };

    const result = await this.database.listPublicProducts(params);

    return {
      message: 'Products fetched successfully',
      data: result,
    };
  }
}
