'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LiveTrackingMap } from '@/components/maps/LiveTrackingMap'
import { deliveryService } from '@/services/delivery.service'
import { useDeliveryStore } from '@/store/delivery.store'
import wsService from '@/lib/websocket'
import { useAuthStore } from '@/store/auth.store'
import { formatCurrency, formatRelativeTime } from '@/utils/format'
import { DELIVERY_STATUS_LABELS, DELIVERY_STATUS_COLORS } from '@/constants'
import { LoadingSpinner } from '@/components/ui/Spinner'
import { CheckCircle2 } from 'lucide-react'

export default function TrackingPage() {
  const searchParams = useSearchParams()
  const deliveryId = searchParams.get('id')
  const { token } = useAuthStore()
  const { setCurrentDelivery, updateDeliveryStatus } = useDeliveryStore()

  const { data: delivery, isLoading } = useQuery({
    queryKey: ['delivery', deliveryId],
    queryFn: async () => {
      if (!deliveryId) return null
      const response = await deliveryService.getDelivery(deliveryId)
      return response.data
    },
    enabled: !!deliveryId,
  })

  useEffect(() => {
    if (delivery) {
      setCurrentDelivery(delivery)
    }
  }, [delivery, setCurrentDelivery])

  useEffect(() => {
    if (token && deliveryId) {
      wsService.connect(token)
      wsService.subscribeToDelivery(deliveryId)

      wsService.onStatusUpdate((data) => {
        if (data.data.deliveryId === deliveryId) {
          updateDeliveryStatus(deliveryId, data.data.status)
        }
      })

      return () => {
        wsService.unsubscribeFromDelivery(deliveryId)
      }
    }
  }, [token, deliveryId, updateDeliveryStatus])

  if (isLoading) {
    return (
      <DashboardLayout role="customer">
        <LoadingSpinner text="Loading delivery information..." />
      </DashboardLayout>
    )
  }

  if (!delivery) {
    return (
      <DashboardLayout role="customer">
        <div className="text-center py-12">
          <p className="text-gray-600">Delivery not found</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="customer">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Track Delivery</h1>

        {/* Delivery Status */}
        <Card variant="bordered">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">{delivery.packageDetails.description}</h3>
                <Badge size="lg" className={DELIVERY_STATUS_COLORS[delivery.status]}>
                  {DELIVERY_STATUS_LABELS[delivery.status]}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatCurrency(delivery.pricing.total)}</p>
                <p className="text-sm text-gray-600">
                  {delivery.payment.status === 'completed' ? 'Paid' : 'Payment Pending'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Map */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Live Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <LiveTrackingMap
              deliveryId={delivery.id}
              pickupLocation={delivery.pickupAddress.location}
              deliveryLocation={delivery.deliveryAddress.location}
            />
          </CardContent>
        </Card>

        {/* Delivery Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Pickup Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{delivery.pickupAddress.street}</p>
              <p className="text-sm text-gray-600">{delivery.pickupAddress.city}</p>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Delivery Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{delivery.deliveryAddress.street}</p>
              <p className="text-sm text-gray-600">{delivery.deliveryAddress.city}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tracking History */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Tracking History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {delivery.trackingHistory.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                    />
                    {index < delivery.trackingHistory.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{DELIVERY_STATUS_LABELS[event.status]}</p>
                      {index === 0 && <CheckCircle2 className="w-4 h-4 text-success-600" />}
                    </div>
                    <p className="text-sm text-gray-600">{event.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatRelativeTime(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
