import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { CustomerModule } from './customer/customer.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [AuthModule, CatalogModule, AdminModule, ProductModule, CustomerModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
