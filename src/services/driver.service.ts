import { prisma } from '../utils/database';
import { redisService } from '../utils/redis';
import { calculateDistance } from '../utils/distance';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { DriverStatus, VehicleType } from '@prisma/client';
import { logger } from '../utils/logger';

interface RegisterDriverData {
  userId: string;
  vehicleType: VehicleType;
  vehicleModel: string;
  vehiclePlate: string;
  licenseNumber: string;
  bankAccount?: string;
}

interface UpdateLocationData {
  driverId: string;
  latitude: number;
  longitude: number;
}

class DriverService {
  async registerDriver(data: RegisterDriverData) {
    // Check if driver profile already exists
    const existingDriver = await prisma.driver.findUnique({
      where: { userId: data.userId },
    });

    if (existingDriver) {
      throw new BadRequestError('Driver profile already exists');
    }

    // Check for duplicate vehicle plate or license
    const duplicate = await prisma.driver.findFirst({
      where: {
        OR: [
          { vehiclePlate: data.vehiclePlate },
          { licenseNumber: data.licenseNumber },
        ],
      },
    });

    if (duplicate) {
      throw new BadRequestError('Vehicle plate or license number already registered');
    }

    const driver = await prisma.driver.create({
      data: {
        userId: data.userId,
        vehicleType: data.vehicleType,
        vehicleModel: data.vehicleModel,
        vehiclePlate: data.vehiclePlate,
        licenseNumber: data.licenseNumber,
        bankAccount: data.bankAccount,
        status: DriverStatus.OFFLINE,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    logger.info(`Driver registered: ${driver.id}`);
    return driver;
  }

  async updateDriverStatus(driverId: string, status: DriverStatus) {
    const driver = await prisma.driver.update({
      where: { id: driverId },
      data: { status },
    });

    // Update Redis
    if (status === DriverStatus.ONLINE) {
      await redisService.addOnlineDriver(driverId);
    } else {
      await redisService.removeOnlineDriver(driverId);
    }

    logger.info(`Driver ${driverId} status updated to ${status}`);
    return driver;
  }

  async updateDriverLocation(data: UpdateLocationData) {
    const { driverId, latitude, longitude } = data;

    // Update database
    await prisma.driver.update({
      where: { id: driverId },
      data: {
        currentLatitude: latitude,
        currentLongitude: longitude,
      },
    });

    // Update Redis for real-time tracking
    await redisService.setDriverLocation(driverId, latitude, longitude);

    logger.debug(`Driver ${driverId} location updated: ${latitude}, ${longitude}`);
  }

  async findNearbyDrivers(
    latitude: number,
    longitude: number,
    radiusInMeters: number = 5000
  ) {
    // Get all online drivers
    const onlineDriverIds = await redisService.getOnlineDrivers();

    if (onlineDriverIds.length === 0) {
      return [];
    }

    // Get driver details from database
    const drivers = await prisma.driver.findMany({
      where: {
        id: { in: onlineDriverIds },
        status: DriverStatus.ONLINE,
        isApproved: true,
        currentLatitude: { not: null },
        currentLongitude: { not: null },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Filter by distance
    const nearbyDrivers = drivers
      .map((driver) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          driver.currentLatitude!,
          driver.currentLongitude!
        );

        return {
          ...driver,
          distance,
        };
      })
      .filter((driver) => driver.distance <= radiusInMeters)
      .sort((a, b) => a.distance - b.distance);

    return nearbyDrivers;
  }

  async getDriverById(driverId: string) {
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    if (!driver) {
      throw new NotFoundError('Driver not found');
    }

    return driver;
  }

  async getDriverStats(driverId: string) {
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundError('Driver not found');
    }

    const totalEarnings = await prisma.earning.aggregate({
      where: { driverId },
      _sum: { netAmount: true },
    });

    const pendingEarnings = await prisma.earning.aggregate({
      where: { driverId, isPaid: false },
      _sum: { netAmount: true },
    });

    const completedDeliveries = await prisma.delivery.count({
      where: {
        driverId,
        status: 'DELIVERED',
      },
    });

    return {
      rating: driver.rating,
      totalDeliveries: driver.totalDeliveries,
      completedDeliveries,
      totalEarnings: totalEarnings._sum.netAmount || 0,
      pendingEarnings: pendingEarnings._sum.netAmount || 0,
    };
  }

  async updateDriverRating(driverId: string, newRating: number) {
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundError('Driver not found');
    }

    // Calculate new average rating
    const totalDeliveries = driver.totalDeliveries;
    const currentRating = driver.rating;
    const updatedRating =
      (currentRating * totalDeliveries + newRating) / (totalDeliveries + 1);

    await prisma.driver.update({
      where: { id: driverId },
      data: {
        rating: updatedRating,
        totalDeliveries: totalDeliveries + 1,
      },
    });

    logger.info(`Driver ${driverId} rating updated to ${updatedRating}`);
  }

  async getAllDrivers(status?: DriverStatus) {
    const where: any = { isApproved: true };
    if (status) {
      where.status = status;
    }

    return await prisma.driver.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        rating: 'desc',
      },
    });
  }

  async approveDriver(driverId: string) {
    return await prisma.driver.update({
      where: { id: driverId },
      data: { isApproved: true },
    });
  }
}

export const driverService = new DriverService();
