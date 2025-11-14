import { prisma } from '../utils/database';
import { logger } from '../utils/logger';

interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: string;
  data?: Record<string, any>;
}

class NotificationService {
  async create(notification: NotificationData): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: notification.userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          data: notification.data || {},
        },
      });

      logger.info(`Notification created for user ${notification.userId}`);

      // Here you would integrate with:
      // - Push notification service (Firebase, OneSignal, etc.)
      // - SMS service (Africa's Talking, Twilio, etc.)
      // - Email service (SendGrid, AWS SES, etc.)

      // For now, just log
      logger.info(`Push notification: ${notification.title} - ${notification.message}`);
    } catch (error) {
      logger.error(`Failed to create notification: ${error}`);
    }
  }

  async sendDeliveryUpdate(
    userId: string,
    deliveryId: string,
    status: string,
    message: string
  ): Promise<void> {
    await this.create({
      userId,
      title: 'Delivery Update',
      message,
      type: 'delivery_update',
      data: { deliveryId, status },
    });
  }

  async sendDriverAssigned(
    userId: string,
    deliveryId: string,
    driverName: string
  ): Promise<void> {
    await this.create({
      userId,
      title: 'Driver Assigned',
      message: `${driverName} will handle your delivery`,
      type: 'driver_assigned',
      data: { deliveryId },
    });
  }

  async sendPaymentConfirmation(
    userId: string,
    amount: number,
    method: string
  ): Promise<void> {
    await this.create({
      userId,
      title: 'Payment Confirmed',
      message: `Your payment of ${amount} via ${method} was successful`,
      type: 'payment_confirmed',
      data: { amount, method },
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<any[]> {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export const notificationService = new NotificationService();
