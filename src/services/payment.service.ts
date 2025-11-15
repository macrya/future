import api from '@/lib/axios'
import {
  ApiResponse,
  MpesaPaymentRequest,
  MpesaPaymentResponse,
  CardPaymentRequest,
  Payment,
} from '@/types'

export const paymentService = {
  // M-Pesa STK Push
  async initiateMpesaPayment(
    data: MpesaPaymentRequest
  ): Promise<ApiResponse<MpesaPaymentResponse>> {
    const response = await api.post('/payments/mpesa/stk-push', data)
    return response.data
  },

  // Check M-Pesa payment status
  async checkMpesaPaymentStatus(
    checkoutRequestId: string
  ): Promise<ApiResponse<Payment>> {
    const response = await api.get(`/payments/mpesa/status/${checkoutRequestId}`)
    return response.data
  },

  // Card payment (Flutterwave)
  async initiateCardPayment(
    data: CardPaymentRequest
  ): Promise<ApiResponse<{ link: string; transactionId: string }>> {
    const response = await api.post('/payments/card/initiate', data)
    return response.data
  },

  // Verify card payment
  async verifyCardPayment(transactionId: string): Promise<ApiResponse<Payment>> {
    const response = await api.get(`/payments/card/verify/${transactionId}`)
    return response.data
  },

  // Get payment history
  async getPaymentHistory(params?: {
    page?: number
    limit?: number
  }): Promise<ApiResponse<Payment[]>> {
    const response = await api.get('/payments/history', { params })
    return response.data
  },

  // Get payment by ID
  async getPayment(id: string): Promise<ApiResponse<Payment>> {
    const response = await api.get(`/payments/${id}`)
    return response.data
  },

  // Request refund
  async requestRefund(paymentId: string, reason: string): Promise<ApiResponse<void>> {
    const response = await api.post(`/payments/${paymentId}/refund`, { reason })
    return response.data
  },
}
