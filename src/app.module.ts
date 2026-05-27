import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { RequestAuditInterceptor } from './common/interceptors/request-audit.interceptor';
import { CatalogModule } from './catalog/catalog.module';
import { CustomerModule } from './customer/customer.module';
import { ProductModule } from './product/product.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [AuthModule, CatalogModule, AdminModule, ProductModule, CustomerModule, ChatModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestAuditInterceptor,
    },
  ],
})
export class AppModule {}
