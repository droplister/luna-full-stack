/**
 * Empty Cart Component
 * Displays empty state message for cart
 */

import Link from 'next/link'
import { ApparateButton } from '@/components/ui/apparate-button'

interface EmptyCartProps {
  variant?: 'full' | 'compact'
  onClose?: () => void
}

export function EmptyCart({ variant = 'full', onClose }: EmptyCartProps) {
  // Compact variant - for cart drawer
  if (variant === 'compact') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="mx-auto size-10 text-gray-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <p className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</p>
        <p className="mt-1 text-xs text-gray-500">Browse products or try a bit of magic!</p>
        <div className="mt-4 flex flex-col gap-2 w-full px-4">
          <Link
            href="/products"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
          >
            Browse Products
          </Link>
          <ApparateButton onNavigate={onClose} label="Apparate Me" />
        </div>
      </div>
    )
  }

  // Full variant - for cart page with CTA and Apparate button
  return (
    <div className="mt-12 text-center">
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="mx-auto size-12 text-gray-400"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-semibold text-gray-900">Your cart is empty</h3>
      <p className="mt-1 text-sm text-gray-500">Start adding items to your cart or try something random!</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Browse Products
        </Link>
        <ApparateButton label="Apparate Me" />
      </div>
    </div>
  )
}
