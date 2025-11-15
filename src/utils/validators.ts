import { z } from 'zod'

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Invalid Kenyan phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  role: z.enum(['customer', 'courier']),
  vehicleType: z.enum(['bike', 'motorcycle', 'car', 'van']).optional(),
  vehicleNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.role === 'courier') {
    return data.vehicleType && data.vehicleNumber && data.licenseNumber
  }
  return true
}, {
  message: 'Vehicle details are required for couriers',
  path: ['vehicleType'],
})

// Delivery Schema
export const createDeliverySchema = z.object({
  pickupAddress: z.object({
    street: z.string().min(1, 'Pickup address is required'),
    city: z.string().min(1, 'City is required'),
    location: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  deliveryAddress: z.object({
    street: z.string().min(1, 'Delivery address is required'),
    city: z.string().min(1, 'City is required'),
    location: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  packageDescription: z.string().min(3, 'Package description is required'),
  packageCategory: z.enum(['food', 'package', 'document', 'other']),
  packageWeight: z.number().optional(),
  fragile: z.boolean().default(false),
  notes: z.string().optional(),
  scheduledPickupTime: z.string().optional(),
})

// M-Pesa Payment Schema
export const mpesaPaymentSchema = z.object({
  phoneNumber: z.string().regex(/^(\+254|254|0)[17]\d{8}$/, 'Invalid phone number'),
  amount: z.number().min(1, 'Amount must be at least 1 KES'),
})

// Card Payment Schema
export const cardPaymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, 'Invalid card number'),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Invalid month'),
  expiryYear: z.string().regex(/^\d{2}$/, 'Invalid year'),
  cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV'),
  name: z.string().min(3, 'Name is required'),
  email: z.string().email('Invalid email'),
})

// Address Schema
export const addressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('Kenya'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type CreateDeliveryFormData = z.infer<typeof createDeliverySchema>
export type MpesaPaymentFormData = z.infer<typeof mpesaPaymentSchema>
export type CardPaymentFormData = z.infer<typeof cardPaymentSchema>
export type AddressFormData = z.infer<typeof addressSchema>
