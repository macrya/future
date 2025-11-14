import { Router } from 'express';
import authRoutes from './auth.routes';
import deliveryRoutes from './delivery.routes';
import driverRoutes from './driver.routes';
import paymentRoutes from './payment.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/drivers', driverRoutes);
router.use('/payments', paymentRoutes);

export default router;
