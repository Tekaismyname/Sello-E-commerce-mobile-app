import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AdminLevels } from './decorators/admin-levels.decorator';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/auth.dto';
import { Roles } from './decorators/roles.decorator';
import { LogoutDto } from './dto/logout.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { AdminLevelGuard } from './guards/admin-level.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtPayload } from './types/auth.types';

type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }

  @Post('verify-otp')
  verifyOtp(@Body() payload: VerifyOtpDto) {
    return this.authService.verifyOtp(payload);
  }

  @Post('login')
  login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @Post('forgot-password')
  forgotPassword(@Body() payload: ForgotPasswordDto) {
    return this.authService.forgotPassword(payload);
  }

  @Post('reset-password')
  resetPassword(@Body() payload: ResetPasswordDto) {
    return this.authService.resetPassword(payload);
  }

  @Post('logout')
  logout(@Body() payload: LogoutDto) {
    return this.authService.logout(payload);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  googleAuth() {
    // Endpoint này sẽ tự động redirect đến trang đăng nhập của Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Req() req: AuthenticatedRequest) {
    // Google redirect về đây sau khi user đăng nhập thành công.
    // GoogleStrategy đã xử lý và gắn thông tin user vào req.user.
    return this.authService.oAuthLogin(req.user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return {
      message: 'Current authenticated user',
      user: request.user,
    };
  }

  @Get('admin/ping')
  @UseGuards(JwtAuthGuard, RolesGuard, AdminLevelGuard)
  @Roles('admin')
  @AdminLevels(1, 2, 3)
  adminPing(@Req() request: AuthenticatedRequest) {
    return {
      message: 'Admin access granted',
      user: request.user,
    };
  }

  @Get('admin/operations/ping')
  @UseGuards(JwtAuthGuard, RolesGuard, AdminLevelGuard)
  @Roles('admin')
  @AdminLevels(1, 2)
  adminOperationsPing(@Req() request: AuthenticatedRequest) {
    return {
      message: 'Operations admin access granted',
      user: request.user,
    };
  }

  @Delete('users/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard, AdminLevelGuard)
  @Roles('admin')
  @AdminLevels(1)
  deleteUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.authService.deleteUser(userId);
  }
}
