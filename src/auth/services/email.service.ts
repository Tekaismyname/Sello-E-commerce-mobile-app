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

type SendOtpEmailResult = {
  delivered: boolean;
  reason?: 'smtp_not_configured' | 'smtp_auth_failed' | 'smtp_send_failed';
  errorCode?: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private readonly host = process.env.SMTP_HOST;
  private readonly port = Number(process.env.SMTP_PORT ?? 587);
  private readonly user = process.env.SMTP_USER;
  private readonly pass = process.env.SMTP_PASS;
  private readonly from = process.env.SMTP_FROM ?? this.user ?? 'no-reply@sello.local';

  async sendOtpEmail(input: SendOtpEmailInput): Promise<SendOtpEmailResult> {
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

    try {
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
    } catch (error) {
      const normalizedError = this.normalizeSendError(error);

      this.logger.error(
        `Failed to send OTP email to ${input.to}: ${normalizedError.logMessage}`,
      );

      return {
        delivered: false,
        reason: normalizedError.reason,
        errorCode: normalizedError.errorCode,
      };
    }

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

  private normalizeSendError(error: unknown) {
    const errorCode =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string'
        ? error.code
        : 'UNKNOWN';
    const responseCode =
      typeof error === 'object' &&
      error !== null &&
      'responseCode' in error &&
      typeof error.responseCode === 'number'
        ? error.responseCode
        : undefined;

    if (errorCode === 'EAUTH') {
      return {
        reason: 'smtp_auth_failed' as const,
        errorCode,
        logMessage:
          'SMTP authentication failed. Check SMTP_USER and SMTP_PASS. Gmail requires a valid app password.',
      };
    }

    return {
      reason: 'smtp_send_failed' as const,
      errorCode,
      logMessage: responseCode
        ? `SMTP send failed with code ${errorCode} (response ${responseCode}).`
        : `SMTP send failed with code ${errorCode}.`,
    };
  }
}
