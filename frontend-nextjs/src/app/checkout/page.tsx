'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRightIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import { Popover, PopoverBackdrop, PopoverButton, PopoverPanel } from '@headlessui/react'
import { useCart } from '@/lib/hooks/useCart'
import { formatPrice } from '@/lib/services/cart'
import { brandConfig } from '@/lib/config/brand'
import { calculateShipping, calculateTax } from '@/lib/config/cart'

const steps = [
  { name: 'Cart', href: '/cart', status: 'complete' },
  { name: 'Billing Information', href: '#', status: 'current' },
  { name: 'Confirmation', href: '#', status: 'upcoming' },
]

export default function CheckoutPage() {
  const { items, subtotal, currency } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate shipping and tax
  const shipping = calculateShipping(subtotal)
  const tax = calculateTax(subtotal, shipping)

  // Calculate total
  const total = subtotal + shipping + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Placeholder - no actual submission yet
    setTimeout(() => {
      setIsSubmitting(false)
      alert('Checkout form submission coming soon!')
    }, 1000)
  }

  return (
    <div className="bg-white">
      {/* Background color split screen for large screens */}
      <div aria-hidden="true" className="fixed top-0 left-0 hidden h-full w-1/2 bg-white lg:block" />
      <div aria-hidden="true" className="fixed top-0 right-0 hidden h-full w-1/2 bg-gray-50 lg:block" />

      {/* Header */}
      <header className="relative border-b border-gray-200 bg-white text-sm font-medium text-gray-700">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="relative flex justify-end sm:justify-center">
            <Link href="/" className="absolute top-1/2 left-0 -mt-4">
              <span className="sr-only">{brandConfig.name}</span>
              <span className="font-brand font-semibold text-3xl text-gray-900">
                {brandConfig.name}
              </span>
            </Link>
            <nav aria-label="Progress" className="hidden sm:block">
              <ol role="list" className="flex space-x-4">
                {steps.map((step, stepIdx) => (
                  <li key={step.name} className="flex items-center">
                    {step.status === 'current' ? (
                      <a href={step.href} aria-current="page" className="text-indigo-600">
                        {step.name}
                      </a>
                    ) : step.status === 'complete' ? (
                      <Link href={step.href} className="hover:text-gray-900">
                        {step.name}
                      </Link>
                    ) : (
                      <span className="text-gray-500">{step.name}</span>
                    )}

                    {stepIdx !== steps.length - 1 ? (
                      <ChevronRightIcon aria-hidden="true" className="ml-4 size-5 text-gray-300" />
                    ) : null}
                  </li>
                ))}
              </ol>
            </nav>
            <p className="sm:hidden">Step 2 of 3</p>
          </div>
        </div>
      </header>

      <main className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8 xl:gap-x-48">
        <h1 className="sr-only">Order information</h1>

        {/* Order summary - Right side on desktop */}
        <section
          aria-labelledby="summary-heading"
          className="bg-gray-50 px-4 pt-16 pb-10 sm:px-6 lg:col-start-2 lg:row-start-1 lg:bg-transparent lg:px-0 lg:pb-16"
        >
          <div className="mx-auto max-w-lg lg:max-w-none">
            <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
              Order summary
            </h2>

            <ul role="list" className="divide-y divide-gray-200 text-sm font-medium text-gray-900">
              {items.map((item) => (
                <li key={item.line_id} className="flex items-start space-x-4 py-6">
                  {item.image ? (
                    <Image
                      alt={item.title}
                      src={item.image}
                      width={80}
                      height={80}
                      className="size-20 flex-none rounded-md object-cover"
                    />
                  ) : (
                    <div className="size-20 flex-none rounded-md bg-gray-100" />
                  )}
                  <div className="flex-auto space-y-1">
                    <h3>{item.title}</h3>
                    {item.brand && <p className="text-gray-500">{item.brand}</p>}
                    {item.category && <p className="text-gray-500">{item.category}</p>}
                    <p className="text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="flex-none text-base font-medium">{formatPrice(item.line_total, currency)}</p>
                </li>
              ))}
            </ul>

            <dl className="hidden space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-900 lg:block">
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Subtotal</dt>
                <dd>{formatPrice(subtotal, currency)}</dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Shipping</dt>
                <dd>{shipping === 0 ? 'FREE' : formatPrice(shipping, currency)}</dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Taxes</dt>
                <dd>{formatPrice(tax, currency)}</dd>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                <dt className="text-base">Total</dt>
                <dd className="text-base">{formatPrice(total, currency)}</dd>
              </div>
            </dl>

            {/* Mobile order summary popover */}
            <Popover className="fixed inset-x-0 bottom-0 flex flex-col-reverse text-sm font-medium text-gray-900 lg:hidden">
              <div className="relative z-10 border-t border-gray-200 bg-white px-4 sm:px-6">
                <div className="mx-auto max-w-lg">
                  <PopoverButton className="flex w-full items-center py-6 font-medium">
                    <span className="mr-auto text-base">Total</span>
                    <span className="mr-2 text-base">{formatPrice(total, currency)}</span>
                    <ChevronUpIcon aria-hidden="true" className="size-5 text-gray-500" />
                  </PopoverButton>
                </div>
              </div>

              <PopoverBackdrop
                transition
                className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
              />
              <PopoverPanel
                transition
                className="relative transform bg-white px-4 py-6 transition duration-300 ease-in-out data-closed:translate-y-full sm:px-6"
              >
                <dl className="mx-auto max-w-lg space-y-6">
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-600">Subtotal</dt>
                    <dd>{formatPrice(subtotal, currency)}</dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-gray-600">Shipping</dt>
                    <dd>{shipping === 0 ? 'FREE' : formatPrice(shipping, currency)}</dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-gray-600">Taxes</dt>
                    <dd>{formatPrice(tax, currency)}</dd>
                  </div>
                </dl>
              </PopoverPanel>
            </Popover>
          </div>
        </section>

        {/* Checkout form - Left side on desktop */}
        <form onSubmit={handleSubmit} className="px-4 pt-16 pb-36 sm:px-6 lg:col-start-1 lg:row-start-1 lg:px-0 lg:pb-16">
          <div className="mx-auto max-w-lg lg:max-w-none">
            {/* Contact information */}
            <section aria-labelledby="contact-info-heading">
              <h2 id="contact-info-heading" className="text-lg font-medium text-gray-900">
                Contact information
              </h2>

              <div className="mt-6">
                <label htmlFor="email-address" className="block text-sm/6 font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email-address"
                    name="email-address"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
            </section>

            {/* Payment details */}
            <section aria-labelledby="payment-heading" className="mt-10">
              <h2 id="payment-heading" className="text-lg font-medium text-gray-900">
                Payment details
              </h2>

              <div className="mt-6 grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4">
                <div className="col-span-3 sm:col-span-4">
                  <label htmlFor="name-on-card" className="block text-sm/6 font-medium text-gray-700">
                    Name on card
                  </label>
                  <div className="mt-2">
                    <input
                      id="name-on-card"
                      name="name-on-card"
                      type="text"
                      autoComplete="cc-name"
                      required
                      className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>

                <div className="col-span-3 sm:col-span-4">
                  <label htmlFor="card-number" className="block text-sm/6 font-medium text-gray-700">
                    Card number
                  </label>
                  <div className="mt-2">
                    <input
                      id="card-number"
                      name="card-number"
                      type="text"
                      autoComplete="cc-number"
                      required
                      className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-3">
                  <label htmlFor="expiration-date" className="block text-sm/6 font-medium text-gray-700">
                    Expiration date (MM/YY)
                  </label>
                  <div className="mt-2">
                    <input
                      id="expiration-date"
                      name="expiration-date"
                      type="text"
                      autoComplete="cc-exp"
                      placeholder="MM/YY"
                      required
                      className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="cvc" className="block text-sm/6 font-medium text-gray-700">
                    CVC
                  </label>
                  <div className="mt-2">
                    <input
                      id="cvc"
                      name="cvc"
                      type="text"
                      autoComplete="csc"
                      required
                      className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Shipping address */}
            <section aria-labelledby="shipping-heading" className="mt-10">
              <h2 id="shipping-heading" className="text-lg font-medium text-gray-900">
                Shipping address
              </h2>

              <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <label htmlFor="company" className="block text-sm/6 font-medium text-gray-700">
                    Company
                  </label>
                  <div className="mt-2">
                    <input
                      id="company"
                      name="company"
                      type="text"
                      className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="address" className="block text-sm/6 font-medium text-gray-700">
                    Address
                  </label>
                  <div className="mt-2">
                    <input
                      id="address"
                      name="address"
                      type="text"
                      autoComplete="street-address"
                      required
                      className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="apartment" className="block text-sm/6 font-medium text-gray-700">
                    Apartment, suite, etc.
                  </label>
                  <div className="mt-2">
                    <input
                      id="apartment"
                      name="apartment"
                      type="text"
                      className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm/6 font-medium text-gray-700">
                    City
                  </label>
                  <div className="mt-2">
                    <input
                      id="city"
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      required
                      className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="region" className="block text-sm/6 font-medium text-gray-700">
                    State / Province
                  </label>
                  <div className="mt-2">
                    <input
                      id="region"
                      name="region"
                      type="text"
                      autoComplete="address-level1"
                      required
                      className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="postal-code" className="block text-sm/6 font-medium text-gray-700">
                    Postal code
                  </label>
                  <div className="mt-2">
                    <input
                      id="postal-code"
                      name="postal-code"
                      type="text"
                      autoComplete="postal-code"
                      required
                      className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Billing information */}
            <section aria-labelledby="billing-heading" className="mt-10">
              <h2 id="billing-heading" className="text-lg font-medium text-gray-900">
                Billing information
              </h2>

              <div className="mt-6 flex gap-3">
                <div className="flex h-5 shrink-0 items-center">
                  <div className="group grid size-4 grid-cols-1">
                    <input
                      defaultChecked
                      id="same-as-shipping"
                      name="same-as-shipping"
                      type="checkbox"
                      className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                    />
                    <svg
                      fill="none"
                      viewBox="0 0 14 14"
                      className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                    >
                      <path
                        d="M3 8L6 11L11 3.5"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-0 group-has-checked:opacity-100"
                      />
                      <path
                        d="M3 7H11"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-0 group-has-indeterminate:opacity-100"
                      />
                    </svg>
                  </div>
                </div>
                <label htmlFor="same-as-shipping" className="text-sm font-medium text-gray-900">
                  Same as shipping information
                </label>
              </div>
            </section>

            {/* Submit */}
            <div className="mt-10 border-t border-gray-200 pt-6 sm:flex sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-hidden sm:order-last sm:ml-6 sm:w-auto disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Continue'}
              </button>
              <p className="mt-4 text-center text-sm text-gray-500 sm:mt-0 sm:text-left">
                You won't be charged until the next step.
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
