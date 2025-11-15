'use client'

import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { courierService } from '@/services/courier.service'
import { formatCurrency } from '@/utils/format'
import { DollarSign, TrendingUp, Calendar } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/Spinner'

export default function EarningsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['courier-earnings'],
    queryFn: async () => {
      const response = await courierService.getCourierStats()
      return response.data
    },
  })

  return (
    <DashboardLayout role="courier">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Earnings</h1>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6">
              <Card variant="bordered">
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Today</p>
                    <p className="text-3xl font-bold mt-1">
                      {formatCurrency(stats?.todayEarnings || 0)}
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-success-600" />
                </CardContent>
              </Card>

              <Card variant="bordered">
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">This Week</p>
                    <p className="text-3xl font-bold mt-1">
                      {formatCurrency(stats?.weekEarnings || 0)}
                    </p>
                  </div>
                  <Calendar className="w-12 h-12 text-primary-600" />
                </CardContent>
              </Card>

              <Card variant="bordered">
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total</p>
                    <p className="text-3xl font-bold mt-1">
                      {formatCurrency(stats?.totalEarnings || 0)}
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-warning-600" />
                </CardContent>
              </Card>
            </div>

            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Earnings Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Completed Deliveries</span>
                    <span className="font-semibold">{stats?.totalDeliveries || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Average per Delivery</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        stats?.totalDeliveries
                          ? (stats?.totalEarnings || 0) / stats.totalDeliveries
                          : 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-semibold">⭐ {stats?.rating?.toFixed(1) || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
