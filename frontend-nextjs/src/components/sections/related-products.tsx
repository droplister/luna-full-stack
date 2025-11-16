/**
 * Related Products Component
 * Displays products from the same category (lazy-loaded)
 */

'use client'

import Link from 'next/link'
import { useRelatedProducts } from '@/lib/hooks/useProducts'
import { RelatedProductCard } from '../cards/related-product-card'

interface RelatedProductsProps {
  category?: string | undefined
  currentProductId?: number | undefined
  limit?: number
  title?: string
}

export function RelatedProducts({
  category,
  currentProductId,
  limit = 4,
  title = "You may also like"
}: RelatedProductsProps) {
  const { products } = useRelatedProducts(category, currentProductId, limit)

  if (products.length === 0) {
    return null
  }

  return (
    <div className="bg-white">
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
          {products.map((product) => (
            <RelatedProductCard key={product.id} product={product} />
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
}
