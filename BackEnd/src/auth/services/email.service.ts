import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { AuthPurpose } from '../types/auth.types';

interface SendOtpEmailInput {
  to: string;
  otpCode: string;
  purpose: AuthPurpose;
  expiredAt: Date;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private readonly host = process.env.SMTP_HOST;
  private readonly port = Number(process.env.SMTP_PORT ?? 587);
  private readonly user = process.env.SMTP_USER;
  private readonly pass = process.env.SMTP_PASS;
  private readonly from = process.env.SMTP_FROM ?? this.user ?? 'no-reply@sello.local';

  async sendOtpEmail(input: SendOtpEmailInput) {
    if (!this.isConfigured()) {
      this.logger.warn(
        `SMTP is not configured. Skip sending OTP email to ${input.to}.`,
      );

      return {
        delivered: false,
        reason: 'smtp_not_configured',
      };
    }

    const transporter = nodemailer.createTransport(this.getTransportOptions());
    const purposeLabel =
      input.purpose === 'register' ? 'account verification' : 'password reset';
    const expiresAtLabel = input.expiredAt.toISOString();

    await transporter.sendMail({
      from: this.from,
      to: input.to,
      subject: `Sello OTP for ${purposeLabel}`,
      text: [
        'Your Sello OTP code is below.',
        `OTP: ${input.otpCode}`,
        `Purpose: ${purposeLabel}`,
        `Expires at: ${expiresAtLabel}`,
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Sello OTP</h2>
          <p>You requested an OTP for <strong>${purposeLabel}</strong>.</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${input.otpCode}</p>
          <p>This code expires at <strong>${expiresAtLabel}</strong>.</p>
        </div>
      `,
    });

    this.logger.log(`OTP email sent successfully to ${input.to}`);

    return {
      delivered: true,
    };
  }

  private isConfigured() {
    return Boolean(this.host && this.user && this.pass);
  }

  private getTransportOptions(): SMTPTransport.Options {
    return {
      host: this.host,
      port: this.port,
      secure: this.port === 465,
      auth: {
        user: this.user,
        pass: this.pass,
      },
    };
  }
}
