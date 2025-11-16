/**
 * Products Listing Page Client Component
 * Client-side filtering, sorting, and interaction logic
 */

'use client'

import { useState, useMemo } from 'react'
import { FunnelIcon } from '@heroicons/react/20/solid'
import { useProducts } from '@/lib/hooks/useProducts'
import { useCart } from '@/lib/hooks/useCart'
import { useDelayedLoading } from '@/lib/hooks/useDelayedLoading'
import { ProductCard } from '@/components/cards/product-card'
import { CategoryList } from '@/components/ui/category-list'
import { FilterGroup } from '@/components/ui/filter-group'
import { SortOptions, type SortOption } from '@/components/ui/sort-options'
import { ActiveFilters } from '@/components/ui/active-filters'
import { CollectionHeader } from '@/components/headers/collection-header'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { MobileFilterDialog } from '@/components/ui/mobile-filter-dialog'
import { useBreadcrumbs } from '@/lib/hooks/useBreadcrumbs'
import { toTitleCase } from '@/lib/utils/format'
import { extractAllCategories } from '@/lib/utils/categories'

export function ProductsPageClient() {
  const { products, total, isLoading, error, category, setCategory } = useProducts()
  const { addItem } = useCart()
  const breadcrumbs = useBreadcrumbs()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortOption>('default')

  // Delay showing loading state to prevent flicker for fast loads
  const shouldShowLoading = useDelayedLoading(isLoading)

  // Extract unique tags from all products with counts
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>()
    products.forEach((product) => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach((tag) => {
          counts.set(tag, (counts.get(tag) || 0) + 1)
        })
      }
    })
    return counts
  }, [products])

  const availableTags = useMemo(() => {
    // Filter out tags with less than 3 products and sort alphabetically
    return Array.from(tagCounts.entries())
      .filter(([_, count]) => count >= 3)
      .map(([tag]) => tag)
      .sort()
  }, [tagCounts])

  // Filter products by selected tags and apply sorting
  const filteredProducts = useMemo(() => {
    // Step 1: Filter by tags
    const filtered = selectedTags.size === 0
      ? products
      : products.filter((product) => {
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

  // Prepare tag filters for sidebar with counts
  const tagFilters = availableTags.length > 0 ? [{
    id: 'tags',
    name: 'Tags',
    options: availableTags.map(tag => ({
      value: tag,
      label: toTitleCase(tag),
      checked: selectedTags.has(tag),
      count: tagCounts.get(tag) || 0,
    })),
    onChange: handleTagToggle,
  }] : []

  if (error) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">Error loading products: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Prepare filter sections for mobile dialog
  const mobileFilterSections = useMemo(() => {
    if (availableTags.length === 0) return []

    return [
      {
        id: 'tags',
        name: 'Tags',
        options: availableTags.map((tag) => ({
          value: tag,
          label: toTitleCase(tag),
          count: tagCounts.get(tag),
        })),
        selectedValues: selectedTags,
        onToggle: handleTagToggle,
      },
    ]
  }, [availableTags, tagCounts, selectedTags])

  return (
    <div className="bg-white">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Mobile filter dialog */}
      <MobileFilterDialog
        open={mobileFiltersOpen}
        onClose={setMobileFiltersOpen}
        sections={mobileFilterSections}
      />

      {/* Collection Header */}
      <CollectionHeader
        title="Shop All"
        description="Discover our complete collection of carefully curated treasures"
      />

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
          {/* Sidebar with category and tag filters */}
          <aside>
            <form className="hidden lg:block">
              <CategoryList
                categories={extractAllCategories()}
                currentCategory={category || undefined}
              />
              {tagFilters.map((filter) => (
                <FilterGroup
                  key={filter.id}
                  id={filter.id}
                  name={filter.name}
                  options={filter.options}
                  onChange={filter.onChange}
                />
              ))}
            </form>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-3">
            {shouldShowLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500">No products found with selected filters.</p>
                {selectedTags.size > 0 && (
                  <button
                    onClick={() => setSelectedTags(new Set())}
                    className="mt-4 text-indigo-600 hover:text-indigo-500"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
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
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} onAddToCart={addItem} priority={index < 3} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
