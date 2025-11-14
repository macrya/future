import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';
import { InternalServerError } from '../utils/errors';

interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

class MpesaService {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  private get baseUrl(): string {
    return config.mpesa.environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(
        `${config.mpesa.consumerKey}:${config.mpesa.consumerSecret}`
      ).toString('base64');

      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Token expires in 1 hour, cache for 50 minutes
      this.tokenExpiresAt = Date.now() + 50 * 60 * 1000;

      return this.accessToken;
    } catch (error) {
      logger.error(`M-Pesa auth error: ${error}`);
      throw new InternalServerError('Failed to authenticate with M-Pesa');
    }
  }

  async initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
    try {
      const token = await this.getAccessToken();
      const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, '')
        .slice(0, -3);

      const password = Buffer.from(
        `${config.mpesa.shortcode}${config.mpesa.passkey}${timestamp}`
      ).toString('base64');

      // Format phone number (remove + and ensure it starts with 254)
      let phone = request.phoneNumber.replace(/\D/g, '');
      if (phone.startsWith('0')) {
        phone = '254' + phone.slice(1);
      } else if (phone.startsWith('254')) {
        // Already formatted
      } else if (phone.startsWith('+254')) {
        phone = phone.slice(1);
      }

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          BusinessShortCode: config.mpesa.shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.ceil(request.amount),
          PartyA: phone,
          PartyB: config.mpesa.shortcode,
          PhoneNumber: phone,
          CallBackURL: config.mpesa.callbackUrl,
          AccountReference: request.accountReference,
          TransactionDesc: request.transactionDesc,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      logger.info(`STK Push initiated: ${response.data.CheckoutRequestID}`);
      return response.data;
    } catch (error: any) {
      logger.error(`STK Push error: ${error.response?.data || error.message}`);
      throw new InternalServerError('Failed to initiate M-Pesa payment');
    }
  }

  async querySTKPushStatus(checkoutRequestId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, '')
        .slice(0, -3);

      const password = Buffer.from(
        `${config.mpesa.shortcode}${config.mpesa.passkey}${timestamp}`
      ).toString('base64');

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        {
          BusinessShortCode: config.mpesa.shortcode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error(`STK Push query error: ${error}`);
      throw new InternalServerError('Failed to query payment status');
    }
  }

  processCallback(callbackData: any): {
    success: boolean;
    transactionId?: string;
    amount?: number;
    phone?: string;
  } {
    try {
      const { Body } = callbackData;
      const { stkCallback } = Body;

      if (stkCallback.ResultCode === 0) {
        // Payment successful
        const metadata = stkCallback.CallbackMetadata.Item;
        const amount = metadata.find((item: any) => item.Name === 'Amount')?.Value;
        const transactionId = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
        const phone = metadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;

        return {
          success: true,
          transactionId,
          amount,
          phone,
        };
      } else {
        // Payment failed
        return {
          success: false,
        };
      }
    } catch (error) {
      logger.error(`Callback processing error: ${error}`);
      return {
        success: false,
      };
    }
  }
}

export const mpesaService = new MpesaService();
