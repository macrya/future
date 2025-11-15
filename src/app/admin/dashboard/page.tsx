'use client'

import { useQuery } from '@tanstack/react-query'
import { Package, Users, DollarSign, TrendingUp, Activity } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { deliveryService } from '@/services/delivery.service'
import { courierService } from '@/services/courier.service'
import { formatCurrency, formatRelativeTime } from '@/utils/format'
import { DELIVERY_STATUS_LABELS, DELIVERY_STATUS_COLORS } from '@/constants'
import { LoadingSpinner } from '@/components/ui/Spinner'

export default function AdminDashboard() {
  const { data: deliveries, isLoading: deliveriesLoading } = useQuery({
    queryKey: ['all-deliveries'],
    queryFn: async () => {
      const response = await deliveryService.getDeliveries({ limit: 10 })
      return response.data?.data || []
    },
  })

  const { data: couriers, isLoading: couriersLoading } = useQuery({
    queryKey: ['all-couriers'],
    queryFn: async () => {
      const response = await courierService.getCouriers()
      return response.data?.data || []
    },
  })

  const stats = {
    totalDeliveries: deliveries?.length || 0,
    activeDeliveries: deliveries?.filter((d) => !['delivered', 'cancelled', 'failed'].includes(d.status)).length || 0,
    totalRevenue: deliveries?.reduce((sum, d) => sum + (d.pricing?.total || 0), 0) || 0,
    activeCouriers: couriers?.filter((c) => c.status === 'active').length || 0,
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your delivery platform</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="bordered">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Deliveries</p>
                <p className="text-3xl font-bold mt-1">{stats.totalDeliveries}</p>
                <p className="text-sm text-success-600 mt-2">↑ 12% from last week</p>
              </div>
              <Package className="w-12 h-12 text-primary-600" />
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Deliveries</p>
                <p className="text-3xl font-bold mt-1">{stats.activeDeliveries}</p>
                <p className="text-sm text-gray-500 mt-2">In progress</p>
              </div>
              <Activity className="w-12 h-12 text-warning-600" />
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-success-600 mt-2">↑ 8% from last week</p>
              </div>
              <DollarSign className="w-12 h-12 text-success-600" />
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Couriers</p>
                <p className="text-3xl font-bold mt-1">{stats.activeCouriers}</p>
                <p className="text-sm text-gray-500 mt-2">Online now</p>
              </div>
              <Users className="w-12 h-12 text-primary-600" />
            </CardContent>
          </Card>
        </div>

        {/* Recent Deliveries */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            {deliveriesLoading ? (
              <LoadingSpinner />
            ) : deliveries && deliveries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Package</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.slice(0, 10).map((delivery) => (
                      <tr key={delivery.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">
                          {delivery.id.slice(0, 8)}...
                        </td>
                        <td className="py-3 px-4">{delivery.packageDetails.description}</td>
                        <td className="py-3 px-4">
                          <Badge className={DELIVERY_STATUS_COLORS[delivery.status]}>
                            {DELIVERY_STATUS_LABELS[delivery.status]}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {formatCurrency(delivery.pricing.total)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatRelativeTime(delivery.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">No deliveries found</div>
            )}
          </CardContent>
        </Card>

        {/* Active Couriers */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Active Couriers</CardTitle>
          </CardHeader>
          <CardContent>
            {couriersLoading ? (
              <LoadingSpinner />
            ) : couriers && couriers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {couriers.filter((c) => c.status === 'active').slice(0, 6).map((courier) => (
                  <div key={courier.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{courier.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{courier.vehicleType}</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Deliveries:</span>
                      <span className="font-semibold">{courier.totalDeliveries}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Rating:</span>
                      <span className="font-semibold">⭐ {courier.rating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">No active couriers</div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
