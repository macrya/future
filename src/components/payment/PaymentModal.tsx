'use client'

import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { MpesaPayment } from './MpesaPayment'
import { CardPayment } from './CardPayment'
import { PAYMENT_METHODS } from '@/constants'
import { Button } from '../ui/Button'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  deliveryId: string
  onPaymentSuccess: () => void
}

export function PaymentModal({
  isOpen,
  onClose,
  amount,
  deliveryId,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  const handleSuccess = () => {
    onPaymentSuccess()
    onClose()
  }

  const handleBack = () => {
    setSelectedMethod(null)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedMethod ? 'Complete Payment' : 'Select Payment Method'}
      size="md"
    >
      {!selectedMethod ? (
        <div className="space-y-4">
          <p className="text-gray-600">Choose how you want to pay for your delivery</p>

          <div className="space-y-3">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.value}
                onClick={() => setSelectedMethod(method.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <div className="font-semibold">{method.label}</div>
                    <div className="text-sm text-gray-500">
                      {method.value === 'mpesa' && 'Fast & secure mobile payment'}
                      {method.value === 'card' && 'Visa, Mastercard accepted'}
                      {method.value === 'cash' && 'Pay when package is delivered'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Amount:</span>
              <span className="text-2xl font-bold text-gray-900">
                KES {amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {selectedMethod === 'mpesa' && (
            <MpesaPayment
              amount={amount}
              deliveryId={deliveryId}
              onSuccess={handleSuccess}
              onCancel={handleBack}
            />
          )}

          {selectedMethod === 'card' && (
            <CardPayment
              amount={amount}
              deliveryId={deliveryId}
              onSuccess={handleSuccess}
              onCancel={handleBack}
            />
          )}

          {selectedMethod === 'cash' && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-yellow-900">
                  You&apos;ve selected Cash on Delivery. Please have the exact amount ready when the
                  courier arrives.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Amount to pay:</span>
                  <span>KES {amount.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button onClick={handleSuccess} fullWidth>
                  Confirm Cash Payment
                </Button>
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
