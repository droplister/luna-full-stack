/**
 * Mobile Filter Dialog Component
 * Generic reusable pattern for mobile filtering UI
 */

'use client'

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { Z_INDEX } from '@/lib/config/z-index'

export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface FilterSection {
  id: string
  name: string
  options: FilterOption[]
  selectedValues: Set<string>
  onToggle: (value: string) => void
}

interface MobileFilterDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  sections: FilterSection[]
}

/**
 * Mobile Filter Dialog
 *
 * Displays filter options in a mobile-friendly slide-out panel.
 * Supports multiple filter sections with checkboxes and counts.
 *
 * @param open - Whether the dialog is open
 * @param onClose - Callback when dialog should close
 * @param sections - Array of filter sections to display
 */
export function MobileFilterDialog({
  open,
  onClose,
  sections,
}: MobileFilterDialogProps) {
  if (sections.length === 0) {
    return null
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="relative lg:hidden"
      style={{ zIndex: Z_INDEX.MOBILE_FILTERS }}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
      />

      <div className="fixed inset-0 flex" style={{ zIndex: Z_INDEX.MOBILE_FILTERS }}>
        <DialogPanel
          transition
          className="relative ml-auto flex size-full max-w-xs transform flex-col overflow-y-auto bg-white pt-4 pb-6 shadow-xl transition duration-300 ease-in-out data-closed:translate-x-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4">
            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            <button
              type="button"
              onClick={() => onClose(false)}
              className="relative -mr-2 flex size-10 items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>

          {/* Filter Sections */}
          <form className="mt-4">
            {sections.map((section) => (
              <Disclosure
                key={section.id}
                as="div"
                className="border-t border-gray-200 pt-4 pb-4"
                defaultOpen={true}
              >
                <fieldset>
                  <legend className="w-full px-2">
                    <DisclosureButton className="group flex w-full items-center justify-between p-2 text-gray-400 hover:text-gray-500">
                      <span className="text-sm font-medium text-gray-900">
                        {section.name}
                      </span>
                      <span className="ml-6 flex h-7 items-center">
                        <ChevronDownIcon
                          aria-hidden="true"
                          className="size-5 rotate-0 transform group-data-open:-rotate-180"
                        />
                      </span>
                    </DisclosureButton>
                  </legend>
                  <DisclosurePanel className="px-4 pt-4 pb-2">
                    <div className="space-y-6">
                      {section.options.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex gap-3 flex-1">
                            <div className="flex h-5 shrink-0 items-center">
                              <input
                                id={`mobile-${section.id}-${option.value}`}
                                type="checkbox"
                                checked={section.selectedValues.has(option.value)}
                                onChange={() => section.onToggle(option.value)}
                                className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                              />
                            </div>
                            <label
                              htmlFor={`mobile-${section.id}-${option.value}`}
                              className="text-sm text-gray-500 cursor-pointer"
                            >
                              {option.label}
                            </label>
                          </div>
                          {option.count !== undefined && (
                            <span className="text-sm text-gray-400">
                              {option.count}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </DisclosurePanel>
                </fieldset>
              </Disclosure>
            ))}
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
