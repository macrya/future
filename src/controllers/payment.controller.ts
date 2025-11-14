import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from '../middleware/auth';
import { paymentService } from '../services/payment.service';

export const paymentController = {
  async initiatePayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payment = await paymentService.initiatePayment(req.body);

      res.status(201).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  },

  async mpesaCallback(req: Request, res: Response, next: NextFunction) {
    try {
      await paymentService.handleMpesaCallback(req.body);

      res.json({
        success: true,
        message: 'Callback processed',
      });
    } catch (error) {
      next(error);
    }
  },

  async confirmCardPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { paymentIntentId } = req.body;
      const payment = await paymentService.confirmCardPayment(paymentIntentId);

      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  },

  async confirmCashPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { deliveryId } = req.body;
      const payment = await paymentService.confirmCashPayment(deliveryId);

      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPaymentByDelivery(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { deliveryId } = req.params;
      const payment = await paymentService.getPaymentByDeliveryId(deliveryId);

      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  },

  async refundPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { deliveryId } = req.body;
      const payment = await paymentService.refundPayment(deliveryId);

      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  },
};
