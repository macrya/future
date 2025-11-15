'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuthStore } from '@/store/auth.store'
import { User, Mail, Phone, Car } from 'lucide-react'
import { VEHICLE_TYPES } from '@/constants'

export default function CourierProfilePage() {
  const { user } = useAuthStore()

  return (
    <DashboardLayout role="courier">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold">Profile Settings</h1>

        {/* Personal Information */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <Input
                label="Full Name"
                defaultValue={user?.name}
                leftIcon={<User className="w-5 h-5" />}
              />

              <Input
                label="Email Address"
                type="email"
                defaultValue={user?.email}
                leftIcon={<Mail className="w-5 h-5" />}
              />

              <Input
                label="Phone Number"
                defaultValue={user?.phone}
                leftIcon={<Phone className="w-5 h-5" />}
              />

              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <Select label="Vehicle Type" options={VEHICLE_TYPES} />

              <Input
                label="Vehicle Number"
                placeholder="KXX 123A"
                leftIcon={<Car className="w-5 h-5" />}
              />

              <Input label="License Number" placeholder="Your driving license number" />

              <Button type="submit">Update Vehicle Info</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
