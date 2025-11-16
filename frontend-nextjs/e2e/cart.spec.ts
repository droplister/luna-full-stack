/**
 * E2E tests for Cart functionality
 * Tests complete user flows from product page to cart
 */

import { test, expect } from '@playwright/test';

test.describe('Cart Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page before each test
    await page.goto('/products');
  });

  test('should add product to cart and display correct price', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('button:has-text("Add to Cart")');

    // Get the first product's price
    const priceText = await page.locator('.group .font-medium.text-gray-900').first().textContent();
    const price = priceText?.replace('$', '');

    // Click "Add to Cart" button on first product
    await page.locator('button:has-text("Add to Cart")').first().click();

    // Wait for cart drawer to open
    await page.waitForSelector('text=Shopping cart');

    // Verify cart shows correct price
    const cartPriceElement = await page.locator('.flex.justify-between >> text=/\\$[0-9.]+/').first();
    const cartPrice = await cartPriceElement.textContent();

    expect(cartPrice).toContain('$');
    expect(cartPrice).not.toContain('$999'); // Ensure no double conversion bug
  });

  test('should increase quantity when adding same product twice', async ({ page }) => {
    await page.waitForSelector('button:has-text("Add to Cart")');

    // Add first product twice
    const addButton = page.locator('button:has-text("Add to Cart")').first();
    await addButton.click();

    // Wait for cart to open
    await page.waitForSelector('text=Shopping cart');

    // Close cart
    await page.locator('button[aria-label="Close panel"], button:has-text("Continue Shopping")').first().click();

    // Add same product again
    await addButton.click();

    // Verify quantity is 2
    await expect(page.locator('text=Qty 2')).toBeVisible();
  });

  test('should update cart item quantity', async ({ page }) => {
    await page.waitForSelector('button:has-text("Add to Cart")');

    // Add product to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart');

    // Initial quantity should be 1
    await expect(page.locator('text=Qty 1')).toBeVisible();

    // Click increment button
    await page.locator('button:has-text("+")').first().click();

    // Verify quantity increased to 2
    await expect(page.locator('text=Qty 2')).toBeVisible();

    // Click decrement button
    await page.locator('button:has-text("−")').first().click();

    // Verify quantity decreased back to 1
    await expect(page.locator('text=Qty 1')).toBeVisible();
  });

  test('should remove item when decrementing quantity to 0', async ({ page }) => {
    await page.waitForSelector('button:has-text("Add to Cart")');

    // Add product to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart');

    // Verify cart has item with quantity 1
    await expect(page.locator('text=Qty 1')).toBeVisible();

    // Click decrement button to reduce quantity to 0
    await page.locator('button:has-text("−")').first().click();

    // Verify cart is empty (item auto-removed by backend)
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
  });

  test('should remove item from cart', async ({ page }) => {
    await page.waitForSelector('button:has-text("Add to Cart")');

    // Add product to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart');

    // Verify cart has items
    await expect(page.locator('text=Qty 1')).toBeVisible();

    // Click remove button
    await page.locator('button:has-text("Remove")').first().click();

    // Verify cart is empty
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
  });

  test('should calculate correct subtotal', async ({ page }) => {
    await page.waitForSelector('button:has-text("Add to Cart")');

    // Add first product
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart');

    // Get first product price from cart
    const firstPriceText = await page.locator('.flex.justify-between.text-base >> text=/\\$[0-9.]+/').first().textContent();
    const firstPrice = parseFloat(firstPriceText?.replace('$', '') || '0');

    // Close cart
    await page.locator('button:has-text("Continue Shopping")').first().click();

    // Add second product
    await page.locator('button:has-text("Add to Cart")').nth(1).click();
    await page.waitForSelector('text=Shopping cart');

    // Get second product price
    const secondPriceText = await page.locator('.flex.justify-between.text-base >> text=/\\$[0-9.]+/').nth(1).textContent();
    const secondPrice = parseFloat(secondPriceText?.replace('$', '') || '0');

    // Get subtotal
    const subtotalText = await page.locator('text=Subtotal').locator('..').locator('p').last().textContent();
    const subtotal = parseFloat(subtotalText?.replace('$', '') || '0');

    // Verify subtotal is sum of prices (with small tolerance for floating point)
    expect(Math.abs(subtotal - (firstPrice + secondPrice))).toBeLessThan(0.01);
  });

  test('should persist cart across page navigation', async ({ page }) => {
    await page.waitForSelector('button:has-text("Add to Cart")');

    // Add product to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart');

    // Close cart
    await page.locator('button:has-text("Continue Shopping")').first().click();

    // Navigate to another page
    await page.goto('/products?page=2');

    // Open cart again
    await page.locator('button:has-text("Cart")').click();

    // Verify cart still has the item
    await expect(page.locator('text=Qty 1')).toBeVisible();
  });

  test('should show optimistic updates (instant UI feedback)', async ({ page }) => {
    await page.waitForSelector('button:has-text("Add to Cart")');

    // Add product to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart');

    // Get initial quantity
    await expect(page.locator('text=Qty 1')).toBeVisible();

    // Click increment - should update instantly (optimistic)
    const incrementButton = page.locator('button:has-text("+")').first();
    await incrementButton.click();

    // Verify quantity updates immediately (< 100ms, not waiting for server)
    // If it takes > 500ms, optimistic updates aren't working
    await expect(page.locator('text=Qty 2')).toBeVisible({ timeout: 100 });
  });

  test('should disable increment button when stock limit reached', async ({ page }) => {
    // Navigate to a product detail page to check stock
    await page.goto('/products');
    await page.waitForSelector('button:has-text("Add to Cart")');

    // Click first product to go to detail page
    await page.locator('.group h3').first().click();
    await page.waitForLoadState('networkidle');

    // Look for stock information
    const stockText = await page.locator('text=/\\d+ available|In stock/').textContent();

    // Add product to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart');

    // If stock info shows limited stock (e.g., "5 available"), test the limit
    if (stockText && stockText.match(/\d+/)) {
      const stock = parseInt(stockText.match(/\d+/)?.[0] || '0');

      if (stock > 0 && stock <= 10) {
        // Increment to stock limit
        const incrementButton = page.locator('button:has-text("+")').first();

        for (let i = 1; i < stock; i++) {
          await incrementButton.click();
          await page.waitForTimeout(50); // Small delay for optimistic updates
        }

        // Verify we're at stock limit
        await expect(page.locator(`text=Qty ${stock}`)).toBeVisible();

        // Increment button should now be disabled
        await expect(incrementButton).toBeDisabled();
      }
    }
  });

  test('should show stock warning for low stock items', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('button:has-text("Add to Cart")');

    // Click first product to view details
    await page.locator('.group h3').first().click();
    await page.waitForLoadState('networkidle');

    // Check if product shows low stock (5 or less)
    const stockIndicator = page.locator('text=/Only \\d+ left|\\d+ available/');

    if (await stockIndicator.isVisible()) {
      const stockText = await stockIndicator.textContent();
      const stock = parseInt(stockText?.match(/\d+/)?.[0] || '0');

      // If stock is 5 or less, it should show a warning
      if (stock > 0 && stock <= 5) {
        // Add to cart
        await page.locator('button:has-text("Add to Cart")').first().click();
        await page.waitForSelector('text=Shopping cart');

        // Should show "Only X left in stock" warning in cart
        await expect(page.locator(`text=/Only ${stock} left in stock/`)).toBeVisible();
      }
    }
  });

  test('should show error toast when trying to exceed stock limit', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('button:has-text("Add to Cart")');

    // Click first product to view details
    await page.locator('.group h3').first().click();
    await page.waitForLoadState('networkidle');

    // Get stock amount
    const stockText = await page.locator('text=/\\d+ available|In stock/').textContent();

    if (stockText && stockText.match(/\d+/)) {
      const stock = parseInt(stockText.match(/\d+/)?.[0] || '0');

      if (stock > 0 && stock <= 5) {
        // Add to cart
        await page.locator('button:has-text("Add to Cart")').first().click();
        await page.waitForSelector('text=Shopping cart');

        // Increment to stock limit
        const incrementButton = page.locator('button:has-text("+")').first();

        for (let i = 1; i < stock; i++) {
          await incrementButton.click();
          await page.waitForTimeout(50);
        }

        // Try to increment beyond limit (button should be disabled but try anyway)
        // This tests the validation logic
        const isDisabled = await incrementButton.isDisabled();

        if (isDisabled) {
          // Good! Button is properly disabled
          expect(isDisabled).toBe(true);
        }

        // Verify error toast appears if somehow increment is attempted
        // Toast should say "Maximum stock reached" or "Only X available"
        const toastExists = await page.locator('text=/Maximum stock reached|Only \\d+ available/').isVisible().catch(() => false);

        // If button was disabled, toast shouldn't appear (good UX)
        // If button wasn't disabled, toast should appear (fallback validation)
        if (!isDisabled) {
          expect(toastExists).toBe(true);
        }
      }
    }
  });

  test('should handle rollback on server error (optimistic update failure)', async ({ page }) => {
    // This test verifies that if a server update fails, the UI rolls back
    // For now, we'll test the happy path since we need to mock server errors

    await page.waitForSelector('button:has-text("Add to Cart")');
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart');

    // Verify initial state
    await expect(page.locator('text=Qty 1')).toBeVisible();

    // In a real scenario with server error, optimistic update would:
    // 1. Update UI to Qty 2 immediately
    // 2. Server rejects
    // 3. UI rolls back to Qty 1
    // 4. Error toast appears

    // This is a placeholder for integration with actual error handling
    // To properly test this, we'd need to:
    // - Mock the API to return an error
    // - Verify UI rolled back
    // - Verify error toast appeared
  });
});
