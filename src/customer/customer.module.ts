import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AccountController } from './account.controller';
import { CartController } from './cart.controller';
import { CheckoutController } from './checkout.controller';
import { CustomerService } from './customer.service';
import { OrdersController } from './orders.controller';
import { PaypalService } from './paypal.service';

@Module({
  imports: [AuthModule],
  controllers: [
    AccountController,
    CartController,
    CheckoutController,
    OrdersController,
  ],
  providers: [CustomerService, PaypalService],
  exports: [PaypalService],
})
export class CustomerModule {}
