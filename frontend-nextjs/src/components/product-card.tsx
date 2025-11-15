/**
 * Product Card Component
 * Based on Tailwind UI Product Collection Page (category-page-07)
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import type { Product } from '@/lib/types/products'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => Promise<void>
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
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

  return (
    <div className="group text-sm">
      <Link href={`/products/${product.id}`}>
        <Image
          alt={product.title}
          src={product.thumbnail}
          width={400}
          height={400}
          className="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75"
        />
      </Link>
      <h3 className="mt-4 font-medium text-gray-900">{product.title}</h3>
      <p className="italic text-gray-500">{product.brand || product.category}</p>
      <p className="mt-2 font-medium text-gray-900">${product.price.toFixed(2)}</p>

      <button
        onClick={handleAddToCart}
        disabled={isAdding || product.stock === 0}
        className="mt-2 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isAdding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  )
}
