/**
 * Filter Group Component
 * Collapsible group of checkbox filters
 */

'use client'

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid'

export interface FilterOption {
  value: string
  label: string
  checked: boolean
  count?: number
}

interface FilterGroupProps {
  id: string
  name: string
  options: FilterOption[]
  onChange?: (value: string) => void
  defaultOpen?: boolean
}

export function FilterGroup({
  id,
  name,
  options,
  onChange,
  defaultOpen = true,
}: FilterGroupProps) {
  return (
    <Disclosure as="div" className="border-b border-gray-200 py-6" defaultOpen={defaultOpen}>
      {({ open }) => (
        <>
          <h3 className="-my-3 flow-root">
            <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
              <span className="font-medium text-gray-900">{name}</span>
              <span className="ml-6 flex items-center">
                <PlusIcon aria-hidden="true" className="size-5 group-data-open:hidden" />
                <MinusIcon aria-hidden="true" className="size-5 group-not-data-open:hidden" />
              </span>
            </DisclosureButton>
          </h3>
          <DisclosurePanel className="pt-6">
            <div className="space-y-4">
              {options.map((option, optionIdx) => (
                <div key={option.value} className="flex items-center justify-between gap-3">
                  <div className="flex gap-3 flex-1">
                    <div className="flex h-5 shrink-0 items-center">
                      <input
                        id={`filter-${id}-${optionIdx}`}
                        name={`${id}[]`}
                        type="checkbox"
                        checked={option.checked}
                        onChange={() => onChange?.(option.value)}
                        className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                      />
                    </div>
                    <label
                      htmlFor={`filter-${id}-${optionIdx}`}
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
  )
}
