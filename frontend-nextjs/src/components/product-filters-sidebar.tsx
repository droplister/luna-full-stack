/**
 * Product Filters Sidebar Component
 * Shared sidebar for /products and /category pages
 * Shows categories and optional filters (tags)
 */

'use client'

import Link from 'next/link'
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid'
import { brandConfig, categoryDisplayNames } from '@/lib/config/brand'
import { toTitleCase } from '@/lib/utils/format'

interface FilterOption {
  value: string
  label: string
  checked: boolean
  count?: number // Optional count of products with this option
}

interface Filter {
  id: string
  name: string
  options: FilterOption[]
  onChange?: (value: string) => void
}

interface ProductFiltersSidebarProps {
  /** Categories to show - if not provided, shows all from brand config */
  categories?: Array<{ slug: string; name: string; href: string }>
  /** Current category slug (for highlighting active category) */
  currentCategory?: string
  /** Additional filters (e.g., tags) */
  filters?: Filter[]
  /** Show "All Products" link */
  showAllProducts?: boolean
}

export function ProductFiltersSidebar({
  categories,
  currentCategory,
  filters = [],
  showAllProducts = true,
}: ProductFiltersSidebarProps) {
  // If no categories provided, extract all from brand config
  const displayCategories = categories || extractAllCategories()

  return (
    <form className="hidden lg:block">
      {/* Categories */}
      <h3 className="sr-only">Categories</h3>
      <ul role="list" className="space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900">
        <li>
          <Link
            href="/products"
            className={`block font-semibold ${!currentCategory ? 'text-indigo-600' : 'hover:text-gray-800'}`}
          >
            Shop All
          </Link>
        </li>
        {displayCategories.map((category) => (
          <li key={category.slug}>
            <Link
              href={category.href}
              className={`block cursor-pointer ${
                currentCategory === category.slug
                  ? 'text-indigo-600 font-semibold'
                  : 'hover:text-gray-800'
              }`}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>

      {/* Additional Filters */}
      {filters.map((section) => (
        <Disclosure key={section.id} as="div" className="border-b border-gray-200 py-6" defaultOpen={true}>
          {({ open }) => (
            <>
              <h3 className="-my-3 flow-root">
                <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900">{section.name}</span>
                  <span className="ml-6 flex items-center">
                    <PlusIcon aria-hidden="true" className="size-5 group-data-open:hidden" />
                    <MinusIcon aria-hidden="true" className="size-5 group-not-data-open:hidden" />
                  </span>
                </DisclosureButton>
              </h3>
              <DisclosurePanel className="pt-6">
                <div className="space-y-4">
                  {section.options.map((option, optionIdx) => (
                    <div key={option.value} className="flex items-center justify-between gap-3">
                      <div className="flex gap-3 flex-1">
                        <div className="flex h-5 shrink-0 items-center">
                          <input
                            id={`filter-${section.id}-${optionIdx}`}
                            name={`${section.id}[]`}
                            type="checkbox"
                            checked={option.checked}
                            onChange={() => section.onChange?.(option.value)}
                            className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                          />
                        </div>
                        <label
                          htmlFor={`filter-${section.id}-${optionIdx}`}
                          className="text-sm text-gray-600 cursor-pointer"
                        >
                          {option.label}
                        </label>
                      </div>
                      {option.count !== undefined && (
                        <span className="text-sm text-gray-400">{option.count}</span>
                      )}
                    </div>
                  ))}
                </div>
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      ))}
    </form>
  )
}

/**
 * Extract all categories from brand config navigation
 */
function extractAllCategories(): Array<{ slug: string; name: string; href: string }> {
  const categories: Array<{ slug: string; name: string; href: string }> = []
  const seen = new Set<string>()

  brandConfig.navigation.megaMenus.forEach((menu) => {
    menu.sections.forEach((section) => {
      section.items.forEach((item) => {
        // Extract slug from href like "/category/tops" -> "tops"
        const slug = item.href.split('/').pop() || ''

        // Avoid duplicates
        if (!seen.has(slug) && slug) {
          seen.add(slug)
          categories.push({
            slug,
            name: categoryDisplayNames[slug] || item.name,
            href: item.href,
          })
        }
      })
    })
  })

  return categories.sort((a, b) => a.name.localeCompare(b.name))
}
