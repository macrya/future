'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DollarSign, Package, Star, TrendingUp, MapPin } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { deliveryService } from '@/services/delivery.service'
import { courierService } from '@/services/courier.service'
import { useAuthStore } from '@/store/auth.store'
import { formatCurrency, formatRelativeTime } from '@/utils/format'
import { DELIVERY_STATUS_LABELS, DELIVERY_STATUS_COLORS } from '@/constants'
import { LoadingSpinner } from '@/components/ui/Spinner'
import Link from 'next/link'
import { toast } from 'sonner'

export default function CourierDashboard() {
  const { user } = useAuthStore()
  const [isOnline, setIsOnline] = useState(false)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['courier-stats'],
    queryFn: async () => {
      const response = await courierService.getCourierStats()
      return response.data
    },
  })

  const { data: deliveries, isLoading: deliveriesLoading, refetch } = useQuery({
    queryKey: ['courier-deliveries'],
    queryFn: async () => {
      const response = await deliveryService.getCourierDeliveries({ limit: 5 })
      return response.data?.data || []
    },
  })

  const handleToggleStatus = async () => {
    try {
      const newStatus = isOnline ? 'offline' : 'active'
      await courierService.updateCourierStatus(newStatus)
      setIsOnline(!isOnline)
      toast.success(`You are now ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleAcceptDelivery = async (deliveryId: string) => {
    try {
      await deliveryService.acceptDelivery(deliveryId)
      toast.success('Delivery accepted!')
      refetch()
    } catch (error) {
      toast.error('Failed to accept delivery')
    }
  }

  return (
    <DashboardLayout role="courier">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
            <p className="text-gray-600 mt-1">Manage your deliveries and track earnings</p>
          </div>
          <Button
            onClick={handleToggleStatus}
            variant={isOnline ? 'danger' : 'primary'}
            size="lg"
          >
            <div className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-white' : 'bg-green-400 animate-pulse'}`} />
            {isOnline ? 'Go Offline' : 'Go Online'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card variant="bordered">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Today&apos;s Deliveries</p>
                <p className="text-3xl font-bold mt-1">{stats?.todayDeliveries || 0}</p>
              </div>
              <Package className="w-12 h-12 text-primary-600" />
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Today&apos;s Earnings</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(stats?.todayEarnings || 0)}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-success-600" />
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(stats?.totalEarnings || 0)}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-warning-600" />
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Rating</p>
                <p className="text-3xl font-bold mt-1">{stats?.rating || 0}</p>
              </div>
              <Star className="w-12 h-12 text-yellow-500" />
            </CardContent>
          </Card>
        </div>

        {/* Active Deliveries */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Available & Active Deliveries</CardTitle>
              <Link href="/courier/deliveries">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {deliveriesLoading ? (
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
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {delivery.pickupAddress.street} → {delivery.deliveryAddress.street}
                          </span>
                        </div>
                        <p className="text-xs">{formatRelativeTime(delivery.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-lg text-success-600">
                        +{formatCurrency(delivery.pricing.total * 0.15)}
                      </p>
                      {delivery.status === 'searching_courier' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleAcceptDelivery(delivery.id)}
                        >
                          Accept
                        </Button>
                      ) : (
                        <Link href={`/courier/deliveries?id=${delivery.id}`}>
                          <Button variant="outline" size="sm" className="mt-2">
                            View Details
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No available deliveries at the moment</p>
                <p className="text-sm text-gray-500">
                  Make sure you&apos;re online to receive delivery requests
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
