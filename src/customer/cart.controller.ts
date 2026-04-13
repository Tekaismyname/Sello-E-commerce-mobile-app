import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/types/auth.types';
import { CustomerService } from './customer.service';
import {
  AddCartItemDto,
  SelectCartItemDto,
  UpdateCartItemDto,
} from './dto/customer.dto';

type AuthenticatedRequest = Request & { user?: JwtPayload };

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  getCart(@Req() request: AuthenticatedRequest) {
    return this.customerService.getCart(request.user!.sub);
  }

  @Post('items')
  addCartItem(
    @Req() request: AuthenticatedRequest,
    @Body() payload: AddCartItemDto,
  ) {
    return this.customerService.addCartItem(request.user!.sub, payload);
  }

  @Put('items/:cartItemId')
  updateCartItem(
    @Req() request: AuthenticatedRequest,
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
    @Body() payload: UpdateCartItemDto,
  ) {
    return this.customerService.updateCartItem(
      request.user!.sub,
      cartItemId,
      payload,
    );
  }

  @Patch('items/:cartItemId/select')
  selectCartItem(
    @Req() request: AuthenticatedRequest,
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
    @Body() payload: SelectCartItemDto,
  ) {
    return this.customerService.selectCartItem(
      request.user!.sub,
      cartItemId,
      payload,
    );
  }

  @Delete('items/:cartItemId')
  deleteCartItem(
    @Req() request: AuthenticatedRequest,
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
  ) {
    return this.customerService.deleteCartItem(request.user!.sub, cartItemId);
  }

  @Get('summary')
  getCartSummary(@Req() request: AuthenticatedRequest) {
    return this.customerService.getCartSummary(request.user!.sub);
  }
}
