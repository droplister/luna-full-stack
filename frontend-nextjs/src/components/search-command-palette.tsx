/**
 * Search Command Palette Component
 * Product search modal with command palette UI
 */

'use client'

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogPanel,
  DialogBackdrop,
} from '@headlessui/react'
import { ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@/lib/types/products'
import { Z_INDEX } from '@/lib/config/z-index'

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

interface SearchCommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function SearchCommandPalette({ open, onClose }: SearchCommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [recentSearches, setRecentSearches] = useState<Product[]>([])
  const router = useRouter()

  // Fetch products when query changes
  useEffect(() => {
    if (query.trim()) {
      fetch(`/api/products?search=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => setProducts(data.products || []))
        .catch(err => console.error('Search failed:', err))
    } else {
      setProducts([])
    }
  }, [query])

  // Load recent searches from localStorage
  useEffect(() => {
    if (open) {
      const recent = localStorage.getItem('recentSearches')
      if (recent) {
        try {
          setRecentSearches(JSON.parse(recent))
        } catch (e) {
          console.error('Failed to load recent searches:', e)
        }
      }
    }
  }, [open])

  const handleSelect = (product: Product) => {
    if (product) {
      // Save to recent searches
      const recent = [product, ...recentSearches.filter(p => p.id !== product.id)].slice(0, 5)
      localStorage.setItem('recentSearches', JSON.stringify(recent))
      setRecentSearches(recent)

      // Navigate to product
      router.push(`/products/${product.id}`)
      onClose()
    }
  }

  const handleClose = () => {
    setQuery('')
    onClose()
  }

  return (
    <Dialog
      className="relative"
      style={{ zIndex: Z_INDEX.SEARCH_MODAL }}
      open={open}
      onClose={handleClose}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/25 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 w-screen overflow-y-auto p-4 sm:p-6 md:p-20" style={{ zIndex: Z_INDEX.SEARCH_MODAL_INNER }}>
        <DialogPanel
          transition
          className="mx-auto max-w-3xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl outline-1 outline-black/5 transition-all data-closed:scale-95 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        >
          <Combobox
            onChange={handleSelect}
          >
            {({ activeOption }) => (
              <>
                <div className="grid grid-cols-1">
                  <ComboboxInput
                    autoFocus
                    className="col-start-1 row-start-1 h-12 w-full pr-4 pl-11 text-base text-gray-900 outline-hidden placeholder:text-gray-400 sm:text-sm"
                    placeholder="Search products..."
                    onChange={(event) => setQuery(event.target.value)}
                    onBlur={() => setQuery('')}
                  />
                  <MagnifyingGlassIcon
                    className="pointer-events-none col-start-1 row-start-1 ml-4 size-5 self-center text-gray-400"
                    aria-hidden="true"
                  />
                </div>

                {(query === '' || products.length > 0) && (
                  <ComboboxOptions
                    as="div"
                    static
                    hold
                    className="flex transform-gpu divide-x divide-gray-100"
                  >
                    <div
                      className={classNames(
                        'max-h-96 min-w-0 flex-auto scroll-py-4 overflow-y-auto px-6 py-4',
                        activeOption && 'sm:h-96',
                      )}
                    >
                      {query === '' && recentSearches.length > 0 && (
                        <h2 className="mt-2 mb-4 text-xs font-semibold text-gray-500">
                          Recent searches
                        </h2>
                      )}
                      <div className="-mx-2 text-sm text-gray-700">
                        {(query === '' ? recentSearches : products).map((product) => (
                          <ComboboxOption
                            as="div"
                            key={product.id}
                            value={product}
                            className="group flex cursor-default items-center rounded-md p-2 select-none data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                          >
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className="size-10 flex-none rounded bg-gray-100 object-cover outline -outline-offset-1 outline-black/5"
                            />
                            <div className="ml-3 flex-auto">
                              <div className="truncate font-medium">{product.title}</div>
                              <div className="truncate text-xs text-gray-500">{product.category}</div>
                            </div>
                            <div className="ml-3 flex-none text-sm font-semibold text-gray-900">
                              ${product.price}
                            </div>
                            <ChevronRightIcon
                              className="ml-3 hidden size-5 flex-none text-gray-400 group-data-focus:block"
                              aria-hidden="true"
                            />
                          </ComboboxOption>
                        ))}
                      </div>
                    </div>

                    {activeOption && (
                      <div className="hidden h-96 w-1/2 flex-none flex-col divide-y divide-gray-100 overflow-y-auto sm:flex">
                        <div className="flex-none p-6 text-center">
                          <img
                            src={activeOption.thumbnail}
                            alt={activeOption.title}
                            className="mx-auto size-32 rounded-lg bg-gray-100 object-cover outline -outline-offset-1 outline-black/5"
                          />
                          <h2 className="mt-3 font-semibold text-gray-900">{activeOption.title}</h2>
                          <p className="text-sm/6 text-gray-500">{activeOption.category}</p>
                        </div>
                        <div className="flex flex-auto flex-col justify-between p-6">
                          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm text-gray-700">
                            <dt className="col-end-1 font-semibold text-gray-900">Price</dt>
                            <dd className="text-lg font-bold text-gray-900">${activeOption.price}</dd>
                            {activeOption.rating && (
                              <>
                                <dt className="col-end-1 font-semibold text-gray-900">Rating</dt>
                                <dd>{activeOption.rating} / 5</dd>
                              </>
                            )}
                            {activeOption.brand && (
                              <>
                                <dt className="col-end-1 font-semibold text-gray-900">Brand</dt>
                                <dd>{activeOption.brand}</dd>
                              </>
                            )}
                            <dt className="col-end-1 font-semibold text-gray-900">Description</dt>
                            <dd className="text-xs line-clamp-3">{activeOption.description}</dd>
                          </dl>
                          <button
                            type="button"
                            onClick={() => handleSelect(activeOption)}
                            className="mt-6 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          >
                            View Product
                          </button>
                        </div>
                      </div>
                    )}
                  </ComboboxOptions>
                )}

                {query !== '' && products.length === 0 && (
                  <div className="px-6 py-14 text-center text-sm sm:px-14">
                    <ShoppingBagIcon className="mx-auto size-6 text-gray-400" aria-hidden="true" />
                    <p className="mt-4 font-semibold text-gray-900">No products found</p>
                    <p className="mt-2 text-gray-500">
                      We couldn't find anything with that term. Please try again.
                    </p>
                  </div>
                )}
              </>
            )}
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
