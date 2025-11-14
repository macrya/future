import { Router } from 'express';
import { driverController } from '../controllers/driver.controller';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import {
  registerDriverSchema,
  updateDriverStatusSchema,
  updateLocationSchema,
} from '../validators/driver.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/register', authorize('DRIVER'), validate(registerDriverSchema), driverController.registerDriver);
router.get('/nearby', driverController.getNearbyDrivers);
router.get('/', authorize('ADMIN'), driverController.getAllDrivers);
router.get('/:id', driverController.getDriverById);
router.get('/:id/stats', driverController.getDriverStats);
router.patch('/:id/status', authorize('DRIVER', 'ADMIN'), validate(updateDriverStatusSchema), driverController.updateDriverStatus);
router.patch('/:id/location', authorize('DRIVER'), validate(updateLocationSchema), driverController.updateLocation);
router.post('/:id/approve', authorize('ADMIN'), driverController.approveDriver);

export default router;
