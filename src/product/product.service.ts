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
}
