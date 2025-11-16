/**
 * useDelayedLoading Hook
 * Delays showing loading state to prevent flicker for fast operations
 * Only shows loading if operation takes longer than the delay threshold
 *
 * @param isLoading - The actual loading state from data fetching
 * @param delay - Delay in ms before showing loading state (default: 200ms)
 * @returns shouldShowLoading - Whether to show the loading state
 */

import { useState, useEffect } from 'react'

export function useDelayedLoading(isLoading: boolean, delay: number = 200): boolean {
  const [shouldShowLoading, setShouldShowLoading] = useState(false)

  useEffect(() => {
    if (isLoading) {
      // Set a timer to show loading state after delay
      const timer = setTimeout(() => {
        setShouldShowLoading(true)
      }, delay)

      // Cleanup: clear timer if loading finishes before delay
      return () => clearTimeout(timer)
    } else {
      // Immediately hide loading when done
      setShouldShowLoading(false)
    }
  }, [isLoading, delay])

  return shouldShowLoading
}
