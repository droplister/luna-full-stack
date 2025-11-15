/**
 * Products Listing Page
 * Based on Tailwind UI Product Collection Page (pcp.tsx)
 */

'use client'

import { useProducts } from '@/lib/hooks/useProducts'
import { useCart } from '@/lib/hooks/useCart'
import { ProductCard } from '@/components/product-card'
import { Pagination } from '@/components/pagination'

export default function ProductsPage() {
  const { products, page, totalPages, isLoading, error, goToPage } = useProducts({ limit: 12 })
  const { addItem } = useCart()

  if (error) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">Error loading products: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={addItem} />
              ))}
            </div>

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={goToPage} />
          </>
        )}
      </div>
    </div>
  )
}
