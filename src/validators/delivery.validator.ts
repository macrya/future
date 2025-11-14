import Joi from 'joi';

export const createDeliverySchema = Joi.object({
  pickupAddress: Joi.string().required(),
  pickupLatitude: Joi.number().min(-90).max(90).required(),
  pickupLongitude: Joi.number().min(-180).max(180).required(),
  pickupContactName: Joi.string().required(),
  pickupContactPhone: Joi.string().required(),
  deliveryAddress: Joi.string().required(),
  deliveryLatitude: Joi.number().min(-90).max(90).required(),
  deliveryLongitude: Joi.number().min(-180).max(180).required(),
  deliveryContactName: Joi.string().required(),
  deliveryContactPhone: Joi.string().required(),
  packageDescription: Joi.string().required(),
  packageWeight: Joi.number().positive().optional(),
  packageValue: Joi.number().positive().optional(),
  scheduledPickupTime: Joi.date().iso().optional(),
  notes: Joi.string().optional(),
});

export const updateDeliveryStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      'PENDING',
      'SEARCHING_DRIVER',
      'DRIVER_ASSIGNED',
      'DRIVER_ARRIVED',
      'PICKED_UP',
      'IN_TRANSIT',
      'DELIVERED',
      'CANCELLED'
    )
    .required(),
  notes: Joi.string().optional(),
});

export const assignDriverSchema = Joi.object({
  driverId: Joi.string().uuid().required(),
});
