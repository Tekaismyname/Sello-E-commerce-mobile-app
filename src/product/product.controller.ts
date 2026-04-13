import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get(':productId')
  getProductDetail(@Param('productId', ParseIntPipe) productId: number) {
    return this.productService.getProductDetail(productId);
  }
}
