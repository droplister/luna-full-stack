/**
 * Free Shipping Progress Component
 * Shows progress bar toward free shipping threshold
 */

import { formatPrice } from '@/utils/format'
import { cartConfig } from '@/lib/config/cart'

interface FreeShippingProgressProps {
  subtotal: number
  currency: string
}

export function FreeShippingProgress({ subtotal, currency }: FreeShippingProgressProps) {
  const progressPercent = Math.min((subtotal / cartConfig.freeShippingPromo.threshold) * 100, 100)
  const hasReachedFreeShipping = subtotal >= cartConfig.freeShippingPromo.threshold
  const amountUntilFreeShipping = cartConfig.freeShippingPromo.threshold - subtotal

  // Calculate 5 days from now
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 5)
  const formattedDate = expiryDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })

  if (!cartConfig.freeShippingPromo.enabled) {
    return null
  }

  return (
    <div className="mt-6">
      <div className="mb-2">
        {hasReachedFreeShipping ? (
          <p className="text-sm font-semibold text-emerald-600">
            🎉 You've unlocked FREE shipping!
          </p>
        ) : (
          <p className="text-sm font-medium text-gray-900">
            Add <span className="font-bold text-emerald-600">{formatPrice(amountUntilFreeShipping, currency)}</span> more to get <span className="font-semibold">FREE shipping!</span>
          </p>
        )}
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            hasReachedFreeShipping ? 'bg-emerald-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      {hasReachedFreeShipping ? (
        <p className="mt-1.5 text-xs text-gray-500">
          Your order qualifies if placed before {formattedDate}
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-gray-500">
          {progressPercent.toFixed(0)}% of the way there
        </p>
      )}
    </div>
  )
}
