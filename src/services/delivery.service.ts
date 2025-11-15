import api from '@/lib/axios'
import {
  ApiResponse,
  Delivery,
  CreateDeliveryFormData,
  PaginatedResponse,
  Pricing,
} from '@/types'

export const deliveryService = {
  async createDelivery(data: CreateDeliveryFormData): Promise<ApiResponse<Delivery>> {
    const response = await api.post('/deliveries', data)
    return response.data
  },

  async getDelivery(id: string): Promise<ApiResponse<Delivery>> {
    const response = await api.get(`/deliveries/${id}`)
    return response.data
  },

  async getDeliveries(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<ApiResponse<PaginatedResponse<Delivery>>> {
    const response = await api.get('/deliveries', { params })
    return response.data
  },

  async getMyDeliveries(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<ApiResponse<PaginatedResponse<Delivery>>> {
    const response = await api.get('/deliveries/my', { params })
    return response.data
  },

  async getCourierDeliveries(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<ApiResponse<PaginatedResponse<Delivery>>> {
    const response = await api.get('/deliveries/courier', { params })
    return response.data
  },

  async cancelDelivery(id: string, reason?: string): Promise<ApiResponse<Delivery>> {
    const response = await api.post(`/deliveries/${id}/cancel`, { reason })
    return response.data
  },

  async updateDeliveryStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<ApiResponse<Delivery>> {
    const response = await api.put(`/deliveries/${id}/status`, { status, notes })
    return response.data
  },

  async acceptDelivery(id: string): Promise<ApiResponse<Delivery>> {
    const response = await api.post(`/deliveries/${id}/accept`)
    return response.data
  },

  async rejectDelivery(id: string, reason?: string): Promise<ApiResponse<Delivery>> {
    const response = await api.post(`/deliveries/${id}/reject`, { reason })
    return response.data
  },

  async estimatePrice(
    pickupLat: number,
    pickupLng: number,
    deliveryLat: number,
    deliveryLng: number
  ): Promise<ApiResponse<Pricing>> {
    const response = await api.post('/deliveries/estimate', {
      pickup: { lat: pickupLat, lng: pickupLng },
      delivery: { lat: deliveryLat, lng: deliveryLng },
    })
    return response.data
  },

  async trackDelivery(id: string): Promise<ApiResponse<Delivery>> {
    const response = await api.get(`/deliveries/${id}/track`)
    return response.data
  },

  async rateDelivery(
    id: string,
    rating: number,
    review?: string
  ): Promise<ApiResponse<void>> {
    const response = await api.post(`/deliveries/${id}/rate`, { rating, review })
    return response.data
  },
}
