import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { EmailService } from './services/email.service';
import { JwtTokenService } from './services/jwt-token.service';
import { MySqlDatabaseService } from './services/mysql-database.service';
import { OtpService } from './services/otp.service';
import { PasswordService } from './services/password.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    JwtTokenService,
    JwtAuthGuard,
    MySqlDatabaseService,
    OtpService,
    PasswordService,
    RolesGuard,
  ],
  exports: [JwtTokenService, MySqlDatabaseService],
})
export class AuthModule {}
