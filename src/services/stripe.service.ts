import Stripe from 'stripe';
import { config } from '../config';
import { logger } from '../utils/logger';
import { InternalServerError } from '../utils/errors';

class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: '2024-11-20.acacia',
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info(`Payment intent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      logger.error(`Stripe payment intent error: ${error}`);
      throw new InternalServerError('Failed to create payment intent');
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      logger.error(`Stripe payment confirmation error: ${error}`);
      throw new InternalServerError('Failed to confirm payment');
    }
  }

  async refundPayment(
    paymentIntentId: string,
    amount?: number
  ): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      logger.info(`Refund created: ${refund.id}`);
      return refund;
    } catch (error) {
      logger.error(`Stripe refund error: ${error}`);
      throw new InternalServerError('Failed to process refund');
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      logger.error(`Stripe retrieve payment error: ${error}`);
      throw new InternalServerError('Failed to retrieve payment');
    }
  }

  async constructWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): Promise<Stripe.Event> {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        config.stripe.webhookSecret
      );
    } catch (error) {
      logger.error(`Stripe webhook error: ${error}`);
      throw new InternalServerError('Invalid webhook signature');
    }
  }

  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
      });

      return customer;
    } catch (error) {
      logger.error(`Stripe create customer error: ${error}`);
      throw new InternalServerError('Failed to create customer');
    }
  }
}

export const stripeService = new StripeService();
