/**
 * Cart Drawer Component
 * Shopping cart slide-over panel
 */

'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { CartLineItem } from './cart-line-item'
import { OrderSummary } from './order-summary'
import { FreeShippingProgress } from './free-shipping-progress'
import { EmptyCart } from './empty-cart'
import { useCart } from '@/hooks/useCart'
import { Z_INDEX } from '@/lib/config/z-index'
import { calculateShipping } from '@/lib/config/cart'

export function CartDrawer() {
  const {
    items,
    subtotal,
    currency,
    itemCount,
    isCartOpen,
    isItemLoading,
    error,
    closeCart,
    incrementItem,
    decrementItem,
    removeItem,
  } = useCart()

  // Shipping calculation
  const shipping = calculateShipping(subtotal)

  return (
    <>
      {/* Screen reader announcements for cart updates */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {items.length === 0 ? (
          'Shopping cart is empty'
        ) : items.length === 1 ? (
          `Shopping cart has 1 item`
        ) : (
          `Shopping cart has ${itemCount} items`
        )}
      </div>

      <Dialog open={isCartOpen} onClose={closeCart} className="relative" style={{ zIndex: Z_INDEX.CART_DRAWER }}>
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-closed:opacity-0"
        />

        <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
            >
              <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="text-lg font-medium text-gray-900">Shopping cart</DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={closeCart}
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500 cursor-pointer"
                      >
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon aria-hidden="true" className="size-6" />
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 rounded-md bg-red-50 p-4">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Free Shipping Progress Bar */}
                  {items.length > 0 && (
                    <FreeShippingProgress subtotal={subtotal} currency={currency} />
                  )}

                  <div className="mt-8">
                    {items.length === 0 ? (
                      <EmptyCart variant="compact" onClose={closeCart} />
                    ) : (
                      <div className="flow-root">
                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                          {items.map((item) => (
                            <CartLineItem
                              key={item.line_id}
                              item={item}
                              currency={currency}
                              variant="compact"
                              isLoading={isItemLoading(item.line_id)}
                              onIncrement={incrementItem}
                              onDecrement={decrementItem}
                              onRemove={removeItem}
                              onNavigate={closeCart}
                            />
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {items.length > 0 && (
                  <OrderSummary
                    subtotal={subtotal}
                    shipping={shipping}
                    currency={currency}
                    variant="compact"
                    onCheckout={closeCart}
                  />
                )}
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
    </>
  )
}
