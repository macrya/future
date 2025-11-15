'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Package, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CreateDeliveryModal } from '@/components/customer/CreateDeliveryModal'
import { deliveryService } from '@/services/delivery.service'
import { useAuthStore } from '@/store/auth.store'
import { formatCurrency, formatRelativeTime } from '@/utils/format'
import { DELIVERY_STATUS_LABELS, DELIVERY_STATUS_COLORS } from '@/constants'
import { LoadingSpinner } from '@/components/ui/Spinner'
import Link from 'next/link'

export default function CustomerDashboard() {
  const { user } = useAuthStore()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data: deliveries, isLoading, refetch } = useQuery({
    queryKey: ['my-deliveries'],
    queryFn: async () => {
      const response = await deliveryService.getMyDeliveries({ limit: 5 })
      return response.data?.data || []
    },
  })

  const stats = {
    total: deliveries?.length || 0,
    active: deliveries?.filter((d) => !['delivered', 'cancelled', 'failed'].includes(d.status)).length || 0,
    completed: deliveries?.filter((d) => d.status === 'delivered').length || 0,
  }

  return (
    <DashboardLayout role="customer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600 mt-1">Manage your deliveries and track packages</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            New Delivery
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="bordered">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Deliveries</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <Package className="w-12 h-12 text-primary-600" />
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Deliveries</p>
                <p className="text-3xl font-bold mt-1">{stats.active}</p>
              </div>
              <Clock className="w-12 h-12 text-warning-600" />
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold mt-1">{stats.completed}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-success-600" />
            </CardContent>
          </Card>
        </div>

        {/* Recent Deliveries */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Deliveries</CardTitle>
              <Link href="/customer/orders">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner />
            ) : deliveries && deliveries.length > 0 ? (
              <div className="space-y-4">
                {deliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{delivery.packageDetails.description}</h4>
                        <Badge className={DELIVERY_STATUS_COLORS[delivery.status]}>
                          {DELIVERY_STATUS_LABELS[delivery.status]}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>From: {delivery.pickupAddress.street}</p>
                        <p>To: {delivery.deliveryAddress.street}</p>
                        <p className="text-xs">{formatRelativeTime(delivery.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {formatCurrency(delivery.pricing.total)}
                      </p>
                      <Link href={`/customer/tracking?id=${delivery.id}`}>
                        <Button variant="outline" size="sm" className="mt-2">
                          Track
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No deliveries yet</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Delivery
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateDeliveryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => refetch()}
      />
    </DashboardLayout>
  )
}
