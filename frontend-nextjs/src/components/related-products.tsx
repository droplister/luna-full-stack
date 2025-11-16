/**
 * Related Products Component
 * Displays products from the same category
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/types/products'

interface RelatedProductsProps {
  products: Product[]
  title?: string
  category?: string
}

export function RelatedProducts({ products, title = "You may also like", category }: RelatedProductsProps) {
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
              href={`/category/${category}`}
              className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-500 md:block"
            >
              Shop the collection
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <Link href={`/products/${product.id}`}>
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
          ))}
        </div>

        {category && (
          <div className="mt-8 text-sm md:hidden">
            <Link href={`/category/${category}`} className="font-medium text-indigo-600 hover:text-indigo-500">
              Shop the collection
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
