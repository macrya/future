import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { driverService } from '../services/driver.service';

export const driverController = {
  async registerDriver(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.registerDriver({
        ...req.body,
        userId: req.user!.userId,
      });

      res.status(201).json({
        success: true,
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  },

  async getDriverById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const driver = await driverService.getDriverById(id);

      res.json({
        success: true,
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateDriverStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const driver = await driverService.updateDriverStatus(id, status);

      res.json({
        success: true,
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateLocation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;

      await driverService.updateDriverLocation({
        driverId: id,
        latitude,
        longitude,
      });

      res.json({
        success: true,
        message: 'Location updated',
      });
    } catch (error) {
      next(error);
    }
  },

  async getDriverStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stats = await driverService.getDriverStats(id);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  async getNearbyDrivers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { latitude, longitude, radius } = req.query;

      const drivers = await driverService.findNearbyDrivers(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        radius ? parseInt(radius as string) : undefined
      );

      res.json({
        success: true,
        data: drivers,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllDrivers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const drivers = await driverService.getAllDrivers(status as any);

      res.json({
        success: true,
        data: drivers,
      });
    } catch (error) {
      next(error);
    }
  },

  async approveDriver(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const driver = await driverService.approveDriver(id);

      res.json({
        success: true,
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  },
};
