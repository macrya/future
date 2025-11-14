import { Router } from 'express';
import { deliveryController } from '../controllers/delivery.controller';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import {
  createDeliverySchema,
  updateDeliveryStatusSchema,
  assignDriverSchema,
} from '../validators/delivery.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', authorize('CUSTOMER'), validate(createDeliverySchema), deliveryController.createDelivery);
router.get('/', deliveryController.getMyDeliveries);
router.get('/estimate', deliveryController.estimatePrice);
router.get('/:id', deliveryController.getDeliveryById);
router.patch('/:id/status', authorize('DRIVER', 'ADMIN'), validate(updateDeliveryStatusSchema), deliveryController.updateDeliveryStatus);
router.post('/:id/assign', authorize('ADMIN'), validate(assignDriverSchema), deliveryController.assignDriver);
router.post('/:id/cancel', deliveryController.cancelDelivery);

export default router;
