/**
 * Contact Section Component
 * Email collection for checkout
 */

export function ContactSection() {
  return (
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
  )
}
