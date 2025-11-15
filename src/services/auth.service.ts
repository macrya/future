import api from '@/lib/axios'
import { ApiResponse, User, LoginFormData, RegisterFormData } from '@/types'

export const authService = {
  async login(data: LoginFormData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  async register(data: RegisterFormData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await api.get('/auth/me')
    return response.data
  },

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await api.put('/auth/profile', data)
    return response.data
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    const response = await api.post('/auth/change-password', {
      oldPassword,
      newPassword,
    })
    return response.data
  },

  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
    })
    return response.data
  },
}
