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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return {
      message: 'Current authenticated user',
      user: request.user,
    };
  }

  @Get('admin/ping')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminPing(@Req() request: AuthenticatedRequest) {
    return {
      message: 'Admin access granted',
      user: request.user,
    };
  }

  @Delete('users/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  deleteUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.authService.deleteUser(userId);
  }
}
