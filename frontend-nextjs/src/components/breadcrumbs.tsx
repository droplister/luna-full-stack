/**
 * Breadcrumbs Component
 * Shared breadcrumb navigation component
 */

'use client'

import Link from 'next/link'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/lib/hooks/useCart'

export interface Breadcrumb {
  name: string
  href?: string
}

interface BreadcrumbsProps {
  items: Breadcrumb[]
  showCheckout?: boolean
}

export function Breadcrumbs({ items, showCheckout = true }: BreadcrumbsProps) {
  const { itemCount } = useCart()

  if (items.length <= 1) {
    return null
  }

  return (
    <div className="border-b border-gray-200">
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <ol role="list" className="flex items-center space-x-4">
            {items.map((breadcrumb, index) => (
              <li key={breadcrumb.href + index}>
                <div className="flex items-center">
                  {index > 0 && (
                    <svg
                      viewBox="0 0 6 20"
                      aria-hidden="true"
                      className="h-5 w-auto text-gray-300 mr-4"
                    >
                      <path d="M4.878 4.34H3.551L.27 16.532h1.327l3.281-12.19z" fill="currentColor" />
                    </svg>
                  )}
                  {breadcrumb.href ? (
                    <Link
                      href={breadcrumb.href}
                      className="text-sm font-medium text-gray-900 hover:text-gray-600"
                    >
                      {breadcrumb.name}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-gray-500 hover:text-gray-600">
                      {breadcrumb.name}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {showCheckout && itemCount > 0 && (
            <div className="hidden lg:block">
              <Link
                href="/cart"
                className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                <ShoppingBagIcon className="h-5 w-5" aria-hidden="true" />
                Checkout
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}
