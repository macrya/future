'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Package, MapPin, Calendar } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { deliveryService } from '@/services/delivery.service'
import { formatCurrency, formatRelativeTime, formatDate } from '@/utils/format'
import { DELIVERY_STATUS_LABELS, DELIVERY_STATUS_COLORS } from '@/constants'
import { LoadingSpinner } from '@/components/ui/Spinner'

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: response, isLoading } = useQuery({
    queryKey: ['my-orders', statusFilter],
    queryFn: async () => {
      return await deliveryService.getMyDeliveries({
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
    },
  })

  const deliveries = response?.data?.data || []

  return (
    <DashboardLayout role="customer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-gray-600 mt-1">View and manage all your deliveries</p>
          </div>
          <Select
            options={[
              { value: 'all', label: 'All Orders' },
              { value: 'pending', label: 'Pending' },
              { value: 'in_transit', label: 'In Transit' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>

        {/* Orders List */}
        {isLoading ? (
          <LoadingSpinner text="Loading orders..." />
        ) : deliveries.length > 0 ? (
          <div className="grid gap-4">
            {deliveries.map((delivery) => (
              <Card key={delivery.id} variant="bordered" className="hover:shadow-md transition-shadow">
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left section */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Package className="w-5 h-5 text-primary-600" />
                        <h3 className="font-semibold text-lg">
                          {delivery.packageDetails.description}
                        </h3>
                        <Badge className={DELIVERY_STATUS_COLORS[delivery.status]}>
                          {DELIVERY_STATUS_LABELS[delivery.status]}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-gray-600">From:</p>
                            <p className="font-medium">{delivery.pickupAddress.street}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-gray-600">To:</p>
                            <p className="font-medium">{delivery.deliveryAddress.street}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {formatDate(delivery.createdAt, 'PPp')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right section */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(delivery.pricing.total)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/customer/tracking?id=${delivery.id}`}>
                          <Button variant="primary" size="sm">
                            Track Order
                          </Button>
                        </Link>
                        {delivery.status === 'delivered' && (
                          <Button variant="outline" size="sm">
                            Reorder
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="bordered">
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No orders found</p>
              <p className="text-gray-500 text-sm">
                {statusFilter !== 'all'
                  ? `No ${statusFilter} orders at the moment`
                  : 'Start by creating your first delivery'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
