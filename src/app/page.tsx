import Link from 'next/link'
import { ArrowRight, Package, MapPin, CreditCard, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <nav className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">DeliveryPro</h1>
            <div className="space-x-4">
              <Link href="/auth/login">
                <Button variant="secondary">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" className="!text-white !border-white hover:!bg-white/10">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Fast, Reliable Delivery <br />
            At Your Fingertips
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Professional delivery service with real-time tracking, instant M-Pesa payments,
            and trusted couriers across Kenya
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register?role=customer">
              <Button size="lg" variant="secondary">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/register?role=courier">
              <Button size="lg" variant="outline" className="!text-white !border-white hover:!bg-white/10">
                Become a Courier
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">Why Choose DeliveryPro?</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-primary-600" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Lightning Fast</h4>
            <p className="text-gray-600">
              Get your packages delivered within hours with our efficient courier network
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-success-600" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Real-Time Tracking</h4>
            <p className="text-gray-600">
              Track your delivery in real-time with live GPS tracking and updates
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-warning-600" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Easy Payments</h4>
            <p className="text-gray-600">
              Pay with M-Pesa, card, or cash on delivery - your choice
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-danger-600" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Safe & Secure</h4>
            <p className="text-gray-600">
              Your packages are insured and handled with care by verified couriers
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied customers using DeliveryPro
          </p>
          <Link href="/auth/register">
            <Button size="lg">Create Free Account</Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 DeliveryPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
