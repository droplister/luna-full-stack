/**
 * Shipping Section Component
 * Shipping address form for checkout
 */

export function ShippingSection() {
  return (
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
  )
}
