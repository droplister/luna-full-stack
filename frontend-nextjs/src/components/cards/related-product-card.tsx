/**
 * Related Product Card Component
 * Simplified product card for "you may also like" sections
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/types/products'
import { getProductUrl } from '@/utils/slugify'

interface RelatedProductCardProps {
  product: Product
  showAddToCart?: boolean
  onAddToCart?: (product: Product) => Promise<void>
}

export function RelatedProductCard({ product, showAddToCart = false, onAddToCart }: RelatedProductCardProps) {
  const productUrl = getProductUrl(product)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!onAddToCart) return

    setIsAdding(true)
    try {
      await onAddToCart(product)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="group relative">
      <Link href={productUrl}>
        <Image
          alt={product.title}
          src={product.thumbnail}
          width={300}
          height={300}
          className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
        />
        <div className="mt-4 flex justify-between">
          <div>
            <h3 className="text-sm text-gray-700">
              <span aria-hidden="true" className="absolute inset-0" />
              {product.title}
            </h3>
            {product.brand && (
              <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</p>
        </div>
      </Link>

      {showAddToCart && (
        <button
          onClick={handleAddToCart}
          disabled={isAdding || product.stock === 0}
          className="relative mt-4 w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400 cursor-pointer"
        >
          {isAdding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to cart'}
        </button>
      )}
    </div>
  )
}
