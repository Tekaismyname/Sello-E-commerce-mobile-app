import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
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
  getMyOrders(
    @Req() request: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.customerService.getMyOrders(request.user!.sub, page, limit);
  }

  @Post('orders/:orderId/return-request')
  @UseGuards(JwtAuthGuard)
  requestOrderReturn(
    @Req() request: AuthenticatedRequest,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body('reason') reason: string,
  ) {
    return this.customerService.requestOrderReturn(
      request.user!.sub,
      orderId,
      reason,
    );
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

  @Get('payments/mock/:paymentId/status')
  getMockPaymentStatus(@Param('paymentId', ParseIntPipe) paymentId: number) {
    return this.customerService.getMockPaymentStatus(paymentId);
  }

  @Get('payments/mock/:paymentId/confirm-page')
  async getMockPaymentConfirmPage(
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Query('token') token: string,
    @Res() response: Response,
  ) {
    const html = await this.customerService.getMockPaymentConfirmPage(
      paymentId,
      token,
    );
    return response.type('html').send(html);
  }

  @Post('payments/mock/:paymentId/confirm')
  async confirmMockPayment(
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Body('token') token: string,
    @Res() response: Response,
  ) {
    const result = await this.customerService.confirmMockPayment(
      paymentId,
      token,
    );

    return response.type('html').send(
      this.buildMockPaymentResultPage(
        'Thanh toan thanh cong',
        `Giao dich ${result.orderCode ?? paymentId} da duoc xac nhan. Ban co the quay lai ung dung Sello.`,
      ),
    );
  }

  @Post('payments/mock/:paymentId/decline')
  async declineMockPayment(
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Body('token') token: string,
    @Res() response: Response,
  ) {
    const result = await this.customerService.declineMockPayment(
      paymentId,
      token,
    );

    return response.type('html').send(
      this.buildMockPaymentResultPage(
        'Da tu choi giao dich',
        `Giao dich ${result.orderCode ?? paymentId} da bi tu choi. Don hang se khong duoc xac nhan thanh toan.`,
      ),
    );
  }

  private buildMockPaymentResultPage(title: string, message: string) {
    return `
      <!doctype html>
      <html lang="vi">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${title}</title>
          <style>
            body { margin: 0; font-family: Arial, sans-serif; background: #eef4f8; color: #16202a; }
            main { min-height: 100vh; display: grid; place-items: center; padding: 24px; box-sizing: border-box; }
            section { width: 100%; max-width: 420px; background: #fff; border-radius: 18px; padding: 24px; box-shadow: 0 16px 40px rgba(15, 76, 107, .14); text-align: center; }
            h1 { margin: 0; font-size: 24px; color: #0f4c6b; }
            p { color: #52616f; line-height: 1.55; }
          </style>
        </head>
        <body><main><section><h1>${title}</h1><p>${message}</p></section></main></body>
      </html>
    `;
  }
}
