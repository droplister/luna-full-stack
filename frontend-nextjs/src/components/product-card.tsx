/**
 * Product Card Component
 * Based on Tailwind UI Product Collection Page (category-page-07)
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { StarIcon } from '@heroicons/react/20/solid'
import type { Product } from '@/lib/types/products'
import { Z_INDEX } from '@/lib/config/z-index'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => Promise<void>
  priority?: boolean
}

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
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

  return (
    <div className="group relative text-sm">
      <Link href={`/products/${product.id}`}>
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
        <Link href={`/products/${product.id}`}>
          {product.title}
        </Link>
      </h3>

      {product.brand && (
        <p className="text-gray-500">{product.brand}</p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((starIndex) => (
            <StarIcon
              key={starIndex}
              aria-hidden="true"
              className={classNames(
                rating > starIndex ? 'text-yellow-400' : 'text-gray-200',
                'size-4 shrink-0',
              )}
            />
          ))}
        </div>
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
