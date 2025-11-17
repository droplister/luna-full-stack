/**
 * Header Component
 * Love Lovegood's main navigation with mega menu
 * Based on mega-menu.tsx design with brand customization
 */

'use client'

import { Fragment, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@headlessui/react'
import { Bars3Icon, ShoppingBagIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/hooks/useCart'
import { brand, navigation, promoBar as promoBarMessage } from '@/lib/cms'
import { RevelioModal } from '@/components/modals/revelio-modal'
import { PromoBar } from '@/components/ui/promo-bar'
import { usePromoStore } from '@/lib/store/promo'
import { features, Z_INDEX } from '@/lib/config'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { itemCount, toggleCart } = useCart()
  const { openRevelio } = usePromoStore()
  const pathname = usePathname()

  // Don't open cart drawer if we're already on the cart page
  const handleCartClick = () => {
    if (pathname !== '/cart') {
      toggleCart()
    }
  }

  const { name } = brand

  return (
    <div className="bg-white">
      {/* Revelio Modal */}
      {features.revelio.enabled && <RevelioModal />}

      {/* Mobile menu */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="relative lg:hidden" style={{ zIndex: Z_INDEX.MOBILE_MENU }}>
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />
        <div className="fixed inset-0 flex" style={{ zIndex: Z_INDEX.MOBILE_MENU }}>
          <DialogPanel
            transition
            className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <div className="flex justify-end px-4 pt-5 pb-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-6 px-4 py-6">
              {/* Shop All - First */}
              <div className="flow-root">
                <Link
                  href={navigation.shopAll.href}
                  className="-m-2 block p-2 font-semibold text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {navigation.shopAll.name}
                </Link>
              </div>

              {/* The Goods sections - without the heading */}
              {navigation.megaMenus[0]?.sections.map((section) => (
                <div key={section.name}>
                  <ul
                    role="list"
                    className="flex flex-col space-y-6"
                  >
                    {section.items.map((item) => (
                      <li key={item.name} className="flow-root">
                        <Link
                          href={item.href}
                          className="-m-2 block p-2 text-gray-500"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Featured Products - Last */}
              {navigation.megaMenus[0]?.featured && (
                <div className="mt-12">
                  <p className="font-semibold text-gray-900">Featured Products</p>
                  <div className="mt-6 grid grid-cols-2 gap-x-4">
                    {navigation.megaMenus[0].featured.map((item) => (
                      <div key={item.name} className="group relative text-sm">
                        <img
                          alt={item.imageAlt}
                          src={item.imageSrc}
                          className="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75"
                        />
                        <Link
                          href={item.href}
                          className="mt-6 block font-medium text-gray-900"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span aria-hidden="true" className="absolute inset-0" style={{ zIndex: Z_INDEX.MEGA_MENU_FEATURED_LINK }} />
                          {item.name}
                        </Link>
                        <p aria-hidden="true" className="mt-1">
                          Shop now
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <header className="relative bg-white">
        {features.promoBar.enabled && <PromoBar message={promoBarMessage.message} />}

        <nav aria-label="Top" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <div className="flex h-20 items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="relative rounded-md bg-white p-2 text-gray-400 lg:hidden"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open menu</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>

              {/* Logo */}
              <div className="ml-4 flex lg:ml-0">
                <Link href="/">
                  <span className="sr-only">{name}</span>
                  <span className="font-brand font-semibold text-xl lg:text-3xl text-gray-900">
                    {name}
                  </span>
                </Link>
              </div>

              {/* Desktop Flyout menus */}
              <PopoverGroup className="hidden lg:ml-8 lg:block lg:self-stretch">
                <div className="flex h-full space-x-8">
                  {/* Mega Menu Categories */}
                  {navigation.megaMenus.map((category) => (
                    <Popover key={category.name} className="flex">
                      {({ close }) => (
                        <>
                          <div className="relative flex">
                            <PopoverButton className="group relative flex items-center justify-center text-sm font-semibold text-gray-700 transition-colors duration-200 ease-out hover:text-gray-800 data-open:text-indigo-600 cursor-pointer">
                              {category.name}
                              <span
                                aria-hidden="true"
                                className="absolute inset-x-0 -bottom-px h-0.5 transition duration-200 ease-out group-data-open:bg-indigo-600"
                                style={{ zIndex: Z_INDEX.DROPDOWN_INDICATOR }}
                              />
                            </PopoverButton>
                          </div>
                          <PopoverPanel
                            transition
                            className="absolute inset-x-0 top-full w-full bg-white text-sm text-gray-500 transition data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
                            style={{ zIndex: Z_INDEX.DROPDOWN_PANEL }}
                          >
                        {/* Shadow element */}
                        <div aria-hidden="true" className="absolute inset-0 top-1/2 bg-white shadow-sm" />
                        <div className="relative bg-white">
                          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-16">
                              <div className="col-start-2 grid grid-cols-2 gap-x-8">
                                {category.featured.map((item) => (
                                  <div key={item.name} className="group relative text-base sm:text-sm">
                                    <img
                                      alt={item.imageAlt}
                                      src={item.imageSrc}
                                      className="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75"
                                    />
                                    <Link href={item.href} className="mt-6 block font-medium text-gray-900" onClick={() => close()}>
                                      <span aria-hidden="true" className="absolute inset-0" style={{ zIndex: Z_INDEX.MEGA_MENU_FEATURED_LINK }} />
                                      {item.name}
                                    </Link>
                                    <p aria-hidden="true" className="mt-1">
                                      Shop now
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <div className="row-start-1 grid grid-cols-3 gap-x-8 gap-y-10 text-sm">
                                {category.sections.map((section) => (
                                  <div key={section.name}>
                                    <p id={`${section.name}-heading`} className="font-medium text-gray-900">
                                      {section.name}
                                    </p>
                                    <ul
                                      role="list"
                                      aria-labelledby={`${section.name}-heading`}
                                      className="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
                                    >
                                      {section.items.map((item) => (
                                        <li key={item.name} className="flex">
                                          <Link href={item.href} className="hover:text-gray-800" onClick={() => close()}>
                                            {item.name}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </PopoverPanel>
                        </>
                      )}
                    </Popover>
                  ))}

                  {/* Shop All - no dropdown */}
                  <Link
                    href={navigation.shopAll.href}
                    className="flex items-center text-sm font-semibold text-gray-700 hover:text-gray-800"
                  >
                    {navigation.shopAll.name}
                  </Link>

                  {/* Additional pages */}
                  {navigation.pages.map((page) => (
                    <Link
                      key={page.name}
                      href={page.href}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                      {page.name}
                    </Link>
                  ))}
                </div>
              </PopoverGroup>

              <div className="ml-auto flex items-center">
                {/* Revelio */}
                {features.revelio.enabled && (
                  <div className="flex lg:ml-6">
                    <button
                      onClick={openRevelio}
                      className="p-2 text-2xl hover:opacity-80 cursor-pointer"
                      title="Reveal a secret offer"
                      aria-label="Reveal a secret offer"
                    >
                      🪄
                    </button>
                  </div>
                )}

                {/* Cart */}
                <div className="ml-4 flow-root lg:ml-6">
                  <button onClick={handleCartClick} className="group -m-2 flex items-center p-2 cursor-pointer">
                    <ShoppingBagIcon
                      aria-hidden="true"
                      className="size-6 shrink-0 text-gray-400 group-hover:text-gray-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">
                      {itemCount}
                    </span>
                    <span className="sr-only">items in cart, view bag</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  )
}
