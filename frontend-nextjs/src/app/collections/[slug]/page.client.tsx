/**
 * Category Page Client Component
 * Client-side filtering and interaction logic
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import { XMarkIcon, ChevronDownIcon, FunnelIcon } from '@heroicons/react/20/solid'
import { ProductCard } from '@/components/cards/product-card'
import { CategoryList } from '@/components/ui/category-list'
import { FilterGroup } from '@/components/ui/filter-group'
import { SortOptions, type SortOption } from '@/components/ui/sort-options'
import { ActiveFilters } from '@/components/ui/active-filters'
import { CollectionHeader } from '@/components/headers/collection-header'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { useCart } from '@/lib/hooks/useCart'
import { useBreadcrumbs } from '@/lib/hooks/useBreadcrumbs'
import { useDelayedLoading } from '@/lib/hooks/useDelayedLoading'
import { categoryDisplayNames, categoryDescriptions, navigation } from '@/lib/cms'
import { toTitleCase, kebabToTitleCase } from '@/lib/utils/format'
import type { Product } from '@/lib/types/products'
import { Z_INDEX } from '@/lib/config'
import { fetchProductsByCategory } from '@/lib/services/products'

interface CategoryPageClientProps {
  params: {
    slug: string
  }
}

export function CategoryPageClient({ params }: CategoryPageClientProps) {
  const { slug } = params
  const { addItem } = useCart()

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Tag-based filtering
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [tagCounts, setTagCounts] = useState<Map<string, number>>(new Map())
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortOption>('default')

  // Delay showing loading state to prevent flicker for fast loads
  const shouldShowLoading = useDelayedLoading(isLoading)

  // Fetch products for this category
  useEffect(() => {
    const loadCategoryProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const result = await fetchProductsByCategory(slug, 100, 0)
        setProducts(result.products)

        // Extract unique tags from products with counts
        const counts = new Map<string, number>()
        result.products.forEach((p) => {
          if (p.tags && Array.isArray(p.tags)) {
            p.tags.forEach((tag: string) => {
              counts.set(tag, (counts.get(tag) || 0) + 1)
            })
          }
        })
        setTagCounts(counts)
        setAvailableTags(Array.from(counts.keys()).sort())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products')
      } finally {
        setIsLoading(false)
      }
    }

    loadCategoryProducts()
  }, [slug])

  // Filter products by selected tags and apply sorting
  const filteredProducts = useMemo(() => {
    // Step 1: Filter by tags
    const filtered =
      selectedTags.size === 0
        ? products
        : products.filter((product) => {
            // Product must have tags and at least one selected tag
            return product.tags && Array.from(selectedTags).some((tag) => product.tags!.includes(tag))
          })

    // Step 2: Sort if needed
    if (sortBy === 'default') {
      return filtered
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'rating-high':
          return b.rating - a.rating
        case 'discount-high':
          return (b.discountPercentage || 0) - (a.discountPercentage || 0)
        default:
          return 0
      }
    })
  }, [products, selectedTags, sortBy])

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(tag)) {
        newSet.delete(tag)
      } else {
        newSet.add(tag)
      }
      return newSet
    })
  }

  // Get categories from the same section as current category
  const getSectionCategories = () => {
    const categories: Array<{ slug: string; name: string; href: string }> = []

    for (const menu of navigation.megaMenus) {
      for (const section of menu.sections) {
        // Check if this section contains the current category
        const hasCurrentCategory = section.items.some((item) => item.href.split('/').pop() === slug)

        if (hasCurrentCategory) {
          // Return all categories from this section
          section.items.forEach((item) => {
            const itemSlug = item.href.split('/').pop() || ''
            categories.push({
              slug: itemSlug,
              name: categoryDisplayNames[itemSlug] || item.name,
              href: item.href,
            })
          })
          break
        }
      }
      if (categories.length > 0) break
    }

    return categories
  }

  const sectionCategories = getSectionCategories()

  // Prepare tag filters for sidebar with counts
  const tagFilters =
    availableTags.length > 0
      ? [
          {
            id: 'tags',
            name: 'Tags',
            options: availableTags.map((tag) => ({
              value: tag,
              label: toTitleCase(tag),
              checked: selectedTags.has(tag),
              count: tagCounts.get(tag) || 0,
            })),
            onChange: handleTagToggle,
          },
        ]
      : []

  // Use CMS display name if available, otherwise format the slug
  const categoryName = categoryDisplayNames[slug] || kebabToTitleCase(slug)
  const categoryDescription = categoryDescriptions[slug]
  const breadcrumbs = useBreadcrumbs({ categorySlug: slug })

  if (error) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">Error loading category: {error}</p>
            <Link href="/products" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
              Browse all products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Mobile filter dialog */}
      <Dialog open={mobileFiltersOpen} onClose={setMobileFiltersOpen} className="relative lg:hidden" style={{ zIndex: Z_INDEX.MOBILE_FILTERS }}>
        <DialogBackdrop transition className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0" />

        <div className="fixed inset-0 flex" style={{ zIndex: Z_INDEX.MOBILE_FILTERS }}>
          <DialogPanel
            transition
            className="relative ml-auto flex size-full max-w-xs transform flex-col overflow-y-auto bg-white pt-4 pb-6 shadow-xl transition duration-300 ease-in-out data-closed:translate-x-full"
          >
            <div className="flex items-center justify-between px-4">
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="relative -mr-2 flex size-10 items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            {/* Mobile Filters */}
            {availableTags.length > 0 && (
              <form className="mt-4">
                <Disclosure as="div" className="border-t border-gray-200 pt-4 pb-4">
                  <fieldset>
                    <legend className="w-full px-2">
                      <DisclosureButton className="group flex w-full items-center justify-between p-2 text-gray-400 hover:text-gray-500">
                        <span className="text-sm font-medium text-gray-900">Tags</span>
                        <span className="ml-6 flex h-7 items-center">
                          <ChevronDownIcon aria-hidden="true" className="size-5 rotate-0 transform group-data-open:-rotate-180" />
                        </span>
                      </DisclosureButton>
                    </legend>
                    <DisclosurePanel className="px-4 pt-4 pb-2">
                      <div className="space-y-6">
                        {availableTags.map((tag) => (
                          <div key={tag} className="flex items-center justify-between gap-3">
                            <div className="flex gap-3 flex-1">
                              <div className="flex h-5 shrink-0 items-center">
                                <input
                                  id={`mobile-tag-${tag}`}
                                  type="checkbox"
                                  checked={selectedTags.has(tag)}
                                  onChange={() => handleTagToggle(tag)}
                                  className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                />
                              </div>
                              <label htmlFor={`mobile-tag-${tag}`} className="text-sm text-gray-500 cursor-pointer">
                                {toTitleCase(tag)}
                              </label>
                            </div>
                            <span className="text-sm text-gray-400">{tagCounts.get(tag)}</span>
                          </div>
                        ))}
                      </div>
                    </DisclosurePanel>
                  </fieldset>
                </Disclosure>
              </form>
            )}
          </DialogPanel>
        </div>
      </Dialog>

      {/* Collection Header */}
      <CollectionHeader title={categoryName} description={categoryDescription} />

      {/* Active Filters Bar */}
      <ActiveFilters
        selectedTags={selectedTags}
        currentSort={sortBy}
        onRemoveTag={(tag) => {
          setSelectedTags((prev) => {
            const newSet = new Set(prev)
            newSet.delete(tag)
            return newSet
          })
        }}
        onClearSort={() => setSortBy('default')}
        onClearAll={() => {
          setSelectedTags(new Set())
          setSortBy('default')
        }}
      />

      {/* Products Grid */}
      <main className="mx-auto max-w-2xl px-4 lg:max-w-7xl lg:px-8">
        <div className="pt-6 pb-24 lg:pt-12 lg:grid lg:grid-cols-4 lg:gap-x-8">
          {/* Desktop Filters Sidebar */}
          <aside>
            <form className="hidden lg:block">
              <CategoryList categories={sectionCategories} currentCategory={slug} />
              {tagFilters.map((filter) => (
                <FilterGroup key={filter.id} id={filter.id} name={filter.name} options={filter.options} onChange={filter.onChange} />
              ))}
            </form>
          </aside>

          {/* Products */}
          <section aria-labelledby="product-heading" className="mt-6 lg:col-span-3 lg:mt-0">
            <h2 id="product-heading" className="sr-only">
              Products
            </h2>

            {/* Product count and sort menu */}
            <div className="flex items-center justify-between pb-4">
              <div className="text-sm text-gray-500">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 lg:hidden"
                >
                  <FunnelIcon className="mr-2 size-5" aria-hidden="true" />
                  Filters
                </button>
                <SortOptions currentSort={sortBy} onSortChange={setSortBy} />
              </div>
            </div>

            {shouldShowLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500">No products found with selected filters.</p>
                {selectedTags.size > 0 && (
                  <button onClick={() => setSelectedTags(new Set())} className="mt-4 text-indigo-600 hover:text-indigo-500">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} onAddToCart={addItem} priority={index < 3} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
