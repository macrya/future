'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/auth.store'
import { User, Mail, Phone, MapPin } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuthStore()

  return (
    <DashboardLayout role="customer">
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

        {/* Change Password */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <Input label="Current Password" type="password" />
              <Input label="New Password" type="password" />
              <Input label="Confirm New Password" type="password" />
              <Button type="submit">Update Password</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
