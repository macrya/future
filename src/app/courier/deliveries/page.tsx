'use client'

import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { deliveryService } from '@/services/delivery.service'
import { formatCurrency, formatRelativeTime } from '@/utils/format'
import { DELIVERY_STATUS_LABELS, DELIVERY_STATUS_COLORS } from '@/constants'
import { LoadingSpinner } from '@/components/ui/Spinner'
import { MapPin, Navigation } from 'lucide-react'

export default function CourierDeliveriesPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['courier-deliveries'],
    queryFn: async () => {
      return await deliveryService.getCourierDeliveries()
    },
  })

  const deliveries = response?.data?.data || []

  return (
    <DashboardLayout role="courier">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Deliveries</h1>

        {isLoading ? (
          <LoadingSpinner text="Loading deliveries..." />
        ) : deliveries.length > 0 ? (
          <div className="grid gap-4">
            {deliveries.map((delivery) => (
              <Card key={delivery.id} variant="bordered">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {delivery.packageDetails.description}
                        </h3>
                        <Badge className={DELIVERY_STATUS_COLORS[delivery.status]}>
                          {DELIVERY_STATUS_LABELS[delivery.status]}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-success-600" />
                          <span>{delivery.pickupAddress.street}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-danger-600" />
                          <span>{delivery.deliveryAddress.street}</span>
                        </div>
                        <p className="text-gray-500">{formatRelativeTime(delivery.createdAt)}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-success-600">
                        +{formatCurrency(delivery.pricing.total * 0.15)}
                      </p>
                      <Button variant="primary" size="sm" className="mt-2">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="bordered">
            <CardContent className="text-center py-12">
              <p className="text-gray-600">No deliveries assigned yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
