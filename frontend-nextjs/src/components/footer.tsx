/**
 * Footer Component
 * Site-wide footer with links and information
 */

import { brandConfig } from '@/lib/config/brand'

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-4 xl:col-span-1">
            <p className="text-2xl font-semibold text-gray-900 font-brand">{brandConfig.name}</p>
            <p className="text-sm text-gray-500">
              {brandConfig.footerSlogan}
            </p>
            <div className="flex space-x-6">
              {/* Social media links - placeholder for future implementation */}
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Shop</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <a href="/products" className="text-sm text-gray-500 hover:text-gray-900">
                      All Products
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                      Clothing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                      Accessories
                    </a>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-900">Support</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                      Shopping Cart
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                      Returns
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Company</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                      Careers
                    </a>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                      Terms
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} {brandConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
