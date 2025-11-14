import { prisma } from '../utils/database';
import { googleMapsService } from './googleMaps.service';
import { notificationService } from './notification.service';
import { calculateDeliveryPrice } from '../utils/distance';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { DeliveryStatus } from '@prisma/client';
import { logger } from '../utils/logger';

interface CreateDeliveryData {
  customerId: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupContactName: string;
  pickupContactPhone: string;
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  deliveryContactName: string;
  deliveryContactPhone: string;
  packageDescription: string;
  packageWeight?: number;
  packageValue?: number;
  scheduledPickupTime?: Date;
  notes?: string;
}

class DeliveryService {
  async createDelivery(data: CreateDeliveryData) {
    // Calculate distance and duration using Google Maps
    const routeInfo = await googleMapsService.getDistanceAndDuration(
      { lat: data.pickupLatitude, lng: data.pickupLongitude },
      { lat: data.deliveryLatitude, lng: data.deliveryLongitude }
    );

    // Calculate estimated cost
    const estimatedCost = calculateDeliveryPrice(
      routeInfo.distance,
      routeInfo.duration
    );

    // Create delivery
    const delivery = await prisma.delivery.create({
      data: {
        customerId: data.customerId,
        pickupAddress: data.pickupAddress,
        pickupLatitude: data.pickupLatitude,
        pickupLongitude: data.pickupLongitude,
        pickupContactName: data.pickupContactName,
        pickupContactPhone: data.pickupContactPhone,
        deliveryAddress: data.deliveryAddress,
        deliveryLatitude: data.deliveryLatitude,
        deliveryLongitude: data.deliveryLongitude,
        deliveryContactName: data.deliveryContactName,
        deliveryContactPhone: data.deliveryContactPhone,
        packageDescription: data.packageDescription,
        packageWeight: data.packageWeight,
        packageValue: data.packageValue,
        scheduledPickupTime: data.scheduledPickupTime,
        notes: data.notes,
        distance: routeInfo.distance,
        estimatedDuration: routeInfo.duration,
        estimatedCost,
        status: DeliveryStatus.PENDING,
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    logger.info(`Delivery created: ${delivery.id}`);

    // Send notification to customer
    await notificationService.create({
      userId: data.customerId,
      title: 'Delivery Created',
      message: `Your delivery request has been created. Estimated cost: ${estimatedCost}`,
      type: 'delivery_created',
      data: { deliveryId: delivery.id },
    });

    return delivery;
  }

  async getDeliveryById(deliveryId: string) {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        customer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        driver: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        payment: true,
        tracking: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!delivery) {
      throw new NotFoundError('Delivery not found');
    }

    return delivery;
  }

  async updateDeliveryStatus(deliveryId: string, status: DeliveryStatus, notes?: string) {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        customer: true,
        driver: true,
      },
    });

    if (!delivery) {
      throw new NotFoundError('Delivery not found');
    }

    const updateData: any = { status };

    // Set timestamps based on status
    if (status === DeliveryStatus.DRIVER_ASSIGNED && !delivery.driverAssignedAt) {
      updateData.driverAssignedAt = new Date();
    } else if (status === DeliveryStatus.PICKED_UP && !delivery.pickedUpAt) {
      updateData.pickedUpAt = new Date();
    } else if (status === DeliveryStatus.DELIVERED && !delivery.deliveredAt) {
      updateData.deliveredAt = new Date();
    } else if (status === DeliveryStatus.CANCELLED && !delivery.cancelledAt) {
      updateData.cancelledAt = new Date();
    }

    const updatedDelivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: updateData,
    });

    // Create tracking record
    await prisma.deliveryTracking.create({
      data: {
        deliveryId,
        latitude: delivery.pickupLatitude,
        longitude: delivery.pickupLongitude,
        status: status.toString(),
        notes,
      },
    });

    // Send notifications
    await notificationService.sendDeliveryUpdate(
      delivery.customerId,
      deliveryId,
      status,
      `Your delivery status has been updated to ${status}`
    );

    logger.info(`Delivery ${deliveryId} status updated to ${status}`);

    return updatedDelivery;
  }

  async assignDriver(deliveryId: string, driverId: string) {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery) {
      throw new NotFoundError('Delivery not found');
    }

    if (delivery.driverId) {
      throw new BadRequestError('Driver already assigned');
    }

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        user: true,
      },
    });

    if (!driver) {
      throw new NotFoundError('Driver not found');
    }

    if (driver.status !== 'ONLINE') {
      throw new BadRequestError('Driver is not available');
    }

    // Assign driver
    const updatedDelivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        driverId,
        status: DeliveryStatus.DRIVER_ASSIGNED,
        driverAssignedAt: new Date(),
      },
    });

    // Update driver status
    await prisma.driver.update({
      where: { id: driverId },
      data: { status: 'BUSY' },
    });

    // Send notifications
    await notificationService.sendDriverAssigned(
      delivery.customerId,
      deliveryId,
      `${driver.user.firstName} ${driver.user.lastName}`
    );

    logger.info(`Driver ${driverId} assigned to delivery ${deliveryId}`);

    return updatedDelivery;
  }

  async getCustomerDeliveries(customerId: string, status?: DeliveryStatus) {
    const where: any = { customerId };
    if (status) {
      where.status = status;
    }

    return await prisma.delivery.findMany({
      where,
      include: {
        driver: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getDriverDeliveries(driverId: string, status?: DeliveryStatus) {
    const where: any = { driverId };
    if (status) {
      where.status = status;
    }

    return await prisma.delivery.findMany({
      where,
      include: {
        customer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async cancelDelivery(deliveryId: string, userId: string) {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery) {
      throw new NotFoundError('Delivery not found');
    }

    if (delivery.status === DeliveryStatus.DELIVERED) {
      throw new BadRequestError('Cannot cancel delivered order');
    }

    if (delivery.status === DeliveryStatus.CANCELLED) {
      throw new BadRequestError('Delivery already cancelled');
    }

    return await this.updateDeliveryStatus(deliveryId, DeliveryStatus.CANCELLED);
  }

  async getActiveDeliveries() {
    return await prisma.delivery.findMany({
      where: {
        status: {
          in: [
            DeliveryStatus.PENDING,
            DeliveryStatus.SEARCHING_DRIVER,
            DeliveryStatus.DRIVER_ASSIGNED,
            DeliveryStatus.PICKED_UP,
            DeliveryStatus.IN_TRANSIT,
          ],
        },
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        driver: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

export const deliveryService = new DeliveryService();
