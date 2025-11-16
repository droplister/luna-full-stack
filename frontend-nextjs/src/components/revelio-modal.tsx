/**
 * Revelio Modal Component
 * Luna Lovegood themed scratch-off discount modal
 */

'use client'

import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ScratchCard } from './scratch-card'
import { usePromoStore } from '@/lib/store/promo'
import { promoConfig } from '@/lib/config/promo'
import { Z_INDEX } from '@/lib/config/z-index'

export function RevelioModal() {
  const { isRevelioOpen, closeRevelio, markAsRevealed, setPromoCode } = usePromoStore()
  const [isRevealed, setIsRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleReveal = () => {
    setIsRevealed(true)
    markAsRevealed()
    setPromoCode(promoConfig.discount.code)
  }

  const handleCopyCode = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(promoConfig.discount.code)
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea')
        textarea.value = promoConfig.discount.code
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleClose = () => {
    closeRevelio()
    // Reset reveal state when closing
    setTimeout(() => {
      setIsRevealed(false)
      setCopied(false)
    }, 300)
  }

  return (
    <Dialog open={isRevelioOpen} onClose={handleClose} className="relative" style={{ zIndex: Z_INDEX.REVELIO_MODAL }}>
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            {/* Close button - top right */}
            <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 cursor-pointer"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            <div>
              <div className="text-center">
                <DialogTitle as="h3" className="text-2xl font-semibold text-gray-900 mb-2">
                  Cast Revelio on Your Savings
                </DialogTitle>
                <p className="text-sm text-gray-500 mb-6">
                  Click and hold to scratch and reveal a special offer.
                </p>
              </div>

              <ScratchCard
                height={promoConfig.scratchCard.height}
                brushRadius={promoConfig.scratchCard.brushRadius}
                revealThreshold={promoConfig.scratchCard.revealThreshold}
                onComplete={handleReveal}
              >
                <p className="text-sm uppercase tracking-wide text-indigo-400">
                  {promoConfig.messages.postReveal}
                </p>
                <p className="text-3xl font-bold text-indigo-50 mt-2">
                  {promoConfig.discount.description}
                </p>
                <button
                  onClick={handleCopyCode}
                  className="mt-4 bg-indigo-950/60 px-4 py-3 rounded-lg hover:bg-indigo-950/80 transition-colors cursor-pointer"
                >
                  <p className="font-mono text-2xl text-indigo-100 tracking-wider">
                    {promoConfig.discount.code}
                  </p>
                </button>
                <div className="mt-2 flex items-center justify-center gap-2 text-xs text-indigo-200/80">
                  {copied && (
                    <CheckIcon className="h-4 w-4 text-green-400" aria-hidden="true" />
                  )}
                  <span>{promoConfig.messages.helperText}</span>
                </div>
              </ScratchCard>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
