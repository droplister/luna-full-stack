/**
 * Breadcrumbs Component
 * Shared breadcrumb navigation component
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/lib/hooks/useCart'
import { ApparateButton } from './apparate-button'

export interface Breadcrumb {
  name: string
  href?: string
}

interface BreadcrumbsProps {
  items: Breadcrumb[]
  showCheckout?: boolean
  currentProductId?: number
}

export function Breadcrumbs({ items, showCheckout = true, currentProductId }: BreadcrumbsProps) {
  const { itemCount } = useCart()
  const [showButton, setShowButton] = useState(itemCount > 0)
  const prevItemCountRef = useRef(itemCount)

  useEffect(() => {
    const prevCount = prevItemCountRef.current

    // If going from 0 to 1+ items, delay the button appearance
    if (prevCount === 0 && itemCount > 0) {
      const timer = setTimeout(() => {
        setShowButton(true)
      }, 400) // 400ms delay to let cart overlay finish opening

      return () => clearTimeout(timer)
    }
    // If items removed or already had items, show immediately
    else if (itemCount > 0) {
      setShowButton(true)
    }
    // Hide immediately when count goes to 0
    else {
      setShowButton(false)
    }

    prevItemCountRef.current = itemCount
  }, [itemCount])

  if (items.length <= 1) {
    return null
  }

  return (
    <div className="border-b border-gray-200">
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <ol role="list" className="flex items-center space-x-4">
            {items.map((breadcrumb, index) => (
              <li key={`${breadcrumb.name}-${index}`}>
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

          <div className="hidden lg:block -my-2">
            {showCheckout && showButton ? (
              <Link
                href="/checkout"
                className="flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <ShoppingBagIcon className="h-5 w-5" aria-hidden="true" />
                Checkout
              </Link>
            ) : (
              <ApparateButton currentProductId={currentProductId} />
            )}
          </div>
        </div>
      </nav>
    </div>
  )
}
