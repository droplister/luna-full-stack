/**
 * Related Products Component
 * Displays products from the same category (lazy-loaded)
 */

'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import { useRelatedProducts } from '@/lib/hooks/useProducts'
import { RelatedProductCard } from '../cards/related-product-card'
import type { Product } from '@/lib/types/products'

interface RelatedProductsProps {
  category?: string | undefined
  currentProductId?: number | undefined
  excludeProductIds?: number[]
  limit?: number
  title?: string
  showBackground?: boolean
  showAddToCart?: boolean
  onAddToCart?: (product: Product) => Promise<void>
}

export const RelatedProducts = memo(function RelatedProducts({
  category,
  currentProductId,
  excludeProductIds = [],
  limit = 4,
  title = "You may also like",
  showBackground = true,
  showAddToCart = false,
  onAddToCart
}: RelatedProductsProps) {
  const { products } = useRelatedProducts(category, currentProductId, limit + excludeProductIds.length)

  // Filter out products that are in the exclude list
  // Memoize to prevent recalculation when excludeProductIds array reference changes but values are the same
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => !excludeProductIds.includes(p.id))
      .slice(0, limit)
  }, [products, excludeProductIds, limit])

  if (filteredProducts.length === 0) {
    return null
  }

  return (
    <div className={showBackground ? "bg-white" : ""}>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
          {category && (
            <Link
              href={`/collections/${category}`}
              className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-500 md:block"
            >
              Shop the collection
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 xl:gap-x-8">
          {filteredProducts.map((product) => (
            <RelatedProductCard
              key={product.id}
              product={product}
              showAddToCart={showAddToCart}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        {category && (
          <div className="mt-8 text-sm md:hidden">
            <Link href={`/collections/${category}`} className="font-medium text-indigo-600 hover:text-indigo-500">
              Shop the collection
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
})
