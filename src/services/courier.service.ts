import api from '@/lib/axios'
import { ApiResponse, Courier, Location, CourierStats, PaginatedResponse } from '@/types'

export const courierService = {
  async getCourier(id: string): Promise<ApiResponse<Courier>> {
    const response = await api.get(`/couriers/${id}`)
    return response.data
  },

  async getCouriers(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<ApiResponse<PaginatedResponse<Courier>>> {
    const response = await api.get('/couriers', { params })
    return response.data
  },

  async updateCourierStatus(status: string): Promise<ApiResponse<Courier>> {
    const response = await api.put('/couriers/status', { status })
    return response.data
  },

  async updateCourierLocation(location: Location): Promise<ApiResponse<void>> {
    const response = await api.put('/couriers/location', location)
    return response.data
  },

  async getCourierStats(): Promise<ApiResponse<CourierStats>> {
    const response = await api.get('/couriers/stats')
    return response.data
  },

  async getAvailableCouriers(location: Location): Promise<ApiResponse<Courier[]>> {
    const response = await api.post('/couriers/available', { location })
    return response.data
  },

  async getCourierEarnings(params?: {
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<{ total: number; breakdown: any[] }>> {
    const response = await api.get('/couriers/earnings', { params })
    return response.data
  },
}
