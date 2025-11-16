/**
 * Active Filters Bar Component
 * Displays applied filters as dismissible badges
 */

'use client'

import { XMarkIcon } from '@heroicons/react/20/solid'
import type { SortOption } from './product-sort-menu'
import { toTitleCase } from '@/lib/utils/format'

interface ActiveFiltersBarProps {
  selectedTags: Set<string>
  currentSort: SortOption
  onRemoveTag: (tag: string) => void
  onClearSort: () => void
  onClearAll: () => void
}

const sortLabels: Record<SortOption, string> = {
  'default': 'Featured',
  'price-low': 'Price: Low to High',
  'price-high': 'Price: High to Low',
  'rating-high': 'Best Rating',
  'discount-high': 'Best Discount',
}

export function ActiveFiltersBar({
  selectedTags,
  currentSort,
  onRemoveTag,
  onClearSort,
  onClearAll,
}: ActiveFiltersBarProps) {
  // Only show when there are tag filters (not just sort)
  const hasTagFilters = selectedTags.size > 0

  if (!hasTagFilters) {
    return null
  }

  return (
    <div className="bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:flex sm:items-center sm:px-6 lg:px-8">
        <h3 className="text-sm font-medium text-gray-500">
          Filters
          <span className="sr-only">, active</span>
        </h3>

        <div aria-hidden="true" className="hidden h-5 w-px bg-gray-300 sm:ml-4 sm:block" />

        <div className="mt-2 sm:mt-0 sm:ml-4 sm:flex-1">
          <div className="-m-1 flex flex-wrap items-center">
            {/* Tag filter badges */}
            {Array.from(selectedTags).map((tag) => (
              <span
                key={tag}
                className="m-1 inline-flex items-center rounded-full border border-gray-200 bg-white py-1.5 pr-2 pl-3 text-sm font-medium text-gray-900"
              >
                <span>{toTitleCase(tag)}</span>
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="ml-1 inline-flex size-4 shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                >
                  <span className="sr-only">Remove filter for {tag}</span>
                  <XMarkIcon className="size-2" />
                </button>
              </span>
            ))}

            {/* Clear all button */}
            {selectedTags.size > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="m-1 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
