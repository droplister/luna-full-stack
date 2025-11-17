/**
 * Debounce Utility
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
}

/**
 * Creates a debounced function that delays execution until after wait milliseconds
 * have elapsed since the last invocation.
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay (default: 300ms)
 * @returns A debounced version of the function with cancel() and flush() methods
 *
 * @example
 * const debouncedSave = debounce((data) => saveToAPI(data), 500);
 * debouncedSave({ name: 'John' });  // Waits 500ms
 * debouncedSave({ name: 'Jane' });  // Cancels previous, waits another 500ms
 * debouncedSave.cancel();  // Cancels pending execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debounced = (...args: Parameters<T>): void => {
    lastArgs = args;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      if (lastArgs) {
        func(...lastArgs);
      }
      timeoutId = null;
      lastArgs = null;
    }, wait);
  };

  /**
   * Cancel any pending execution
   */
  debounced.cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  /**
   * Immediately execute with the last arguments (if any)
   */
  debounced.flush = (): void => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      func(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debounced;
}

/**
 * Creates a map of debounced functions keyed by a string identifier.
 * Useful for per-item debouncing (e.g., cart items).
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns Object with get() and clear() methods
 *
 * @example
 * const debouncedUpdates = createDebouncedMap(
 *   (itemId, quantity) => updateAPI(itemId, quantity),
 *   500
 * );
 * debouncedUpdates.get('item-1')(10);  // Debounced per item-1
 * debouncedUpdates.get('item-2')(20);  // Independent debounce for item-2
 */
export function createDebouncedMap<K extends string, T extends (key: K, ...args: any[]) => any>(
  func: T,
  wait: number = 300
) {
  const debouncedFunctions = new Map<K, DebouncedFunction<(...args: any[]) => any>>();

  return {
    /**
     * Get or create a debounced function for the given key
     */
    get: (key: K) => {
      if (!debouncedFunctions.has(key)) {
        const debouncedFn = debounce(
          (...args: any[]) => func(key, ...args),
          wait
        );
        debouncedFunctions.set(key, debouncedFn);
      }
      return debouncedFunctions.get(key)!;
    },

    /**
     * Cancel pending execution for a specific key
     */
    cancel: (key: K) => {
      const fn = debouncedFunctions.get(key);
      if (fn) {
        fn.cancel();
      }
    },

    /**
     * Cancel all pending executions
     */
    cancelAll: () => {
      debouncedFunctions.forEach((fn) => fn.cancel());
    },

    /**
     * Remove a debounced function for a key
     */
    delete: (key: K) => {
      const fn = debouncedFunctions.get(key);
      if (fn) {
        fn.cancel();
        debouncedFunctions.delete(key);
      }
    },

    /**
     * Clear all debounced functions
     */
    clear: () => {
      debouncedFunctions.forEach((fn) => fn.cancel());
      debouncedFunctions.clear();
    },
  };
}
