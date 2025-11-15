/**
 * Header Component
 * Main navigation with cart button
 */

'use client'

import Link from 'next/link'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/lib/hooks/useCart'

export function Header() {
  const { itemCount, toggleCart } = useCart()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/products" className="text-2xl font-bold text-indigo-600">
            ShopHub
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/products"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Products
            </Link>
          </nav>

          {/* Cart Button */}
          <button
            onClick={toggleCart}
            aria-label="Shopping cart"
            className="relative flex items-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <ShoppingBagIcon className="h-5 w-5" aria-hidden="true" />
            <span>Cart</span>
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
