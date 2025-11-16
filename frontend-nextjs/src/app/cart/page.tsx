'use client'

import Link from 'next/link'
import Image from 'next/image'
import { CheckIcon, QuestionMarkCircleIcon, XMarkIcon as XMarkIconMini } from '@heroicons/react/20/solid'
import { ChevronDownIcon } from '@heroicons/react/16/solid'
import { LazyRelatedProducts } from '@/components/lazy-related-products'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { useCart } from '@/lib/hooks/useCart'
import { formatPrice } from '@/lib/services/cart'
import { calculateShipping, calculateTax } from '@/lib/config/cart'

export default function CartPage() {
  const { items, subtotal, currency, isLoading, updateQuantity, removeItem } = useCart()

  // Calculate shipping and tax
  const shipping = calculateShipping(subtotal)
  const tax = calculateTax(subtotal, shipping)

  // Calculate total
  const total = subtotal + shipping + tax

  const isEmpty = items.length === 0

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'My Cart' },
  ]

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Shopping Cart</h1>

        {isEmpty ? (
          <div className="mt-12 text-center">
            <p className="text-lg text-gray-500">Your cart is empty</p>
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-indigo-700"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
            <section aria-labelledby="cart-heading" className="lg:col-span-7">
              <h2 id="cart-heading" className="sr-only">
                Items in your shopping cart
              </h2>

              <ul role="list" className="divide-y divide-gray-200 border-t border-b border-gray-200">
                {items.map((item, itemIdx) => (
                  <li key={item.line_id} className="flex py-6 sm:py-10">
                    <div className="shrink-0">
                      {item.image ? (
                        <Image
                          alt={item.title}
                          src={item.image}
                          width={192}
                          height={192}
                          className="size-24 rounded-md object-cover sm:size-48"
                        />
                      ) : (
                        <div className="size-24 rounded-md bg-gray-100 sm:size-48" />
                      )}
                    </div>

                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                      <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                        <div>
                          <div className="flex justify-between">
                            <h3 className="text-sm">
                              <Link
                                href={`/products/${item.product_id}`}
                                className="font-medium text-gray-700 hover:text-gray-800"
                              >
                                {item.title}
                              </Link>
                            </h3>
                          </div>
                          <div className="mt-1 flex text-sm">
                            {item.brand && <p className="text-gray-500">{item.brand}</p>}
                            {item.category && (
                              <p className="ml-4 border-l border-gray-200 pl-4 text-gray-500">{item.category}</p>
                            )}
                          </div>
                          <p className="mt-1 text-sm font-medium text-gray-900">{formatPrice(item.price, currency)}</p>
                        </div>

                        <div className="mt-4 sm:mt-0 sm:pr-9">
                          <div className="inline-grid w-full max-w-16 grid-cols-1">
                            <select
                              id={`quantity-${itemIdx}`}
                              name={`quantity-${itemIdx}`}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.line_id, parseInt(e.target.value))}
                              disabled={isLoading}
                              aria-label={`Quantity, ${item.title}`}
                              className="col-start-1 row-start-1 appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 disabled:opacity-50"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <option key={num} value={num}>
                                  {num}
                                </option>
                              ))}
                            </select>
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                            />
                          </div>

                          <div className="absolute top-0 right-0">
                            <button
                              type="button"
                              onClick={() => removeItem(item.line_id)}
                              disabled={isLoading}
                              className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50"
                            >
                              <span className="sr-only">Remove</span>
                              <XMarkIconMini aria-hidden="true" className="size-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 flex space-x-2 text-sm text-gray-700">
                        <CheckIcon aria-hidden="true" className="size-5 shrink-0 text-green-500" />
                        <span>In stock</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Order summary */}
            <section
              aria-labelledby="summary-heading"
              className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
            >
              <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
                Order summary
              </h2>

              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">{formatPrice(subtotal, currency)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="flex items-center text-sm text-gray-600">
                    <span>Shipping estimate</span>
                    <a href="#" className="ml-2 shrink-0 text-gray-400 hover:text-gray-500">
                      <span className="sr-only">Learn more about how shipping is calculated</span>
                      <QuestionMarkCircleIcon aria-hidden="true" className="size-5" />
                    </a>
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {shipping === 0 ? 'FREE' : formatPrice(shipping, currency)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="flex text-sm text-gray-600">
                    <span>Tax estimate</span>
                    <a href="#" className="ml-2 shrink-0 text-gray-400 hover:text-gray-500">
                      <span className="sr-only">Learn more about how tax is calculated</span>
                      <QuestionMarkCircleIcon aria-hidden="true" className="size-5" />
                    </a>
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">{formatPrice(tax, currency)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">Order total</dt>
                  <dd className="text-base font-medium text-gray-900">{formatPrice(total, currency)}</dd>
                </div>
              </dl>

              <div className="mt-6">
                <Link
                  href="/checkout"
                  className="w-full block text-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-xs hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-hidden"
                >
                  Checkout
                </Link>
              </div>
            </section>
          </div>
        )}

        {/* Related products */}
        {!isEmpty && (
          <section aria-labelledby="related-heading" className="mt-24">
            <h2 id="related-heading" className="text-lg font-medium text-gray-900">
              You may also like&hellip;
            </h2>
            <div className="mt-6">
              <LazyRelatedProducts limit={4} />
            </div>
          </section>
        )}
      </div>
    </>
  )
}
