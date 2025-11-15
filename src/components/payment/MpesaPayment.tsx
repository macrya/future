'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Smartphone, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { mpesaPaymentSchema, MpesaPaymentFormData } from '@/utils/validators'
import { paymentService } from '@/services/payment.service'
import { formatPhoneNumber } from '@/utils/format'

interface MpesaPaymentProps {
  amount: number
  deliveryId: string
  onSuccess: () => void
  onCancel: () => void
}

export function MpesaPayment({ amount, deliveryId, onSuccess, onCancel }: MpesaPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MpesaPaymentFormData>({
    resolver: zodResolver(mpesaPaymentSchema),
    defaultValues: {
      amount,
    },
  })

  const onSubmit = async (data: MpesaPaymentFormData) => {
    try {
      setIsProcessing(true)

      const response = await paymentService.initiateMpesaPayment({
        phoneNumber: formatPhoneNumber(data.phoneNumber),
        amount: data.amount,
        accountReference: deliveryId,
        transactionDesc: `Payment for delivery ${deliveryId}`,
      })

      if (response.success && response.data) {
        setCheckoutRequestId(response.data.CheckoutRequestID)
        toast.success(response.data.CustomerMessage || 'Check your phone for M-Pesa prompt')

        // Start polling for payment status
        pollPaymentStatus(response.data.CheckoutRequestID)
      }
    } catch (error) {
      setIsProcessing(false)
      toast.error('Failed to initiate M-Pesa payment')
    }
  }

  const pollPaymentStatus = async (requestId: string) => {
    let attempts = 0
    const maxAttempts = 30 // Poll for 1 minute (30 * 2 seconds)

    const interval = setInterval(async () => {
      attempts++

      try {
        const response = await paymentService.checkMpesaPaymentStatus(requestId)

        if (response.success && response.data) {
          const { status } = response.data

          if (status === 'completed') {
            clearInterval(interval)
            setIsProcessing(false)
            toast.success('Payment successful!')
            onSuccess()
          } else if (status === 'failed') {
            clearInterval(interval)
            setIsProcessing(false)
            toast.error('Payment failed. Please try again.')
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval)
        setIsProcessing(false)
        toast.error('Payment timeout. Please check your M-Pesa messages.')
      }
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
        <Smartphone className="w-8 h-8 text-green-600" />
        <div>
          <h3 className="font-semibold text-green-900">M-Pesa Payment</h3>
          <p className="text-sm text-green-700">Pay with your M-Pesa account</p>
        </div>
      </div>

      {!isProcessing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="M-Pesa Phone Number"
            placeholder="0712345678 or +254712345678"
            {...register('phoneNumber')}
            error={errors.phoneNumber?.message}
            leftIcon={<Smartphone className="w-5 h-5" />}
          />

          <Input
            label="Amount (KES)"
            type="number"
            disabled
            {...register('amount', { valueAsNumber: true })}
            error={errors.amount?.message}
          />

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Instructions:</strong>
              <br />
              1. Enter your M-Pesa registered phone number
              <br />
              2. Click &quot;Pay with M-Pesa&quot;
              <br />
              3. Enter your M-Pesa PIN on your phone
              <br />
              4. Confirm the payment
            </p>
          </div>

          <div className="flex space-x-3">
            <Button type="submit" fullWidth>
              Pay with M-Pesa
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-center py-8 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Processing Payment...</h3>
            <p className="text-gray-600 mt-2">
              Please check your phone for the M-Pesa prompt and enter your PIN
            </p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        </div>
      )}
    </div>
  )
}
