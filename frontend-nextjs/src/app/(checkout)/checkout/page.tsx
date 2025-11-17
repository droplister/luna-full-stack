'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckoutProgressSteps } from '@/components/checkout/checkout-progress-steps'
import type { CheckoutStep } from '@/components/checkout/checkout-progress-steps'
import { CheckoutOrderSummary } from '@/components/checkout/checkout-order-summary'
import { ContactSection } from '@/components/checkout/contact-section'
import { PaymentSection } from '@/components/checkout/payment-section'
import { ShippingSection } from '@/components/checkout/shipping-section'
import { BillingSection } from '@/components/checkout/billing-section'
import { useCart } from '@/hooks/useCart'
import { brand } from '@/lib/cms'
import { calculateShipping, calculateTax } from '@/lib/config'

const steps: CheckoutStep[] = [
  { name: 'Cart', href: '/cart', status: 'complete' },
  { name: 'Billing Information', href: '/checkout', status: 'current' },
  { name: 'Confirmation', href: '#', status: 'upcoming' },
]

export default function CheckoutPage() {
  const { items, subtotal, currency } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate shipping and tax
  const shipping = calculateShipping(subtotal)
  const tax = calculateTax(subtotal, shipping)

  // Calculate total
  const total = subtotal + shipping + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Placeholder - no actual submission yet
    setTimeout(() => {
      setIsSubmitting(false)
      alert('Checkout form submission coming soon!')
    }, 1000)
  }

  return (
    <div className="bg-white">
      {/* Background color split screen for large screens */}
      <div aria-hidden="true" className="fixed top-0 left-0 hidden h-full w-1/2 bg-white lg:block" />
      <div aria-hidden="true" className="fixed top-0 right-0 hidden h-full w-1/2 bg-gray-50 lg:block" />

      {/* Header */}
      <header className="relative border-b border-gray-200 bg-white text-sm font-medium text-gray-700">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="relative flex justify-end sm:justify-center">
            <Link href="/" className="absolute top-1/2 left-0 -mt-4">
              <span className="sr-only">{brand.name}</span>
              <span className="font-brand font-semibold text-3xl text-gray-900">
                {brand.name}
              </span>
            </Link>
            <CheckoutProgressSteps steps={steps} />
            <p className="sm:hidden">Step 2 of 3</p>
          </div>
        </div>
      </header>

      <main className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8 xl:gap-x-48">
        <h1 className="sr-only">Order information</h1>

        {/* Order summary - Right side on desktop */}
        <CheckoutOrderSummary
          items={items}
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          total={total}
          currency={currency}
        />

        {/* Checkout form - Left side on desktop */}
        <form onSubmit={handleSubmit} className="px-4 pt-16 pb-36 sm:px-6 lg:col-start-1 lg:row-start-1 lg:px-0 lg:pb-16">
          <div className="mx-auto max-w-lg lg:max-w-none">
            {/* Contact information */}
            <ContactSection />

            {/* Payment details */}
            <PaymentSection />

            {/* Shipping address */}
            <ShippingSection />

            {/* Billing information */}
            <BillingSection />

            {/* Submit */}
            <div className="mt-10 border-t border-gray-200 pt-6 sm:flex sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-hidden sm:order-last sm:ml-6 sm:w-auto disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Continue'}
              </button>
              <p className="mt-4 text-center text-sm text-gray-500 sm:mt-0 sm:text-left">
                You won&apos;t be charged until the next step.
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
