import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { deliveryService } from '../services/delivery.service';
import { matchingService } from '../services/matching.service';

export const deliveryController = {
  async createDelivery(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const delivery = await deliveryService.createDelivery({
        ...req.body,
        customerId: req.user!.userId,
      });

      res.status(201).json({
        success: true,
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  },

  async getDeliveryById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const delivery = await deliveryService.getDeliveryById(id);

      res.json({
        success: true,
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyDeliveries(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { role, userId } = req.user!;
      const { status } = req.query;

      let deliveries;
      if (role === 'CUSTOMER') {
        deliveries = await deliveryService.getCustomerDeliveries(
          userId,
          status as any
        );
      } else if (role === 'DRIVER') {
        // Get driver ID from user
        const driver = await deliveryService.getDriverDeliveries(
          userId,
          status as any
        );
        deliveries = driver;
      } else {
        deliveries = await deliveryService.getActiveDeliveries();
      }

      res.json({
        success: true,
        data: deliveries,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateDeliveryStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const delivery = await deliveryService.updateDeliveryStatus(id, status, notes);

      res.json({
        success: true,
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  },

  async assignDriver(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { driverId } = req.body;

      const delivery = await deliveryService.assignDriver(id, driverId);

      res.json({
        success: true,
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  },

  async cancelDelivery(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const delivery = await deliveryService.cancelDelivery(id, req.user!.userId);

      res.json({
        success: true,
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  },

  async estimatePrice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { pickupLat, pickupLng, deliveryLat, deliveryLng } = req.query;

      // Calculate surge pricing
      const surgeFactor = await matchingService.calculateSurgePrice(
        parseFloat(pickupLat as string),
        parseFloat(pickupLng as string)
      );

      res.json({
        success: true,
        data: {
          surgeFactor,
          message: surgeFactor > 1 ? 'High demand - surge pricing active' : 'Normal pricing',
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
