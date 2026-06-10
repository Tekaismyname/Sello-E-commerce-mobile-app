import nodemailer from 'nodemailer';
import { EmailService } from './email.service';

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(),
  },
}));

describe('EmailService', () => {
  const createTransportMock = jest.mocked(nodemailer.createTransport);
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      SMTP_HOST: 'smtp.gmail.com',
      SMTP_PORT: '587',
      SMTP_USER: 'test@example.com',
      SMTP_PASS: 'app-password',
      SMTP_FROM: 'Sello Ecommerce <test@example.com>',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return smtp_auth_failed instead of throwing when SMTP auth is rejected', async () => {
    createTransportMock.mockReturnValue({
      sendMail: jest.fn().mockRejectedValue({
        code: 'EAUTH',
        responseCode: 535,
      }),
    } as any);

    const service = new EmailService();

    await expect(
      service.sendOtpEmail({
        to: 'customer@example.com',
        otpCode: '123456',
        purpose: 'reset_password',
        expiredAt: new Date('2026-06-10T14:30:00.000Z'),
      }),
    ).resolves.toEqual({
      delivered: false,
      reason: 'smtp_auth_failed',
      errorCode: 'EAUTH',
    });
  });

  it('should skip sending when SMTP is not configured', async () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    const service = new EmailService();

    await expect(
      service.sendOtpEmail({
        to: 'customer@example.com',
        otpCode: '123456',
        purpose: 'register',
        expiredAt: new Date('2026-06-10T14:30:00.000Z'),
      }),
    ).resolves.toEqual({
      delivered: false,
      reason: 'smtp_not_configured',
    });
    expect(createTransportMock).not.toHaveBeenCalled();
  });
});
