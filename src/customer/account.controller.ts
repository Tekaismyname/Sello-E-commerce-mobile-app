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
  AddWishlistItemDto,
  CreateAddressDto,
  CreateReviewDto,
  SetDefaultAddressDto,
  UpdateAddressDto,
  UpdatePasswordDto,
  UpdateProfileDto,
} from './dto/customer.dto';

type AuthenticatedRequest = Request & { user?: JwtPayload };

@Controller()
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('me')
  getProfile(@Req() request: AuthenticatedRequest) {
    return this.customerService.getProfile(request.user!.sub);
  }

  @Put('me')
  updateProfile(
    @Req() request: AuthenticatedRequest,
    @Body() payload: UpdateProfileDto,
  ) {
    return this.customerService.updateProfile(request.user!.sub, payload);
  }

  @Put('me/password')
  updatePassword(
    @Req() request: AuthenticatedRequest,
    @Body() payload: UpdatePasswordDto,
  ) {
    return this.customerService.updatePassword(request.user!.sub, payload);
  }

  @Get('addresses')
  listAddresses(@Req() request: AuthenticatedRequest) {
    return this.customerService.listAddresses(request.user!.sub);
  }

  @Post('addresses')
  createAddress(
    @Req() request: AuthenticatedRequest,
    @Body() payload: CreateAddressDto,
  ) {
    return this.customerService.createAddress(request.user!.sub, payload);
  }

  @Put('addresses/:addressId')
  updateAddress(
    @Req() request: AuthenticatedRequest,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() payload: UpdateAddressDto,
  ) {
    return this.customerService.updateAddress(
      request.user!.sub,
      addressId,
      payload,
    );
  }

  @Patch('addresses/:addressId/default')
  setDefaultAddress(
    @Req() request: AuthenticatedRequest,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() payload: SetDefaultAddressDto,
  ) {
    return this.customerService.setDefaultAddress(
      request.user!.sub,
      addressId,
      payload,
    );
  }

  @Delete('addresses/:addressId')
  deleteAddress(
    @Req() request: AuthenticatedRequest,
    @Param('addressId', ParseIntPipe) addressId: number,
  ) {
    return this.customerService.deleteAddress(request.user!.sub, addressId);
  }

  @Get('notifications')
  getNotifications(@Req() request: AuthenticatedRequest) {
    return this.customerService.getNotifications(request.user!.sub);
  }

  @Patch('notifications/:notificationId/read')
  markNotificationRead(
    @Req() request: AuthenticatedRequest,
    @Param('notificationId', ParseIntPipe) notificationId: number,
  ) {
    return this.customerService.markNotificationRead(
      request.user!.sub,
      notificationId,
    );
  }

  @Patch('notifications/read-all')
  markAllNotificationsRead(@Req() request: AuthenticatedRequest) {
    return this.customerService.markAllNotificationsRead(request.user!.sub);
  }

  @Post('wishlist/items')
  addWishlistItem(
    @Req() request: AuthenticatedRequest,
    @Body() payload: AddWishlistItemDto,
  ) {
    return this.customerService.addWishlistItem(request.user!.sub, payload.productId);
  }

  @Get('wishlist')
  getWishlist(@Req() request: AuthenticatedRequest) {
    return this.customerService.getWishlist(request.user!.sub);
  }

  @Delete('wishlist/items/:wishlistItemId')
  deleteWishlistItem(
    @Req() request: AuthenticatedRequest,
    @Param('wishlistItemId', ParseIntPipe) wishlistItemId: number,
  ) {
    return this.customerService.deleteWishlistItem(
      request.user!.sub,
      wishlistItemId,
    );
  }

  @Post('reviews')
  createReview(
    @Req() request: AuthenticatedRequest,
    @Body() payload: CreateReviewDto,
  ) {
    return this.customerService.createReview(request.user!.sub, payload);
  }
}
