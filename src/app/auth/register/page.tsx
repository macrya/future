'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Mail, Phone, Lock, Car } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore } from '@/store/auth.store'
import { registerSchema, RegisterFormData } from '@/utils/validators'
import { ROUTES, VEHICLE_TYPES } from '@/constants'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = (searchParams.get('role') as 'customer' | 'courier') || 'customer'

  const { register: registerUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState<'customer' | 'courier'>(defaultRole)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: defaultRole,
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      await registerUser(data)

      // Redirect based on role
      if (data.role === 'customer') {
        router.push(ROUTES.CUSTOMER_DASHBOARD)
      } else {
        router.push(ROUTES.COURIER_DASHBOARD)
      }
    } catch (error) {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <Card className="w-full max-w-2xl" variant="elevated">
        <CardHeader>
          <Link href="/" className="text-center block mb-4">
            <h1 className="text-3xl font-bold text-primary-600">DeliveryPro</h1>
          </Link>
          <CardTitle className="text-center">Create Account</CardTitle>
          <p className="text-center text-gray-600">Join thousands of satisfied users</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === 'customer'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold">Customer</h3>
                <p className="text-sm text-gray-600">Send packages</p>
              </button>

              <button
                type="button"
                onClick={() => setRole('courier')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === 'courier'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold">Courier</h3>
                <p className="text-sm text-gray-600">Deliver packages</p>
              </button>
            </div>

            <input type="hidden" {...register('role')} value={role} />

            {/* Common Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                leftIcon={<User className="w-5 h-5" />}
                {...register('name')}
                error={errors.name?.message}
              />

              <Input
                label="Phone Number"
                placeholder="0712345678"
                leftIcon={<Phone className="w-5 h-5" />}
                {...register('phone')}
                error={errors.phone?.message}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
              {...register('email')}
              error={errors.email?.message}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                leftIcon={<Lock className="w-5 h-5" />}
                {...register('password')}
                error={errors.password?.message}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                leftIcon={<Lock className="w-5 h-5" />}
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />
            </div>

            {/* Courier-specific fields */}
            {role === 'courier' && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <Select
                    label="Vehicle Type"
                    options={VEHICLE_TYPES}
                    {...register('vehicleType')}
                    error={errors.vehicleType?.message}
                  />

                  <Input
                    label="Vehicle Number"
                    placeholder="KXX 123A"
                    leftIcon={<Car className="w-5 h-5" />}
                    {...register('vehicleNumber')}
                    error={errors.vehicleNumber?.message}
                  />
                </div>

                <Input
                  label="License Number"
                  placeholder="Your driving license number"
                  {...register('licenseNumber')}
                  error={errors.licenseNumber?.message}
                />
              </>
            )}

            <div className="flex items-start">
              <input type="checkbox" required className="mt-1 mr-2" />
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/terms" className="text-primary-600 hover:underline">
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary-600 hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <Button type="submit" fullWidth isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary-600 font-semibold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
