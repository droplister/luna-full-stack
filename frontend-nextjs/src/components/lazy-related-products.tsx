/**
 * Lazy Related Products Wrapper
 * Wrapper component to handle related products fetching and display
 */

'use client'

import { useRelatedProducts } from '@/lib/hooks/useProducts'
import { RelatedProducts } from './related-products'

interface LazyRelatedProductsProps {
  category: string | undefined
  currentProductId: number | undefined
}

export function LazyRelatedProducts({ category, currentProductId }: LazyRelatedProductsProps) {
  const { products: relatedProducts } = useRelatedProducts(category, currentProductId, 4)

  return <RelatedProducts products={relatedProducts} category={category} />
}
