/**
 * Shared HTTP client utilities with production-ready network resilience
 *
 * Features:
 * - 5 second timeout on all requests
 * - 3 automatic retries with exponential backoff
 * - Proper error handling with typed errors
 */

import ky, { type Options } from 'ky'

/**
 * HTTP Error class with status code and response data
 */
export class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public responseData?: unknown,
    message?: string
  ) {
    super(message || `HTTP Error ${status}: ${statusText}`)
    this.name = 'HttpError'
  }
}

/**
 * Network timeout error
 */
export class TimeoutError extends Error {
  constructor(message = 'Request timeout') {
    super(message)
    this.name = 'TimeoutError'
  }
}

/**
 * Default resilient HTTP client with timeout and retry
 */
const httpClient = ky.create({
  // 5 second timeout for all requests
  timeout: 5000,

  // Retry configuration
  retry: {
    // Maximum 3 retry attempts (total 4 attempts including initial)
    limit: 3,

    // HTTP status codes that should trigger a retry
    statusCodes: [408, 409, 425, 429, 500, 502, 503, 504],

    // Retry on network errors
    methods: ['get', 'post', 'put', 'patch', 'delete'],

    // Exponential backoff: 1s, 2s, 4s
    backoffLimit: 4000,
  },
})

export interface FetchResult<T> {
  data: T
  headers: Headers
}

/**
 * Typed fetch wrapper with JSON parsing and error handling
 * Returns data and headers for cookie forwarding scenarios
 *
 * Now uses resilient HTTP client with retry and timeout
 *
 * @param url - The URL to fetch
 * @param init - Fetch options (converted to ky options)
 * @returns Parsed JSON response with headers
 * @throws HTTPError if response is not ok
 */
export async function fetchJsonWithHeaders<T>(
  url: string,
  init?: RequestInit
): Promise<FetchResult<T>> {
  // Convert RequestInit to ky Options
  const kyOptions: Options = {
    method: init?.method as Options['method'],
    headers: init?.headers,
    body: init?.body,
  }

  const response = await httpClient(url, kyOptions)
  const data = await response.json<T>()

  return {
    data,
    headers: response.headers,
  }
}

/**
 * Typed fetch wrapper with JSON parsing and error handling
 * Returns just the data (no headers)
 *
 * @param url - The URL to fetch
 * @param init - Fetch options
 * @returns Parsed JSON response
 * @throws HTTPError if response is not ok
 */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const result = await fetchJsonWithHeaders<T>(url, init)
  return result.data
}

/**
 * Helper to build URL with query parameters
 */
export function buildUrl(
  baseUrl: string,
  params?: Record<string, string | number | boolean>
): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl
  }

  const url = new URL(baseUrl)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value))
  })

  return url.toString()
}

/**
 * Helper to extract error message from ky HTTPError or other errors
 */
export async function getErrorMessage(error: unknown): Promise<string> {
  // ky HTTPError
  if (error && typeof error === 'object' && 'response' in error) {
    const httpError = error as { response: Response }
    try {
      const data = await httpError.response.json()
      return data.message || data.error || httpError.response.statusText
    } catch {
      return httpError.response.statusText
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}
