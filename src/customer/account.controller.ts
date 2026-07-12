import {
  BadRequestException,
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/types/auth.types';
import { CustomerService } from './customer.service';
import {
  AddWishlistItemDto,
  ContactAdminDto,
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

  @Post('me/contact-admin')
  contactAdmin(
    @Req() request: AuthenticatedRequest,
    @Body() payload: ContactAdminDto,
  ) {
    return this.customerService.contactAdmin(request.user!.sub, payload);
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

  @Post('uploads')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `review-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype?.startsWith('image/')) {
          callback(
            new BadRequestException('Only image files are allowed'),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: { filename: string } | undefined) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return {
      status: 'success',
      url: `/uploads/${file.filename}`,
    };
  }
}
