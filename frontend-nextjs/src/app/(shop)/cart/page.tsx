'use client'

import { useMemo, useCallback } from 'react'
import Link from 'next/link'
import { RelatedProducts } from '@/components/sections/related-products'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { CartLineItem } from '@/components/cart/cart-line-item'
import { OrderSummary } from '@/components/cart/order-summary'
import { EmptyCart } from '@/components/cart/empty-cart'
import { useCart } from '@/hooks/useCart'
import { calculateShipping, calculateTax } from '@/lib/config/cart'
import type { Product } from '@/lib/types/products'

export default function CartPage() {
  const { items, subtotal, currency, isLoading, isItemLoading, incrementItem, decrementItem, removeItem, addItem } = useCart()

  // Calculate shipping and tax
  const shipping = calculateShipping(subtotal)
  const tax = calculateTax(subtotal, shipping)

  // Calculate total
  const total = subtotal + shipping + tax

  const isEmpty = items.length === 0

  // Get category from last item in cart for related products
  const lastItemCategory = items.length > 0 ? items[items.length - 1].category : undefined

  // Get product IDs in cart to exclude from related products
  // Memoize to prevent array recreation on every render
  const cartProductIds = useMemo(() => items.map(item => item.product_id), [items])

  // Add to cart without opening drawer (we're already on cart page)
  // Memoize to prevent function recreation on every render
  const handleAddToCart = useCallback(async (product: Product) => {
    await addItem(product, 1, false) // Don't open drawer
  }, [addItem])

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
                {items.map((item) => (
                  <CartLineItem
                    key={item.line_id}
                    item={item}
                    currency={currency}
                    variant="compact"
                    isLoading={isItemLoading(item.line_id)}
                    onIncrement={incrementItem}
                    onDecrement={decrementItem}
                    onRemove={removeItem}
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

        {/* Related products based on last item in cart */}
        {!isEmpty && lastItemCategory && (
          <RelatedProducts
            category={lastItemCategory}
            excludeProductIds={cartProductIds}
            limit={4}
            title="You may also like"
            showBackground={false}
            showAddToCart={true}
            onAddToCart={handleAddToCart}
          />
        )}
      </div>
    </>
  )
}
