/**
 * Shared HTTP client utilities
 * Provides typed fetch wrapper with error handling
 */

export class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string
  ) {
    super(message || `HTTP Error ${status}: ${statusText}`);
    this.name = 'HttpError';
  }
}

/**
 * Typed fetch wrapper with JSON parsing and error handling
 *
 * @param url - The URL to fetch
 * @param init - Fetch options
 * @returns Parsed JSON response
 * @throws HttpError if response is not ok
 */
export async function fetchJson<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, init);

    if (!response.ok) {
      const errorMessage = await response.text().catch(() => response.statusText);
      throw new HttpError(response.status, response.statusText, errorMessage);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    // Network errors, JSON parsing errors, etc.
    throw new Error(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Helper to build URL with query parameters
 */
export function buildUrl(baseUrl: string, params?: Record<string, string | number | boolean>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  return url.toString();
}
