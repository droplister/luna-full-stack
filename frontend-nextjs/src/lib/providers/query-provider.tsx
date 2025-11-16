/**
 * React Query Provider
 * Provides request deduplication, caching, and automatic refetching
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'

/**
 * Create a QueryClient with production-ready defaults
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: Data is considered fresh for 30 seconds
        // This prevents unnecessary refetches
        staleTime: 30 * 1000,

        // Cache time: Keep unused data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,

        // Retry failed requests 3 times with exponential backoff
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Don't refetch on window focus in development (noisy)
        // Enable in production for data freshness
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',

        // Refetch on mount if data is stale
        refetchOnMount: true,

        // Don't refetch on reconnect (already handled by resilient HTTP)
        refetchOnReconnect: false,
      },
      mutations: {
        // Retry mutations once (cart operations, etc.)
        retry: 1,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This ensures we only create the client once per session
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query Devtools - only shown in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  )
}
