import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/types/auth.types';
import { CustomerService } from './customer.service';
import { MockPaymentCallbackDto } from './dto/customer.dto';

type AuthenticatedRequest = Request & { user?: JwtPayload };

@Controller()
export class OrdersController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('orders/me')
  @UseGuards(JwtAuthGuard)
  getMyOrders(@Req() request: AuthenticatedRequest) {
    return this.customerService.getMyOrders(request.user!.sub);
  }

  @Get('orders/:orderId')
  @UseGuards(JwtAuthGuard)
  getOrderDetail(
    @Req() request: AuthenticatedRequest,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.customerService.getOrderDetail(request.user!.sub, orderId);
  }

  @Post('orders/:orderId/cancel')
  @UseGuards(JwtAuthGuard)
  cancelOrder(
    @Req() request: AuthenticatedRequest,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.customerService.cancelOrder(request.user!.sub, orderId);
  }

  @Get('orders/:orderId/tracking')
  @UseGuards(JwtAuthGuard)
  getOrderTracking(
    @Req() request: AuthenticatedRequest,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.customerService.getOrderTracking(request.user!.sub, orderId);
  }

  @Post('payments/mock/:paymentId/callback')
  handleMockPaymentCallback(
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Body() payload: MockPaymentCallbackDto,
  ) {
    return this.customerService.handleMockPaymentCallback(paymentId, payload);
  }
}
