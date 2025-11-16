/**
 * Order Summary Component
 * Reusable pricing summary for cart and drawer
 * Shows subtotal, shipping, tax (optional), and total
 */

import Link from 'next/link'
import { QuestionMarkCircleIcon } from '@heroicons/react/20/solid'
import { formatPrice } from '@/lib/utils/format'

interface OrderSummaryProps {
  subtotal: number
  shipping: number
  tax?: number
  currency: string
  variant?: 'full' | 'compact'
  showCheckoutButton?: boolean
  onCheckout?: () => void
}

export function OrderSummary({
  subtotal,
  shipping,
  tax,
  currency,
  variant = 'full',
  showCheckoutButton = true,
  onCheckout,
}: OrderSummaryProps) {
  const total = tax !== undefined ? subtotal + shipping + tax : subtotal + shipping

  // Compact variant - for cart drawer (no tax, simpler layout)
  if (variant === 'compact') {
    return (
      <div className="border-t border-gray-200 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex justify-between text-sm font-medium text-gray-900 sm:text-base">
          <p>Subtotal</p>
          <p>{formatPrice(subtotal, currency)}</p>
        </div>
        <div className="flex justify-between text-sm font-medium text-gray-900 mt-2 sm:mt-3 sm:text-base">
          <p>Shipping</p>
          <p>{shipping === 0 ? '✨ FREE' : formatPrice(shipping, currency)}</p>
        </div>
        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">Taxes calculated at checkout.</p>
        {showCheckoutButton && (
          <div className="mt-4 sm:mt-5">
            <Link
              href="/checkout"
              onClick={onCheckout}
              className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-xs hover:bg-indigo-700"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    )
  }

  // Full variant - for cart page (includes tax, detailed layout)
  return (
    <section
      aria-labelledby="summary-heading"
      className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
    >
      <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
        Order summary
      </h2>

      <dl className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <dt className="text-sm text-gray-600">Subtotal</dt>
          <dd className="text-sm font-medium text-gray-900">{formatPrice(subtotal, currency)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-gray-600">Shipping</dt>
          <dd className="text-sm font-medium text-gray-900">
            {shipping === 0 ? '✨ FREE' : formatPrice(shipping, currency)}
          </dd>
        </div>
      </dl>

      {showCheckoutButton && (
        <>
          <div className="mt-6">
            <Link
              href="/checkout"
              className="w-full block text-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-semibold text-white shadow-xs hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-hidden"
            >
              Checkout
            </Link>
          </div>
          <p className="mt-3 text-center text-sm text-gray-500">Taxes calculated at checkout.</p>
        </>
      )}
    </section>
  )
}
