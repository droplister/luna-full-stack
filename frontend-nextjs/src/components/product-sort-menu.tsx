/**
 * Product Sort Menu Component
 * Dropdown menu for sorting products
 */

'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

export type SortOption = 'default' | 'price-low' | 'price-high' | 'rating-high' | 'discount-high'

interface SortConfig {
  value: SortOption
  label: string
}

const sortOptions: SortConfig[] = [
  { value: 'default', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating-high', label: 'Best Rating' },
  { value: 'discount-high', label: 'Best Discount' },
]

interface ProductSortMenuProps {
  currentSort: SortOption
  onSortChange: (sort: SortOption) => void
}

export function ProductSortMenu({ currentSort, onSortChange }: ProductSortMenuProps) {
  const currentLabel = sortOptions.find(opt => opt.value === currentSort)?.label || 'Sort'

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
        {currentLabel}
        <ChevronDownIcon
          aria-hidden="true"
          className="-mr-1 ml-1 size-5 shrink-0 text-gray-400 group-hover:text-gray-500"
        />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="py-1">
          {sortOptions.map((option) => (
            <MenuItem key={option.value}>
              <button
                onClick={() => onSortChange(option.value)}
                className={`${
                  option.value === currentSort
                    ? 'font-medium text-gray-900'
                    : 'text-gray-500'
                } block w-full px-4 py-2 text-left text-sm data-focus:bg-gray-100 data-focus:outline-hidden`}
              >
                {option.label}
              </button>
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  )
}
