// User Types
export interface User {
  id: string
  email: string
  name: string
  phone: string
  role: 'customer' | 'courier' | 'admin'
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface Customer extends User {
  role: 'customer'
  addresses: Address[]
  defaultPaymentMethod?: string
}

export interface Courier extends User {
  role: 'courier'
  vehicleType: 'bike' | 'motorcycle' | 'car' | 'van'
  vehicleNumber: string
  licenseNumber: string
  status: 'active' | 'inactive' | 'busy' | 'offline'
  currentLocation?: Location
  rating: number
  totalDeliveries: number
  earnings: number
}

// Location Types
export interface Location {
  lat: number
  lng: number
  address?: string
  timestamp?: string
}

export interface Address {
  id: string
  label: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  location: Location
  isDefault: boolean
}

// Delivery Types
export interface Delivery {
  id: string
  customerId: string
  courierId?: string
  pickupAddress: Address
  deliveryAddress: Address
  status: DeliveryStatus
  packageDetails: PackageDetails
  pricing: Pricing
  payment: Payment
  trackingHistory: TrackingEvent[]
  estimatedPickupTime?: string
  estimatedDeliveryTime?: string
  actualPickupTime?: string
  actualDeliveryTime?: string
  distance: number
  duration: number
  route?: Location[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export type DeliveryStatus =
  | 'pending'
  | 'searching_courier'
  | 'courier_assigned'
  | 'courier_arrived_pickup'
  | 'picked_up'
  | 'in_transit'
  | 'courier_arrived_delivery'
  | 'delivered'
  | 'cancelled'
  | 'failed'

export interface PackageDetails {
  description: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  category: 'food' | 'package' | 'document' | 'other'
  fragile: boolean
  value?: number
}

export interface Pricing {
  basePrice: number
  distancePrice: number
  serviceFee: number
  tax: number
  total: number
  currency: 'KES'
}

export interface Payment {
  id: string
  method: 'mpesa' | 'card' | 'cash'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  transactionId?: string
  mpesaReceiptNumber?: string
  cardLast4?: string
  amount: number
  paidAt?: string
}

export interface TrackingEvent {
  id: string
  status: DeliveryStatus
  location?: Location
  timestamp: string
  message: string
  courierNote?: string
}

// M-Pesa Types
export interface MpesaPaymentRequest {
  phoneNumber: string
  amount: number
  accountReference: string
  transactionDesc: string
}

export interface MpesaPaymentResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

export interface MpesaCallback {
  ResultCode: number
  ResultDesc: string
  CallbackMetadata?: {
    Item: Array<{
      Name: string
      Value: string | number
    }>
  }
}

// Card Payment Types
export interface CardPaymentRequest {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  amount: number
  email: string
  name: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'location_update' | 'status_update' | 'delivery_update' | 'courier_assigned'
  data: any
  timestamp: string
}

// Form Types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  role: 'customer' | 'courier'
  vehicleType?: string
  vehicleNumber?: string
  licenseNumber?: string
}

export interface CreateDeliveryFormData {
  pickupAddress: string | Address
  deliveryAddress: string | Address
  packageDescription: string
  packageCategory: 'food' | 'package' | 'document' | 'other'
  packageWeight?: number
  fragile: boolean
  notes?: string
  scheduledPickupTime?: string
}

// Analytics Types
export interface DashboardStats {
  totalDeliveries: number
  activeDeliveries: number
  completedDeliveries: number
  cancelledDeliveries: number
  totalRevenue: number
  averageRating: number
  activeCouriers: number
}

export interface CourierStats {
  totalDeliveries: number
  todayDeliveries: number
  weekDeliveries: number
  totalEarnings: number
  todayEarnings: number
  weekEarnings: number
  rating: number
  acceptanceRate: number
}
