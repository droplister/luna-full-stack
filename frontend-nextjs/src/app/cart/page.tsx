'use client'

import Link from 'next/link'
import { RelatedProducts } from '@/components/sections/related-products'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { CartLineItem } from '@/components/cart/cart-line-item'
import { OrderSummary } from '@/components/cart/order-summary'
import { EmptyCart } from '@/components/cart/empty-cart'
import { useCart } from '@/lib/hooks/useCart'
import { calculateShipping, calculateTax } from '@/lib/config/cart'

export default function CartPage() {
  const { items, subtotal, currency, isLoading, isItemLoading, updateQuantity, removeItem } = useCart()

  // Calculate shipping and tax
  const shipping = calculateShipping(subtotal)
  const tax = calculateTax(subtotal, shipping)

  // Calculate total
  const total = subtotal + shipping + tax

  const isEmpty = items.length === 0

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'My Cart' },
  ]

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Shopping Cart</h1>

        {isEmpty ? (
          <EmptyCart variant="full" />
        ) : (
          <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
            <section aria-labelledby="cart-heading" className="lg:col-span-7">
              <h2 id="cart-heading" className="sr-only">
                Items in your shopping cart
              </h2>

              <ul role="list" className="divide-y divide-gray-200 border-t border-b border-gray-200">
                {items.map((item, itemIdx) => (
                  <CartLineItem
                    key={item.line_id}
                    item={item}
                    currency={currency}
                    variant="full"
                    isLoading={isItemLoading(item.line_id)}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                    itemIdx={itemIdx}
                  />
                ))}
              </ul>
            </section>

            {/* Order summary */}
            <OrderSummary
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              currency={currency}
              variant="full"
            />
          </div>
        )}

        {/* Related products */}
        {!isEmpty && (
          <section aria-labelledby="related-heading" className="mt-24">
            <h2 id="related-heading" className="text-lg font-medium text-gray-900">
              You may also like&hellip;
            </h2>
            <div className="mt-6">
              <RelatedProducts limit={4} />
            </div>
          </section>
        )}
      </div>
    </>
  )
}
