import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminLevelGuard } from './guards/admin-level.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { EmailService } from './services/email.service';
import { JwtTokenService } from './services/jwt-token.service';
import { MySqlDatabaseService } from './services/mysql-database.service';
import { OtpService } from './services/otp.service';
import { PasswordService } from './services/password.service';
import { GoogleStrategy } from '../../google.strategy';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AdminLevelGuard,
    EmailService,
    JwtTokenService,
    JwtAuthGuard,
    MySqlDatabaseService,
    OtpService,
    PasswordService,
    PermissionsGuard,
    RolesGuard,
    GoogleStrategy,
  ],
  exports: [
    JwtTokenService,
    MySqlDatabaseService,
    PasswordService,
    JwtAuthGuard,
    RolesGuard,
    AdminLevelGuard,
    PermissionsGuard,
  ],
})
export class AuthModule {}
