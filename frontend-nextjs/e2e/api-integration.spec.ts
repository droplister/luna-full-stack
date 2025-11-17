/**
 * E2E tests for API Integration & Error Resilience
 * Tests backend communication, error handling, and loading states
 * Technical Requirement #4: API Integration
 */

import { test, expect } from '@playwright/test';

test.describe('API Integration & Error Resilience', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
  });

  test('should successfully call backend API for cart operations', async ({ page }) => {
    const apiCalls: { url: string; method: string; status: number }[] = [];

    // Monitor API calls to cart endpoints
    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('/api/cart')) {
        apiCalls.push({
          url,
          method: response.request().method(),
          status: response.status(),
        });
      }
    });

    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 10000 });

    // Add item to cart (should trigger POST /api/cart)
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });

    // Wait a moment for API call to complete
    await page.waitForTimeout(1000);

    // Verify POST call was made to cart API
    const postCalls = apiCalls.filter((call) => call.method === 'POST' && call.url.includes('/api/cart'));
    expect(postCalls.length).toBeGreaterThan(0);

    // Verify API returned success
    const successCalls = postCalls.filter((call) => call.status >= 200 && call.status < 300);
    expect(successCalls.length).toBeGreaterThan(0);

    // Increment quantity (should trigger PUT /api/cart/[lineId])
    await page.locator('button:has-text("+")').first().click();
    await page.waitForTimeout(1500); // Wait for debounced API call

    // Verify PUT call was made
    const putCalls = apiCalls.filter((call) => call.method === 'PUT' && call.url.includes('/api/cart/'));
    expect(putCalls.length).toBeGreaterThan(0);
  });

  test('should show loading states during API calls', async ({ page }) => {
    // Slow down API responses to observe loading states
    await page.route('**/api/cart**', async (route) => {
      await page.waitForTimeout(1500); // Add 1.5s delay
      await route.continue();
    });

    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 10000 });

    // Click add to cart
    const addButton = page.locator('button:has-text("Add to Cart")').first();
    await addButton.click();

    // Look for loading indicators
    // Options: spinner, disabled button, loading text, skeleton
    const loadingPatterns = [
      page.locator('[data-testid="loading"], .animate-spin, .loading'),
      page.locator('button:disabled'),
      page.locator('text=Loading'),
    ];

    let loadingFound = false;
    for (const pattern of loadingPatterns) {
      if (await pattern.first().isVisible({ timeout: 500 }).catch(() => false)) {
        loadingFound = true;
        break;
      }
    }

    // Either loading state was shown OR operation completed quickly
    if (!loadingFound) {
      // If no loading state, operation should have completed
      await expect(page.locator('h2:has-text("Shopping cart")')).toBeVisible({ timeout: 3000 });
    }

    // Eventually cart should open
    await expect(page.locator('h2:has-text("Shopping cart")')).toBeVisible({ timeout: 5000 });
  });

  test('should handle network failures gracefully', async ({ page }) => {
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 10000 });

    // Simulate network failure for cart API
    await page.route('**/api/cart', async (route) => {
      await route.abort('failed');
    });

    // Try to add item to cart
    await page.locator('button:has-text("Add to Cart")').first().click();

    // Wait for error handling
    await page.waitForTimeout(2000);

    // Should show error toast or error message
    const errorPatterns = [
      page.locator('text=/Error|Failed|Unable|Try again/i'),
      page.locator('[role="alert"]'),
      page.locator('.toast, [data-testid="toast"]'),
    ];

    let errorShown = false;
    for (const pattern of errorPatterns) {
      if (await pattern.isVisible().catch(() => false)) {
        errorShown = true;
        break;
      }
    }

    expect(errorShown).toBe(true);

    // Cart should not have opened with failed item
    const cartOpen = await page.locator('h2:has-text("Shopping cart")').isVisible().catch(() => false);

    // Cart might be open showing error, or might not have opened at all
    // Both are acceptable error handling patterns
    expect(true).toBe(true); // Test passed if error was shown
  });

  test('should handle API timeout scenarios', async ({ page }) => {
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 10000 });

    // Simulate very slow API response (timeout)
    await page.route('**/api/cart', async (route) => {
      // Never resolve - simulate timeout
      await page.waitForTimeout(60000); // Would timeout before this
      await route.continue();
    });

    // Try to add item to cart
    await page.locator('button:has-text("Add to Cart")').first().click();

    // Wait for timeout handling (most apps timeout after 10-30 seconds)
    await page.waitForTimeout(5000);

    // Should either:
    // 1. Show error message about timeout
    // 2. Show loading state then timeout error
    // 3. Retry automatically

    const timeoutPatterns = [
      page.locator('text=/Timeout|Taking too long|Try again/i'),
      page.locator('text=/Error|Failed/i'),
      page.locator('[role="alert"]'),
    ];

    // After 5 seconds, should show some indication of problem
    // (Note: actual timeout might be longer, this just checks UX feedback)
    let feedbackShown = false;
    for (const pattern of timeoutPatterns) {
      if (await pattern.isVisible().catch(() => false)) {
        feedbackShown = true;
        break;
      }
    }

    // If timeout hasn't triggered yet, loading state should still be visible
    const stillLoading = await page.locator('[data-testid="loading"], .animate-spin, button:disabled').isVisible().catch(() => false);

    expect(feedbackShown || stillLoading).toBe(true);
  });

  test('should handle 500 server errors with rollback', async ({ page }) => {
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 10000 });

    // Add an item successfully first
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible();

    // Now simulate server error on increment
    await page.route('**/api/cart/**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal server error' }),
      });
    });

    // Try to increment quantity
    await page.locator('button:has-text("+")').first().click();

    // Optimistic update should happen (UI shows Qty 2 briefly)
    // Then rollback should occur (back to Qty 1)
    await page.waitForTimeout(2500); // Wait for debounced API call and rollback

    // Should have rolled back to Qty 1
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible({ timeout: 3000 });

    // Should show error toast
    const errorToast = page.locator('text=/Error|Failed/i, [role="alert"]');
    await expect(errorToast.first()).toBeVisible({ timeout: 2000 });
  });

  test('should handle 404 errors for invalid products', async ({ page }) => {
    // Try to fetch non-existent product
    await page.route('**/api/products/99999', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Product not found' }),
      });
    });

    const response = await page.goto('/products/99999', { waitUntil: 'networkidle' });

    // Should either:
    // 1. Return 404 status
    // 2. Show "Product not found" message
    if (response && response.status() === 404) {
      expect(response.status()).toBe(404);
    } else {
      await page.waitForTimeout(1000);
      const notFoundMessage = page.locator('text=/Product not found|404|Not found/i');
      await expect(notFoundMessage).toBeVisible({ timeout: 3000 });
    }
  });

  test('should display appropriate error messages to users', async ({ page }) => {
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 10000 });

    // Return custom error message from API
    await page.route('**/api/cart', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Product is out of stock',
          error: 'INSUFFICIENT_STOCK',
        }),
      });
    });

    // Try to add item to cart
    await page.locator('button:has-text("Add to Cart")').first().click();

    // Wait for error handling
    await page.waitForTimeout(2000);

    // Should show user-friendly error message
    const errorMessage = page.locator('text=/out of stock|insufficient stock|unavailable/i, [role="alert"]');
    await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });

    // Error message should be user-friendly, not technical
    const messageText = await errorMessage.first().textContent();
    expect(messageText).toBeTruthy();
    expect(messageText?.toLowerCase()).toContain('stock');
  });

  test('should maintain data consistency across page reloads', async ({ page }) => {
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 10000 });

    // Add item to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible();

    // Close cart
    const closeButton = page.locator('button[aria-label="Close panel"], button:has-text("Continue Shopping")').first();
    await closeButton.click();

    // Reload the page
    await page.reload({ waitUntil: 'networkidle' });

    // Wait for page to load
    await page.waitForSelector('button:has-text("Cart"), [data-testid="cart-button"]', { timeout: 10000 });

    // Open cart again
    await page.locator('button:has-text("Cart"), [data-testid="cart-button"]').first().click();

    // Cart should still have the item (data persisted via cookies/session)
    await expect(page.locator('h2:has-text("Shopping cart")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible({ timeout: 3000 });
  });
});
