export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'DeliveryPro'

export const DELIVERY_STATUSES = {
  PENDING: 'pending',
  SEARCHING_COURIER: 'searching_courier',
  COURIER_ASSIGNED: 'courier_assigned',
  COURIER_ARRIVED_PICKUP: 'courier_arrived_pickup',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  COURIER_ARRIVED_DELIVERY: 'courier_arrived_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
} as const

export const DELIVERY_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  searching_courier: 'Searching for Courier',
  courier_assigned: 'Courier Assigned',
  courier_arrived_pickup: 'Courier Arrived at Pickup',
  picked_up: 'Package Picked Up',
  in_transit: 'In Transit',
  courier_arrived_delivery: 'Courier Arrived at Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  failed: 'Failed',
}

export const DELIVERY_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  searching_courier: 'bg-blue-100 text-blue-800',
  courier_assigned: 'bg-indigo-100 text-indigo-800',
  courier_arrived_pickup: 'bg-purple-100 text-purple-800',
  picked_up: 'bg-cyan-100 text-cyan-800',
  in_transit: 'bg-primary-100 text-primary-800',
  courier_arrived_delivery: 'bg-teal-100 text-teal-800',
  delivered: 'bg-success-100 text-success-800',
  cancelled: 'bg-gray-100 text-gray-800',
  failed: 'bg-danger-100 text-danger-800',
}

export const PACKAGE_CATEGORIES = [
  { value: 'food', label: 'Food' },
  { value: 'package', label: 'Package' },
  { value: 'document', label: 'Document' },
  { value: 'other', label: 'Other' },
]

export const VEHICLE_TYPES = [
  { value: 'bike', label: 'Bike' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'car', label: 'Car' },
  { value: 'van', label: 'Van' },
]

export const PAYMENT_METHODS = [
  { value: 'mpesa', label: 'M-Pesa', icon: '📱' },
  { value: 'card', label: 'Card', icon: '💳' },
  { value: 'cash', label: 'Cash on Delivery', icon: '💵' },
]

export const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  libraries: ['places', 'geometry'] as const,
  defaultCenter: {
    lat: -1.286389, // Nairobi
    lng: 36.817223,
  },
  defaultZoom: 13,
}

export const MPESA_CONFIG = {
  consumerKey: process.env.NEXT_PUBLIC_MPESA_CONSUMER_KEY || '',
  consumerSecret: process.env.NEXT_PUBLIC_MPESA_CONSUMER_SECRET || '',
  passkey: process.env.NEXT_PUBLIC_MPESA_PASSKEY || '',
  shortcode: process.env.NEXT_PUBLIC_MPESA_SHORTCODE || '',
  environment: process.env.NEXT_PUBLIC_MPESA_ENVIRONMENT || 'sandbox',
}

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  CUSTOMER_DASHBOARD: '/customer/dashboard',
  CUSTOMER_ORDERS: '/customer/orders',
  CUSTOMER_TRACKING: '/customer/tracking',
  CUSTOMER_PROFILE: '/customer/profile',
  COURIER_DASHBOARD: '/courier/dashboard',
  COURIER_DELIVERIES: '/courier/deliveries',
  COURIER_EARNINGS: '/courier/earnings',
  COURIER_PROFILE: '/courier/profile',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_DELIVERIES: '/admin/deliveries',
  ADMIN_COURIERS: '/admin/couriers',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
}
