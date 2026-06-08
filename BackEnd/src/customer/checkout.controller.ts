import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/types/auth.types';
import { CustomerService } from './customer.service';
import {
  ApplyVoucherDto,
  CheckoutPreviewDto,
  CreateOrderDto,
} from './dto/customer.dto';

type AuthenticatedRequest = Request & { user?: JwtPayload };

@Controller()
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('checkout/preview')
  previewCheckout(
    @Req() request: AuthenticatedRequest,
    @Body() payload: CheckoutPreviewDto,
  ) {
    return this.customerService.previewCheckout(request.user!.sub, payload);
  }

  @Post('checkout/apply-voucher')
  applyVoucher(
    @Req() request: AuthenticatedRequest,
    @Body() payload: ApplyVoucherDto,
  ) {
    return this.customerService.applyVoucher(request.user!.sub, payload);
  }

  @Post('orders')
  createOrder(
    @Req() request: AuthenticatedRequest,
    @Body() payload: CreateOrderDto,
  ) {
    return this.customerService.createOrder(request.user!.sub, payload);
  }
}
