import { prisma } from '../utils/database';
import { driverService } from './driver.service';
import { deliveryService } from './delivery.service';
import { notificationService } from './notification.service';
import { redisService } from '../utils/redis';
import { logger } from '../utils/logger';
import { config } from '../config';
import { DeliveryStatus } from '@prisma/client';

/**
 * Uber-like driver matching algorithm
 * This service handles the logic of finding and assigning the best driver for a delivery
 */
class MatchingService {
  async findAndAssignDriver(deliveryId: string): Promise<boolean> {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery) {
      logger.error(`Delivery not found: ${deliveryId}`);
      return false;
    }

    // Update status to searching
    await deliveryService.updateDeliveryStatus(
      deliveryId,
      DeliveryStatus.SEARCHING_DRIVER
    );

    // Find nearby drivers
    const nearbyDrivers = await driverService.findNearbyDrivers(
      delivery.pickupLatitude,
      delivery.pickupLongitude,
      config.matching.searchRadius
    );

    if (nearbyDrivers.length === 0) {
      logger.warn(`No drivers found for delivery ${deliveryId}`);
      return false;
    }

    // Sort by rating and distance (multi-criteria optimization)
    const rankedDrivers = nearbyDrivers.sort((a, b) => {
      // Weighted scoring: 70% rating, 30% proximity
      const scoreA = a.rating * 0.7 + (1 - a.distance / config.matching.searchRadius) * 0.3;
      const scoreB = b.rating * 0.7 + (1 - b.distance / config.matching.searchRadius) * 0.3;
      return scoreB - scoreA;
    });

    // Try to assign to best drivers (top 5)
    const maxAttempts = Math.min(5, rankedDrivers.length);

    for (let i = 0; i < maxAttempts; i++) {
      const driver = rankedDrivers[i];

      // Send request to driver
      const accepted = await this.requestDriverAcceptance(deliveryId, driver.id);

      if (accepted) {
        // Assign driver
        await deliveryService.assignDriver(deliveryId, driver.id);
        logger.info(`Driver ${driver.id} assigned to delivery ${deliveryId}`);
        return true;
      }
    }

    logger.warn(`No driver accepted delivery ${deliveryId}`);
    return false;
  }

  private async requestDriverAcceptance(
    deliveryId: string,
    driverId: string
  ): Promise<boolean> {
    // In a real implementation, this would:
    // 1. Send push notification to driver
    // 2. Wait for driver response (with timeout)
    // 3. Return acceptance status

    // Store request in Redis with timeout
    const requestKey = `delivery:request:${deliveryId}:${driverId}`;
    await redisService.set(
      requestKey,
      'pending',
      config.matching.driverTimeout / 1000
    );

    // Send notification to driver
    await notificationService.create({
      userId: driverId,
      title: 'New Delivery Request',
      message: 'You have a new delivery request',
      type: 'delivery_request',
      data: { deliveryId },
    });

    // For demo purposes, simulate acceptance based on driver rating
    // In production, this would wait for actual driver response via WebSocket
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    // Simulate 80% acceptance rate for high-rated drivers
    const acceptanceRate = driver ? driver.rating / 5 : 0.5;
    const accepted = Math.random() < acceptanceRate;

    if (accepted) {
      await redisService.set(requestKey, 'accepted', 300);
    } else {
      await redisService.set(requestKey, 'rejected', 300);
    }

    return accepted;
  }

  async handleDriverResponse(
    deliveryId: string,
    driverId: string,
    accepted: boolean
  ): Promise<void> {
    const requestKey = `delivery:request:${deliveryId}:${driverId}`;

    if (accepted) {
      await redisService.set(requestKey, 'accepted', 300);

      // Check if delivery is still available
      const delivery = await prisma.delivery.findUnique({
        where: { id: deliveryId },
      });

      if (delivery && !delivery.driverId) {
        await deliveryService.assignDriver(deliveryId, driverId);
      }
    } else {
      await redisService.set(requestKey, 'rejected', 300);
    }
  }

  async startMatchingProcess(deliveryId: string): Promise<void> {
    // Start async matching process
    setTimeout(async () => {
      const assigned = await this.findAndAssignDriver(deliveryId);

      if (!assigned) {
        // Retry after some time or notify customer
        logger.warn(`Could not assign driver for delivery ${deliveryId}`);

        const delivery = await prisma.delivery.findUnique({
          where: { id: deliveryId },
          include: { customer: true },
        });

        if (delivery) {
          await notificationService.create({
            userId: delivery.customerId,
            title: 'Searching for Driver',
            message: 'We are still looking for an available driver for your delivery',
            type: 'driver_search',
            data: { deliveryId },
          });
        }
      }
    }, 1000);
  }

  async optimizeRouteForMultiplePickups(deliveryIds: string[]): Promise<string[]> {
    // Advanced feature: Optimize route for multiple deliveries
    // This would use Google Maps Directions API with waypoints
    // For now, return deliveries in order of creation

    const deliveries = await prisma.delivery.findMany({
      where: {
        id: { in: deliveryIds },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return deliveries.map((d) => d.id);
  }

  async calculateSurgePrice(latitude: number, longitude: number): Promise<number> {
    // Calculate surge pricing based on demand
    const activeDeliveriesInArea = await prisma.delivery.count({
      where: {
        status: {
          in: [DeliveryStatus.PENDING, DeliveryStatus.SEARCHING_DRIVER],
        },
        pickupLatitude: {
          gte: latitude - 0.05, // ~5km radius
          lte: latitude + 0.05,
        },
        pickupLongitude: {
          gte: longitude - 0.05,
          lte: longitude + 0.05,
        },
      },
    });

    const availableDrivers = await driverService.findNearbyDrivers(
      latitude,
      longitude,
      5000
    );

    if (availableDrivers.length === 0) {
      return 2.0; // 2x surge
    }

    const demandToSupplyRatio = activeDeliveriesInArea / availableDrivers.length;

    if (demandToSupplyRatio > 3) {
      return 2.0; // High demand
    } else if (demandToSupplyRatio > 2) {
      return 1.5;
    } else if (demandToSupplyRatio > 1) {
      return 1.2;
    }

    return 1.0; // Normal pricing
  }
}

export const matchingService = new MatchingService();
