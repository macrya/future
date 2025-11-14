import Joi from 'joi';

export const registerDriverSchema = Joi.object({
  vehicleType: Joi.string().valid('MOTORCYCLE', 'CAR', 'VAN', 'TRUCK').required(),
  vehicleModel: Joi.string().required(),
  vehiclePlate: Joi.string().required(),
  licenseNumber: Joi.string().required(),
  bankAccount: Joi.string().optional(),
  idDocument: Joi.string().optional(),
  licenseDocument: Joi.string().optional(),
});

export const updateDriverStatusSchema = Joi.object({
  status: Joi.string().valid('OFFLINE', 'ONLINE', 'BUSY').required(),
});

export const updateLocationSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});
