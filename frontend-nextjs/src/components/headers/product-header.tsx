/**
 * Product Header Component
 * Header section for product detail pages with brand, title, price, rating, description, and stock
 */

'use client'

import { StarIcon, CheckIcon } from '@heroicons/react/20/solid'

interface ProductHeaderProps {
  brand?: string
  title: string
  price: number
  rating: number
  description: string
  stock: number
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function ProductHeader({
  brand,
  title,
  price,
  rating,
  description,
  stock,
}: ProductHeaderProps) {
  return (
    <div className="lg:max-w-lg lg:self-end">
      {brand && (
        <p className="text-sm font-medium text-gray-500">{brand}</p>
      )}

      <div className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h1>
      </div>

      <section aria-labelledby="information-heading" className="mt-4">
        <h2 id="information-heading" className="sr-only">
          Product information
        </h2>

        <div className="flex items-center">
          <p className="text-lg text-gray-900 sm:text-xl">${price.toFixed(2)}</p>

          <div className="ml-4 border-l border-gray-300 pl-4">
            <h2 className="sr-only">Reviews</h2>
            <div className="flex items-center">
              <div>
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((ratingValue) => (
                    <StarIcon
                      key={ratingValue}
                      aria-hidden="true"
                      className={classNames(
                        rating > ratingValue ? 'text-yellow-400' : 'text-gray-300',
                        'size-5 shrink-0'
                      )}
                    />
                  ))}
                </div>
                <p className="sr-only">{rating} out of 5 stars</p>
              </div>
              <a href="#reviews" className="ml-2 text-sm text-gray-500 hover:text-gray-700">{rating.toFixed(1)} rating</a>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-6">
          <p className="text-base text-gray-500">{description}</p>
        </div>

        <div className="mt-6 flex items-center">
          <CheckIcon aria-hidden="true" className="size-5 shrink-0 text-green-500" />
          <p className="ml-2 text-sm text-gray-500">
            {stock > 0 ? `In stock (${stock} available)` : 'Out of stock'}
          </p>
        </div>
      </section>
    </div>
  )
}
