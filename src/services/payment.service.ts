import { prisma } from '../utils/database';
import { mpesaService } from './mpesa.service';
import { stripeService } from './stripe.service';
import { notificationService } from './notification.service';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import { config } from '../config';

interface InitiatePaymentData {
  deliveryId: string;
  method: PaymentMethod;
  phoneNumber?: string; // For M-Pesa
}

class PaymentService {
  async initiatePayment(data: InitiatePaymentData) {
    const delivery = await prisma.delivery.findUnique({
      where: { id: data.deliveryId },
      include: {
        payment: true,
        customer: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!delivery) {
      throw new NotFoundError('Delivery not found');
    }

    if (delivery.payment) {
      throw new BadRequestError('Payment already exists for this delivery');
    }

    const amount = delivery.estimatedCost;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        deliveryId: data.deliveryId,
        amount,
        method: data.method,
        status: PaymentStatus.PENDING,
      },
    });

    try {
      if (data.method === PaymentMethod.MPESA) {
        if (!data.phoneNumber) {
          throw new BadRequestError('Phone number required for M-Pesa payment');
        }

        // Initiate STK Push
        const mpesaResponse = await mpesaService.initiateSTKPush({
          phoneNumber: data.phoneNumber,
          amount,
          accountReference: delivery.id,
          transactionDesc: `Payment for delivery ${delivery.id}`,
        });

        // Update payment with M-Pesa details
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            mpesaPhone: data.phoneNumber,
            mpesaRequestId: mpesaResponse.CheckoutRequestID,
            status: PaymentStatus.PROCESSING,
          },
        });

        logger.info(`M-Pesa payment initiated for delivery ${data.deliveryId}`);

        return {
          ...payment,
          mpesaCheckoutRequestId: mpesaResponse.CheckoutRequestID,
          message: mpesaResponse.CustomerMessage,
        };
      } else if (data.method === PaymentMethod.CARD) {
        // Create Stripe payment intent
        const paymentIntent = await stripeService.createPaymentIntent(amount, 'kes', {
          deliveryId: data.deliveryId,
          customerId: delivery.customerId,
        });

        // Update payment with Stripe details
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            stripePaymentId: paymentIntent.id,
            status: PaymentStatus.PROCESSING,
          },
        });

        logger.info(`Card payment initiated for delivery ${data.deliveryId}`);

        return {
          ...payment,
          clientSecret: paymentIntent.client_secret,
        };
      } else if (data.method === PaymentMethod.CASH) {
        // Cash payment - mark as pending
        return payment;
      }
    } catch (error) {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          failureReason: error instanceof Error ? error.message : 'Payment failed',
        },
      });

      throw error;
    }
  }

  async handleMpesaCallback(callbackData: any) {
    const result = mpesaService.processCallback(callbackData);

    if (!result.success) {
      logger.error('M-Pesa payment failed');
      return;
    }

    // Find payment by M-Pesa request ID
    const payment = await prisma.payment.findFirst({
      where: {
        mpesaRequestId: callbackData.Body.stkCallback.CheckoutRequestID,
      },
      include: {
        delivery: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!payment) {
      logger.error('Payment not found for M-Pesa callback');
      return;
    }

    // Update payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        mpesaCode: result.transactionId,
        transactionId: result.transactionId,
        paidAt: new Date(),
      },
    });

    // Update delivery status
    await prisma.delivery.update({
      where: { id: payment.deliveryId },
      data: {
        status: 'SEARCHING_DRIVER',
      },
    });

    // Create driver earnings
    await this.createDriverEarnings(payment.deliveryId, payment.amount);

    // Send notification
    await notificationService.sendPaymentConfirmation(
      payment.delivery.customerId,
      payment.amount,
      'M-Pesa'
    );

    logger.info(`M-Pesa payment completed for delivery ${payment.deliveryId}`);
  }

  async confirmCardPayment(paymentIntentId: string) {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntentId },
      include: {
        delivery: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Verify payment with Stripe
    const paymentIntent = await stripeService.retrievePaymentIntent(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          transactionId: paymentIntent.id,
          cardLast4: paymentIntent.charges.data[0]?.payment_method_details?.card?.last4,
          paidAt: new Date(),
        },
      });

      // Update delivery status
      await prisma.delivery.update({
        where: { id: payment.deliveryId },
        data: {
          status: 'SEARCHING_DRIVER',
        },
      });

      // Create driver earnings
      await this.createDriverEarnings(payment.deliveryId, payment.amount);

      // Send notification
      await notificationService.sendPaymentConfirmation(
        payment.delivery.customerId,
        payment.amount,
        'Card'
      );

      logger.info(`Card payment completed for delivery ${payment.deliveryId}`);

      return payment;
    } else {
      throw new BadRequestError('Payment not completed');
    }
  }

  async confirmCashPayment(deliveryId: string) {
    const payment = await prisma.payment.findFirst({
      where: {
        deliveryId,
        method: PaymentMethod.CASH,
      },
      include: {
        delivery: true,
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Update payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
    });

    // Create driver earnings
    await this.createDriverEarnings(deliveryId, payment.amount);

    logger.info(`Cash payment confirmed for delivery ${deliveryId}`);

    return payment;
  }

  private async createDriverEarnings(deliveryId: string, amount: number) {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery || !delivery.driverId) {
      return;
    }

    const commission = amount * config.pricing.commissionRate;
    const netAmount = amount - commission;

    await prisma.earning.create({
      data: {
        driverId: delivery.driverId,
        amount,
        commission,
        netAmount,
      },
    });

    logger.info(`Earnings created for driver ${delivery.driverId}: ${netAmount}`);
  }

  async getPaymentByDeliveryId(deliveryId: string) {
    const payment = await prisma.payment.findUnique({
      where: { deliveryId },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    return payment;
  }

  async refundPayment(deliveryId: string) {
    const payment = await prisma.payment.findFirst({
      where: { deliveryId },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestError('Can only refund completed payments');
    }

    if (payment.method === PaymentMethod.CARD && payment.stripePaymentId) {
      await stripeService.refundPayment(payment.stripePaymentId);
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.REFUNDED,
      },
    });

    logger.info(`Payment refunded for delivery ${deliveryId}`);

    return payment;
  }
}

export const paymentService = new PaymentService();
