/**
 * Checkout Order Summary Component
 * Order summary for checkout page with desktop/mobile responsive display
 * Includes mobile popover for pricing breakdown
 */

import Image from 'next/image'
import { ChevronUpIcon } from '@heroicons/react/20/solid'
import { Popover, PopoverBackdrop, PopoverButton, PopoverPanel } from '@headlessui/react'
import { formatPrice } from '@/lib/services/cart'
import type { CartLineItem } from '@/lib/types/cart'
import { kebabToTitleCase } from '@/lib/utils/format'

interface CheckoutOrderSummaryProps {
  items: CartLineItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  currency: string
}

export function CheckoutOrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  total,
  currency,
}: CheckoutOrderSummaryProps) {
  return (
    <section
      aria-labelledby="summary-heading"
      className="bg-gray-50 px-4 pt-16 pb-10 sm:px-6 lg:col-start-2 lg:row-start-1 lg:bg-transparent lg:px-0 lg:pb-16"
    >
      <div className="mx-auto max-w-lg lg:max-w-none">
        <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
          Order summary
        </h2>

        <ul role="list" className="divide-y divide-gray-200 text-sm font-medium text-gray-900">
          {items.map((item) => (
            <li key={item.line_id} className="flex items-start space-x-4 py-6">
              {item.image ? (
                <Image
                  alt={item.title}
                  src={item.image}
                  width={80}
                  height={80}
                  className="size-20 flex-none rounded-md object-cover"
                />
              ) : (
                <div className="size-20 flex-none rounded-md bg-gray-100" />
              )}
              <div className="flex-auto space-y-1">
                <h3>{item.title}</h3>
                {item.brand && <p className="text-gray-500">{item.brand}</p>}
                {item.category && <p className="text-gray-500">{kebabToTitleCase(item.category)}</p>}
                <p className="text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="flex-none text-base font-medium">{formatPrice(item.line_total, currency)}</p>
            </li>
          ))}
        </ul>

        <dl className="hidden space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-900 lg:block">
          <div className="flex items-center justify-between">
            <dt className="text-gray-600">Subtotal</dt>
            <dd>{formatPrice(subtotal, currency)}</dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="text-gray-600">Shipping</dt>
            <dd>{shipping === 0 ? '✨ FREE' : formatPrice(shipping, currency)}</dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="text-gray-600">Taxes</dt>
            <dd>{formatPrice(tax, currency)}</dd>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <dt className="text-base">Total</dt>
            <dd className="text-base">{formatPrice(total, currency)}</dd>
          </div>
        </dl>

        {/* Mobile order summary popover */}
        <Popover className="fixed inset-x-0 bottom-0 flex flex-col-reverse text-sm font-medium text-gray-900 lg:hidden">
          <div className="relative z-10 border-t border-gray-200 bg-white px-4 sm:px-6">
            <div className="mx-auto max-w-lg">
              <PopoverButton className="flex w-full items-center py-6 font-medium">
                <span className="mr-auto text-base">Total</span>
                <span className="mr-2 text-base">{formatPrice(total, currency)}</span>
                <ChevronUpIcon aria-hidden="true" className="size-5 text-gray-500" />
              </PopoverButton>
            </div>
          </div>

          <PopoverBackdrop
            transition
            className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
          />
          <PopoverPanel
            transition
            className="relative transform bg-white px-4 py-6 transition duration-300 ease-in-out data-closed:translate-y-full sm:px-6"
          >
            <dl className="mx-auto max-w-lg space-y-6">
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Subtotal</dt>
                <dd>{formatPrice(subtotal, currency)}</dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Shipping</dt>
                <dd>{shipping === 0 ? '✨ FREE' : formatPrice(shipping, currency)}</dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Taxes</dt>
                <dd>{formatPrice(tax, currency)}</dd>
              </div>
            </dl>
          </PopoverPanel>
        </Popover>
      </div>
    </section>
  )
}
