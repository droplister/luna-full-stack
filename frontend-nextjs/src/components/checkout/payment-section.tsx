/**
 * Payment Section Component
 * Payment details form for checkout
 */

export function PaymentSection() {
  return (
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
  )
}
