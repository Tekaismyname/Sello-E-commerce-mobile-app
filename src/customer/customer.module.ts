import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AccountController } from './account.controller';
import { CartController } from './cart.controller';
import { CheckoutController } from './checkout.controller';
import { CustomerService } from './customer.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [AuthModule],
  controllers: [
    AccountController,
    CartController,
    CheckoutController,
    OrdersController,
  ],
  providers: [CustomerService],
})
export class CustomerModule {}
