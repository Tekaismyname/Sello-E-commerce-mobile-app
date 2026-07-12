import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  listProducts(
    @Query()
    query: {
      search?: string;
      categoryId?: string;
      brandId?: string;
      minPrice?: string;
      maxPrice?: string;
      sortBy?: string;
      page?: string;
      limit?: string;
    },
  ) {
    return this.productService.listProducts(query);
  }

  @Get(':productId/reviews')
  getProductReviews(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() query: { page?: string; limit?: string },
  ) {
    return this.productService.getProductReviews(productId, query);
  }

  @Get(':productId')
  getProductDetail(@Param('productId', ParseIntPipe) productId: number) {
    return this.productService.getProductDetail(productId);
  }
}
