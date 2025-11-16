/**
 * Cart Line Item Component
 * Reusable line item display for cart, drawer, and checkout
 * Supports multiple variants: full, compact, summary
 */

import Link from 'next/link'
import Image from 'next/image'
import { CheckIcon, XMarkIcon as XMarkIconMini } from '@heroicons/react/20/solid'
import { ChevronDownIcon } from '@heroicons/react/16/solid'
import { formatPrice } from '@/lib/services/cart'
import type { CartLineItem } from '@/lib/types/cart'
import { getProductUrlFromIdAndTitle } from '@/lib/utils/slugify'
import { toTitleCase } from '@/lib/utils/format'

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
  // Full variant - cart page with dropdown
  if (variant === 'full') {
    return (
      <li className="flex py-6 sm:py-10">
        <div className="shrink-0">
          {item.image ? (
            <Image
              alt={item.title}
              src={item.image}
              width={192}
              height={192}
              className="size-24 rounded-md object-cover sm:size-48"
            />
          ) : (
            <div className="size-24 rounded-md bg-gray-100 sm:size-48" />
          )}
        </div>

        <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
          <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
            <div>
              <div className="flex justify-between">
                <h3 className="text-sm">
                  <Link
                    href={getProductUrlFromIdAndTitle(item.product_id, item.title)}
                    className="font-medium text-gray-700 hover:text-gray-800"
                  >
                    {item.title}
                  </Link>
                </h3>
              </div>
              <div className="mt-1 flex text-sm">
                {item.brand && <p className="text-gray-500">{item.brand}</p>}
                {item.category && (
                  <p className="ml-4 border-l border-gray-200 pl-4 text-gray-500">{item.category}</p>
                )}
              </div>
              <p className="mt-1 text-sm font-medium text-gray-900">{formatPrice(item.price, currency)}</p>
            </div>

            <div className="mt-4 sm:mt-0 sm:pr-9">
              <div className="inline-grid w-full max-w-16 grid-cols-1">
                <select
                  id={`quantity-${itemIdx}`}
                  name={`quantity-${itemIdx}`}
                  value={item.quantity}
                  onChange={(e) => onUpdateQuantity?.(item.line_id, parseInt(e.target.value))}
                  disabled={isLoading}
                  aria-label={`Quantity, ${item.title}`}
                  className="col-start-1 row-start-1 appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 disabled:opacity-50"
                >
                  {Array.from({ length: Math.min(10, item.stock) }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                />
              </div>

              <div className="absolute top-0 right-0">
                <button
                  type="button"
                  onClick={() => onRemove?.(item.line_id)}
                  disabled={isLoading}
                  className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50 cursor-pointer"
                >
                  <span className="sr-only">Remove</span>
                  <XMarkIconMini aria-hidden="true" className="size-5" />
                </button>
              </div>
            </div>
          </div>

          <p className="mt-4 flex space-x-2 text-sm text-gray-700">
            {item.stock > 0 ? (
              <>
                <CheckIcon aria-hidden="true" className="size-5 shrink-0 text-green-500" />
                <span>
                  {item.stock <= 5 ? `Only ${item.stock} left in stock` : 'In stock'}
                </span>
              </>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </p>
        </div>
      </li>
    )
  }

  // Compact variant - cart drawer with +/- buttons
  if (variant === 'compact') {
    const productUrl = getProductUrlFromIdAndTitle(item.product_id, item.title)

    return (
      <li className="flex py-6">
        <Link
          href={productUrl}
          onClick={onNavigate}
          className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200"
        >
          <Image
            alt={item.title}
            src={item.image || ''}
            width={96}
            height={96}
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
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">{item.brand || (item.category ? toTitleCase(item.category) : item.sku)}</p>
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
              <div className="flex h-6 min-w-12 items-center justify-center rounded border border-gray-300 bg-gray-50 px-2 text-sm font-medium text-gray-900 sm:h-7">
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
                className="flex size-6 items-center justify-center disabled:opacity-50 cursor-pointer sm:size-7 lg:size-auto lg:gap-1"
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
                <p className="ml-4 border-l border-gray-200 pl-4 text-gray-500">{item.category}</p>
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
