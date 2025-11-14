import Joi from 'joi';

export const initiatePaymentSchema = Joi.object({
  deliveryId: Joi.string().uuid().required(),
  method: Joi.string().valid('MPESA', 'CARD', 'CASH').required(),
  phoneNumber: Joi.string().when('method', {
    is: 'MPESA',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

export const confirmCardPaymentSchema = Joi.object({
  paymentIntentId: Joi.string().required(),
});

export const confirmCashPaymentSchema = Joi.object({
  deliveryId: Joi.string().uuid().required(),
});
