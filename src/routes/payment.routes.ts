import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import {
  initiatePaymentSchema,
  confirmCardPaymentSchema,
  confirmCashPaymentSchema,
} from '../validators/payment.validator';

const router = Router();

// M-Pesa callback - no authentication
router.post('/mpesa/callback', paymentController.mpesaCallback);

// All other routes require authentication
router.use(authenticate);

router.post('/initiate', validate(initiatePaymentSchema), paymentController.initiatePayment);
router.post('/card/confirm', validate(confirmCardPaymentSchema), paymentController.confirmCardPayment);
router.post('/cash/confirm', authorize('DRIVER'), validate(confirmCashPaymentSchema), paymentController.confirmCashPayment);
router.get('/delivery/:deliveryId', paymentController.getPaymentByDelivery);
router.post('/refund', authorize('ADMIN'), paymentController.refundPayment);

export default router;
