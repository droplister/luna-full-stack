/**
 * Product Detail Page Client Component
 * All client-side UI and interaction logic
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { StarIcon, CheckIcon } from '@heroicons/react/20/solid'
import { TruckIcon, ShieldCheckIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { useProduct, useRelatedProducts } from '@/hooks/useProducts'
import { useCart } from '@/hooks/useCart'
import { useDelayedLoading } from '@/hooks/useDelayedLoading'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { DiscountStarburst } from '@/components/ui/discount-starburst'
import { ProductIncentives } from '@/components/sections/product-incentives'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { extractIdFromSlug } from '@/utils/slugify'
import { calculateReviewStats } from '@/lib/services/reviews'

// Lazy load below-the-fold components with loading states for better above-the-fold performance
const RelatedProducts = dynamic(
  () => import('@/components/sections/related-products').then((mod) => ({ default: mod.RelatedProducts })),
  {
    loading: () => (
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square w-full bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    ),
    ssr: false, // Don't SSR to prioritize above-the-fold content
  }
)

const ProductReviews = dynamic(
  () => import('@/components/sections/product-reviews').then((mod) => ({ default: mod.ProductReviews })),
  {
    loading: () => (
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    ),
    ssr: false, // Don't SSR to prioritize above-the-fold content
  }
)

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface ProductPageClientProps {
  params: {
    id: string
  }
}

export function ProductPageClient({ params }: ProductPageClientProps) {
  // Extract product ID from either numeric ID or slug (e.g., "essence-mascara-1")
  const productId = extractIdFromSlug(params.id) || 0
  const { product, isLoading, error } = useProduct(productId)
  const { addItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  // Cache previous product category to prevent breadcrumb flicker during navigation
  const previousCategoryRef = useRef<string | undefined>(product?.category)
  useEffect(() => {
    if (product?.category) {
      previousCategoryRef.current = product.category
    }
  }, [product?.category])

  // Use current category if available, otherwise fall back to previous to prevent flicker
  const stableCategory = product?.category || previousCategoryRef.current
  const breadcrumbs = useBreadcrumbs({ productCategory: stableCategory })

  // Fetch related products (used by RelatedProducts component below)
  const { products: relatedProducts } = useRelatedProducts(product?.category, productId, 20)

  // Delay showing loading state to prevent flicker for fast loads
  const shouldShowLoading = useDelayedLoading(isLoading)

  // Calculate reviews data from actual product reviews
  const reviewsData = product ? calculateReviewStats(product.reviews) : null

  const handleAddToCart = async () => {
    if (!product) return

    setIsAdding(true)
    try {
      await addItem(product)
    } finally {
      setIsAdding(false)
    }
  }

  if (error) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">Error loading product: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Only show loading state if it's been loading for a while (prevents flicker)
  if (shouldShowLoading) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">Loading product...</p>
          </div>
        </div>
      </div>
    )
  }

  // If data loaded but no product found (only show if fully done loading)
  if (!product && !isLoading && !shouldShowLoading) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">Product not found</p>
          </div>
        </div>
      </div>
    )
  }

  // Safety check: if still loading and no product, show breadcrumbs but hide content
  if (!product) {
    return (
      <div className="bg-white">
        {/* Show stable breadcrumbs during transition */}
        <Breadcrumbs items={breadcrumbs} currentProductId={productId} />
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} currentProductId={productId} />

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-12 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
        {/* Product image - First on mobile */}
        <div className="lg:col-start-2 lg:row-span-2 lg:self-center">
          <div className="overflow-hidden rounded-lg lg:cursor-zoom-in">
            <Image
              alt={product.title}
              src={product.images[0] || product.thumbnail}
              width={600}
              height={600}
              loading="eager"
              className="aspect-square w-full object-cover lg:transition-all lg:duration-300 lg:hover:scale-125"
            />
          </div>
        </div>

        {/* Product details */}
        <div className="mt-10 lg:mt-0 lg:col-start-1 lg:row-start-1 lg:max-w-lg lg:self-end">
          {product.brand && <p className="text-sm font-medium text-gray-500">{product.brand}</p>}

          <div className="mt-4 flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{product.title}</h1>
            {product.discountPercentage >= 10 && <DiscountStarburst discount={Math.round(product.discountPercentage)} />}
          </div>

          <section aria-labelledby="information-heading" className="mt-4">
            <h2 id="information-heading" className="sr-only">
              Product information
            </h2>

            <div className="flex items-center">
              <p className="text-lg text-gray-900 sm:text-xl">${product.price.toFixed(2)}</p>

              <div className="ml-4 border-l border-gray-300 pl-4">
                <h2 className="sr-only">Reviews</h2>
                <div className="flex items-center">
                  <div>
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <StarIcon
                          key={rating}
                          aria-hidden="true"
                          className={classNames(product.rating > rating ? 'text-yellow-400' : 'text-gray-300', 'size-5 shrink-0')}
                        />
                      ))}
                    </div>
                    <p className="sr-only">{product.rating} out of 5 stars</p>
                  </div>
                  <a href="#reviews" className="ml-2 text-sm text-gray-500 hover:text-gray-700">
                    {product.rating.toFixed(1)} rating
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-6">
              <p className="text-base text-gray-500">{product.description}</p>
            </div>

            <div className="mt-6 flex items-center">
              <CheckIcon aria-hidden="true" className="size-5 shrink-0 text-green-500" />
              <p className="ml-2 text-sm text-gray-500">{product.stock > 0 ? `In stock (${product.stock} available)` : 'Out of stock'}</p>
            </div>
          </section>
        </div>

        {/* Product form */}
        <div className="mt-10 lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:self-start">
          <section aria-labelledby="options-heading">
            <h2 id="options-heading" className="sr-only">
              Product options
            </h2>

            <div className="mt-10">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding || product.stock === 0}
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-semibold text-white hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isAdding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to cart'}
              </button>
            </div>

            {/* Shipping and Warranty - inline and centered */}
            {(product.shippingInformation || (product.warrantyInformation && product.warrantyInformation.toLowerCase() !== 'no warranty')) && (
              <div className="mt-4 flex items-center justify-center gap-6 text-center">
                {product.shippingInformation && (
                  <div className="flex items-center">
                    <TruckIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                    <span className="ml-2 text-sm font-semibold text-gray-500">{product.shippingInformation}</span>
                  </div>
                )}
                {product.warrantyInformation && product.warrantyInformation.toLowerCase() !== 'no warranty' && (
                  <div className="flex items-center">
                    <ShieldCheckIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                    <span className="ml-2 text-sm font-semibold text-gray-500">{product.warrantyInformation}</span>
                  </div>
                )}
              </div>
            )}

            {/* Product Details Accordion */}
            <div className="mt-10 divide-y divide-gray-200 border-t border-gray-200">
              <Disclosure as="div" className="py-6">
                {({ open }) => (
                  <>
                    <h3>
                      <DisclosureButton className="group flex w-full items-center justify-between text-left text-sm text-gray-400 hover:text-gray-500 cursor-pointer">
                        <span className={classNames(open ? 'text-indigo-600' : 'text-gray-900', 'font-medium')}>Details</span>
                        <span className="ml-6 flex items-center">
                          {open ? (
                            <MinusIcon aria-hidden="true" className="size-5 text-indigo-600" />
                          ) : (
                            <PlusIcon aria-hidden="true" className="size-5" />
                          )}
                        </span>
                      </DisclosureButton>
                    </h3>
                    <DisclosurePanel className="prose prose-sm pt-6">
                      <dl className="space-y-3">
                        {product.sku && (
                          <div className="flex justify-between text-sm">
                            <dt className="text-gray-500">SKU</dt>
                            <dd className="text-gray-900">{product.sku}</dd>
                          </div>
                        )}
                        {product.weight && (
                          <div className="flex justify-between text-sm">
                            <dt className="text-gray-500">Weight</dt>
                            <dd className="text-gray-900">{product.weight} kg</dd>
                          </div>
                        )}
                        {product.dimensions && (
                          <div className="flex justify-between text-sm">
                            <dt className="text-gray-500">Dimensions</dt>
                            <dd className="text-gray-900">
                              {product.dimensions.width} × {product.dimensions.height} × {product.dimensions.depth} cm
                            </dd>
                          </div>
                        )}
                      </dl>
                    </DisclosurePanel>
                  </>
                )}
              </Disclosure>

              {product.returnPolicy && (
                <Disclosure as="div" className="py-6">
                  {({ open }) => (
                    <>
                      <h3>
                        <DisclosureButton className="group flex w-full items-center justify-between text-left text-sm text-gray-400 hover:text-gray-500 cursor-pointer">
                          <span className={classNames(open ? 'text-indigo-600' : 'text-gray-900', 'font-medium')}>Returns</span>
                          <span className="ml-6 flex items-center">
                            {open ? (
                              <MinusIcon aria-hidden="true" className="size-5 text-indigo-600" />
                            ) : (
                              <PlusIcon aria-hidden="true" className="size-5" />
                            )}
                          </span>
                        </DisclosureButton>
                      </h3>
                      <DisclosurePanel className="prose prose-sm pt-6">
                        <p className="text-sm text-gray-600">{product.returnPolicy}</p>
                      </DisclosurePanel>
                    </>
                  )}
                </Disclosure>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Incentives Section */}
      <ProductIncentives shippingInformation={product.shippingInformation} warrantyInformation={product.warrantyInformation} />

      {/* Related Products - Lazy loaded to prioritize above-the-fold content */}
      <RelatedProducts category={product?.category} currentProductId={product?.id} />

      {/* Product Reviews - Lazy loaded to prioritize above-the-fold content */}
      {reviewsData && reviewsData.totalCount > 0 && <ProductReviews reviews={reviewsData} />}
    </div>
  )
}
