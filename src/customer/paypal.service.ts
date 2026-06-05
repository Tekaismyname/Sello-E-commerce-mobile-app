import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Injectable()
export class PaypalService {
  private readonly logger = new Logger(PaypalService.name);
  private readonly clientId = process.env.PAYPAL_CLIENT_ID;
  private readonly secret = process.env.PAYPAL_SECRET;
  private readonly apiUrl = process.env.PAYPAL_API_URL ?? 'https://api-m.sandbox.paypal.com';

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.secret}`).toString('base64');
    try {
      const response = await fetch(`${this.apiUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`Failed to get PayPal token: ${errText}`);
        throw new Error('PayPal auth response was not OK');
      }

      const data = await response.json() as { access_token: string };
      return data.access_token;
    } catch (error) {
      this.logger.error('Error fetching PayPal access token:', error);
      throw new HttpException(
        'Không thể lấy Access Token từ PayPal',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createOrder(amountVnd: number, orderCode: string) {
    const accessToken = await this.getAccessToken();
    const exchangeRate = 25000;
    const amountUsd = (amountVnd / exchangeRate).toFixed(2);

    try {
      const response = await fetch(`${this.apiUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: orderCode,
              amount: {
                currency_code: 'USD',
                value: amountUsd,
              },
              description: `Thanh toán đơn hàng Sello #${orderCode}`,
            },
          ],
          application_context: {
            return_url: process.env.PAYPAL_RETURN_URL ?? 'selloecommerce://checkout/paypal/success',
            cancel_url: process.env.PAYPAL_CANCEL_URL ?? 'selloecommerce://checkout/paypal/cancel',
            user_action: 'PAY_NOW',
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`PayPal create order failed: ${errText}`);
        throw new Error('PayPal create order response was not OK');
      }

      const data = await response.json() as any;
      const approvalUrl = data.links.find((link: any) => link.rel === 'approve')?.href;

      return {
        paypalOrderId: data.id,
        approvalUrl,
      };
    } catch (error) {
      this.logger.error('Error creating PayPal order:', error);
      throw new HttpException(
        'Lỗi khi khởi tạo đơn hàng PayPal',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async captureOrder(paypalOrderId: string) {
    const accessToken = await this.getAccessToken();
    try {
      const response = await fetch(`${this.apiUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`PayPal capture order failed: ${errText}`);
        throw new Error('PayPal capture response was not OK');
      }

      const data = await response.json() as any;
      return {
        status: data.status, // COMPLETED
        transactionId: data.purchase_units[0]?.payments?.captures[0]?.id,
      };
    } catch (error) {
      this.logger.error('Error capturing PayPal order:', error);
      throw new HttpException(
        'Không thể hoàn tất giao dịch PayPal',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
