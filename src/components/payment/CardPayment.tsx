'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { CreditCard } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { cardPaymentSchema, CardPaymentFormData } from '@/utils/validators'
import { paymentService } from '@/services/payment.service'

interface CardPaymentProps {
  amount: number
  deliveryId: string
  onSuccess: () => void
  onCancel: () => void
}

export function CardPayment({ amount, deliveryId, onSuccess, onCancel }: CardPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CardPaymentFormData>({
    resolver: zodResolver(cardPaymentSchema),
  })

  const onSubmit = async (data: CardPaymentFormData) => {
    try {
      setIsProcessing(true)

      const response = await paymentService.initiateCardPayment({
        ...data,
        amount,
        email: data.email,
        name: data.name,
      })

      if (response.success && response.data) {
        // Redirect to payment gateway
        window.location.href = response.data.link
      }
    } catch (error) {
      setIsProcessing(false)
      toast.error('Failed to process card payment')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
        <CreditCard className="w-8 h-8 text-blue-600" />
        <div>
          <h3 className="font-semibold text-blue-900">Card Payment</h3>
          <p className="text-sm text-blue-700">Pay with your debit or credit card</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Cardholder Name"
          placeholder="John Doe"
          {...register('name')}
          error={errors.name?.message}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          {...register('email')}
          error={errors.email?.message}
        />

        <Input
          label="Card Number"
          placeholder="1234 5678 9012 3456"
          maxLength={16}
          {...register('cardNumber')}
          error={errors.cardNumber?.message}
          leftIcon={<CreditCard className="w-5 h-5" />}
        />

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Expiry Month"
            placeholder="MM"
            maxLength={2}
            {...register('expiryMonth')}
            error={errors.expiryMonth?.message}
          />

          <Input
            label="Expiry Year"
            placeholder="YY"
            maxLength={2}
            {...register('expiryYear')}
            error={errors.expiryYear?.message}
          />

          <Input
            label="CVV"
            placeholder="123"
            maxLength={4}
            type="password"
            {...register('cvv')}
            error={errors.cvv?.message}
          />
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Amount to pay:</span>
            <span className="font-semibold">KES {amount.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button type="submit" fullWidth isLoading={isProcessing}>
            Pay KES {amount.toLocaleString()}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
        </div>
      </form>

      <div className="text-xs text-gray-500 text-center">
        Your payment information is secure and encrypted
      </div>
    </div>
  )
}
