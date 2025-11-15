'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Package as PackageIcon } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { LocationPicker } from '../maps/LocationPicker'
import { createDeliverySchema } from '@/utils/validators'
import { deliveryService } from '@/services/delivery.service'
import { PACKAGE_CATEGORIES } from '@/constants'
import { Location, Address } from '@/types'
import { PaymentModal } from '../payment/PaymentModal'

interface CreateDeliveryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateDeliveryModal({ isOpen, onClose, onSuccess }: CreateDeliveryModalProps) {
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null)
  const [deliveryLocation, setDeliveryLocation] = useState<Location | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [deliveryId, setDeliveryId] = useState<string>('')
  const [totalAmount, setTotalAmount] = useState<number>(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      packageDescription: '',
      packageCategory: 'package',
      packageWeight: '',
      fragile: false,
      notes: '',
    },
  })

  const handlePickupChange = (address: string, location: Location) => {
    setPickupLocation(location)
  }

  const handleDeliveryChange = (address: string, location: Location) => {
    setDeliveryLocation(location)
  }

  const onSubmit = async (data: any) => {
    if (!pickupLocation || !deliveryLocation) {
      toast.error('Please select both pickup and delivery locations')
      return
    }

    try {
      setIsCreating(true)

      // First, estimate the price
      const priceEstimate = await deliveryService.estimatePrice(
        pickupLocation.lat,
        pickupLocation.lng,
        deliveryLocation.lat,
        deliveryLocation.lng
      )

      if (!priceEstimate.success || !priceEstimate.data) {
        throw new Error('Failed to estimate price')
      }

      // Create the delivery
      const response = await deliveryService.createDelivery({
        pickupAddress: {
          street: pickupLocation.address || '',
          city: 'Nairobi',
          location: pickupLocation,
        } as any,
        deliveryAddress: {
          street: deliveryLocation.address || '',
          city: 'Nairobi',
          location: deliveryLocation,
        } as any,
        packageDescription: data.packageDescription,
        packageCategory: data.packageCategory,
        packageWeight: data.packageWeight ? parseFloat(data.packageWeight) : undefined,
        fragile: data.fragile,
        notes: data.notes,
      })

      if (response.success && response.data) {
        setDeliveryId(response.data.id)
        setTotalAmount(response.data.pricing.total)
        setShowPayment(true)
        toast.success('Delivery created! Please complete payment.')
      }
    } catch (error) {
      toast.error('Failed to create delivery')
      setIsCreating(false)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPayment(false)
    setIsCreating(false)
    reset()
    onSuccess()
    onClose()
  }

  return (
    <>
      <Modal isOpen={isOpen && !showPayment} onClose={onClose} title="Create New Delivery" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Locations */}
          <div className="space-y-4">
            <LocationPicker
              label="Pickup Location"
              placeholder="Enter pickup address"
              onChange={handlePickupChange}
            />

            <LocationPicker
              label="Delivery Location"
              placeholder="Enter delivery address"
              onChange={handleDeliveryChange}
            />
          </div>

          {/* Package Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Package Details</h3>

            <Input
              label="Package Description"
              placeholder="What are you sending?"
              {...register('packageDescription', { required: 'Description is required' })}
              error={errors.packageDescription?.message}
              leftIcon={<PackageIcon className="w-5 h-5" />}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                options={PACKAGE_CATEGORIES}
                {...register('packageCategory')}
              />

              <Input
                label="Weight (kg) - Optional"
                type="number"
                step="0.1"
                placeholder="0.0"
                {...register('packageWeight')}
              />
            </div>

            <label className="flex items-center space-x-2">
              <input type="checkbox" {...register('fragile')} className="rounded" />
              <span className="text-sm">This package is fragile</span>
            </label>

            <Input
              label="Additional Notes - Optional"
              placeholder="Any special instructions for the courier"
              {...register('notes')}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button type="submit" fullWidth isLoading={isCreating}>
              Continue to Payment
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isCreating}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {showPayment && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          amount={totalAmount}
          deliveryId={deliveryId}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  )
}
