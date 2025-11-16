/**
 * Product Card Component
 * Based on Tailwind UI Product Collection Page (category-page-07)
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import type { Product } from '@/lib/types/products'
import { Z_INDEX } from '@/lib/config/z-index'
import { StarRating } from '../ui/star-rating'
import { getProductUrl } from '@/lib/utils/slugify'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => Promise<void>
  priority?: boolean
}

export function ProductCard({ product, onAddToCart, priority = false }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsAdding(true)
    try {
      await onAddToCart(product)
    } finally {
      setIsAdding(false)
    }
  }

  const rating = product.rating || 0

  const productUrl = getProductUrl(product)

  return (
    <div className="group relative text-sm">
      <Link href={productUrl}>
        <Image
          alt={product.title}
          src={product.thumbnail}
          width={400}
          height={400}
          loading={priority ? "eager" : "lazy"}
          className="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75"
        />
        <span aria-hidden="true" className="absolute inset-0" style={{ zIndex: Z_INDEX.PRODUCT_OVERLAY }} />
      </Link>

      <h3 className="mt-4 font-medium text-gray-900">
        <Link href={productUrl}>
          {product.title}
        </Link>
      </h3>

      {product.brand && (
        <p className="text-gray-500">{product.brand}</p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <StarRating rating={rating} size="sm" />
        <p className="font-medium text-gray-900">${product.price.toFixed(2)}</p>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isAdding || product.stock === 0}
        className="relative mt-4 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400"
        style={{ zIndex: Z_INDEX.ADD_TO_CART_BUTTON }}
      >
        {isAdding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  )
}
