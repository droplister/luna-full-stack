/**
 * Related Product Card Component
 * Simplified product card for "you may also like" sections
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/types/products'
import { getProductUrl } from '@/lib/utils/slugify'

interface RelatedProductCardProps {
  product: Product
}

export function RelatedProductCard({ product }: RelatedProductCardProps) {
  const productUrl = getProductUrl(product)

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
    </div>
  )
}
