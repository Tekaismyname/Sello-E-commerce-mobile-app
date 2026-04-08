import { Injectable, Logger } from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { CreateOtpInput, OtpDeliveryMethod, UserOtp } from '../types/auth.types';
import { EmailService } from './email.service';
import { MySqlDatabaseService } from './mysql-database.service';

interface IssueOtpInput extends Omit<CreateOtpInput, 'otpCode' | 'expiredAt'> {
  deliveryMethod: OtpDeliveryMethod;
  recipientEmail?: string;
  recipientPhone?: string;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly database: MySqlDatabaseService,
    private readonly emailService: EmailService,
  ) {}

  async issueOtp(input: IssueOtpInput) {
    const otpCode = `${randomInt(100000, 1000000)}`;
    const expiredAt = new Date(Date.now() + 5 * 60 * 1000);

    const otpRecord = await this.database.createOtp({
      ...input,
      otpCode,
      expiredAt,
    });

    if (!otpRecord) {
      throw new Error('Failed to create OTP record');
    }

    this.logger.log(
      `OTP ${otpCode} created for ${otpRecord.targetValue} (${otpRecord.purpose})`,
    );

    if (input.deliveryMethod === 'email' && input.recipientEmail) {
      await this.emailService.sendOtpEmail({
        to: input.recipientEmail,
        otpCode,
        purpose: otpRecord.purpose,
        expiredAt,
      });
    } else if (input.deliveryMethod === 'phone' && input.recipientPhone) {
      this.logger.log(
        `SMS OTP delivery is not integrated yet. OTP ${otpCode} prepared for phone ${input.recipientPhone}.`,
      );
    } else {
      this.logger.warn(
        `No valid OTP recipient provided for ${otpRecord.id}. Delivery skipped.`,
      );
    }

    return otpRecord;
  }

  isOtpUsable(otpRecord: UserOtp, otpCode: string) {
    return (
      !otpRecord.isUsed &&
      otpRecord.otpCode === otpCode &&
      otpRecord.expiredAt.getTime() > Date.now()
    );
  }
}
