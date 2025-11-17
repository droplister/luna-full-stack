/**
 * Cart Line Item Component
 * Reusable line item display for cart, drawer, and checkout
 * Supports multiple variants: full, compact, summary
 */

import Link from 'next/link'
import Image from 'next/image'
import { CheckIcon, XMarkIcon as XMarkIconMini } from '@heroicons/react/20/solid'
import { ChevronDownIcon } from '@heroicons/react/16/solid'
import { formatPrice, kebabToTitleCase } from '@/lib/utils/format'
import type { CartLineItem } from '@/lib/types/cart'
import { getProductUrlFromIdAndTitle } from '@/lib/utils/slugify'

type Variant = 'full' | 'compact' | 'summary'

interface CartLineItemProps {
  item: CartLineItem
  currency: string
  variant?: Variant
  isLoading?: boolean
  onUpdateQuantity?: (lineId: string, quantity: number) => void
  onIncrement?: (lineId: string) => void
  onDecrement?: (lineId: string) => void
  onRemove?: (lineId: string) => void
  onNavigate?: () => void
  itemIdx?: number
}

export function CartLineItem({
  item,
  currency,
  variant = 'full',
  isLoading = false,
  onUpdateQuantity,
  onIncrement,
  onDecrement,
  onRemove,
  onNavigate,
  itemIdx = 0,
}: CartLineItemProps) {
  // Compact variant - cart drawer and cart page with +/- buttons
  if (variant === 'compact') {
    const productUrl = getProductUrlFromIdAndTitle(item.product_id, item.title)

    return (
      <li className="flex py-6">
        <Link
          href={productUrl}
          onClick={onNavigate}
          className="size-24 sm:size-32 shrink-0 overflow-hidden rounded-md border border-gray-200"
        >
          <Image
            alt={item.title}
            src={item.image || ''}
            width={128}
            height={128}
            className="size-full object-cover"
          />
        </Link>

        <div className="ml-4 flex flex-1 flex-col">
          <div>
            <div className="flex justify-between text-sm font-medium text-gray-900 sm:text-base">
              <h3>
                <Link
                  href={productUrl}
                  onClick={onNavigate}
                  className="hover:text-gray-700"
                >
                  {item.title}
                </Link>
              </h3>
              <p className="ml-4">{formatPrice(item.line_total, currency)}</p>
            </div>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">{item.brand || (item.category ? kebabToTitleCase(item.category) : item.sku)}</p>
          </div>
          <div className="mt-2 flex flex-1 items-end justify-between text-sm">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onDecrement?.(item.line_id)}
                disabled={isLoading}
                className="flex size-6 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 cursor-pointer sm:size-7"
              >
                −
              </button>
              <div data-testid="cart-item-quantity" className="flex h-6 min-w-12 items-center justify-center rounded border border-gray-300 bg-gray-50 px-2 text-sm font-medium text-gray-900 sm:h-7">
                {item.quantity}
              </div>
              <button
                type="button"
                onClick={() => onIncrement?.(item.line_id)}
                disabled={isLoading || item.quantity >= item.stock}
                className="flex size-6 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 cursor-pointer sm:size-7"
                title={item.quantity >= item.stock ? 'Maximum stock reached' : 'Increase quantity'}
              >
                +
              </button>
            </div>

            <div className="flex">
              <button
                type="button"
                onClick={() => onRemove?.(item.line_id)}
                disabled={isLoading}
                className="flex size-6 items-center justify-center cursor-pointer sm:size-7 lg:size-auto lg:gap-1"
                aria-label="Remove item"
              >
                <XMarkIconMini aria-hidden="true" className="size-5 text-red-500 hover:text-red-600 sm:size-6 lg:size-4" />
                <span className="hidden text-sm text-gray-600 hover:text-gray-800 lg:inline">Remove</span>
              </button>
            </div>
          </div>
        </div>
      </li>
    )
  }

  // Summary variant - checkout (read-only)
  if (variant === 'summary') {
    return (
      <li className="flex py-6 sm:py-10">
        <div className="shrink-0">
          {item.image ? (
            <Image
              alt={item.title}
              src={item.image}
              width={96}
              height={96}
              className="size-24 rounded-md object-cover"
            />
          ) : (
            <div className="size-24 rounded-md bg-gray-100" />
          )}
        </div>

        <div className="ml-4 flex flex-1 flex-col justify-between">
          <div>
            <div className="flex justify-between text-sm">
              <h3 className="font-medium text-gray-900">{item.title}</h3>
              <p className="ml-4 font-medium text-gray-900">{formatPrice(item.line_total, currency)}</p>
            </div>
            <div className="mt-1 flex text-sm">
              {item.brand && <p className="text-gray-500">{item.brand}</p>}
              {item.category && (
                <p className="ml-4 border-l border-gray-200 pl-4 text-gray-500">{kebabToTitleCase(item.category)}</p>
              )}
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">Qty {item.quantity}</p>
        </div>
      </li>
    )
  }

  return null
}
