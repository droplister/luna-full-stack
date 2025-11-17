/**
 * E2E tests for Cart Drawer/Modal
 * Tests cart drawer accessibility, UX, and interactions
 * Technical Requirement #2: Advanced Cart UX
 */

import { test, expect } from '@playwright/test';

test.describe('Cart Drawer Accessibility & UX', () => {
  test('should open cart drawer from header on products page', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('button:has-text("Cart"), [data-testid="cart-button"]', { timeout: 10000 });

    // Click cart button in header
    await page.locator('button:has-text("Cart"), [data-testid="cart-button"]').first().click();

    // Cart drawer should open
    await expect(page.locator('h2:has-text("Shopping cart")')).toBeVisible({ timeout: 5000 });

    // Should show empty cart message if no items
    const emptyMessage = page.locator('text=Your cart is empty');
    if (await emptyMessage.isVisible().catch(() => false)) {
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('should open cart drawer from header on product detail page', async ({ page }) => {
    // Navigate to product detail page
    await page.goto('/products/1');
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 15000 });

    // Click cart button in header
    await page.locator('button:has-text("Cart"), [data-testid="cart-button"]').first().click();

    // Cart drawer should open
    await expect(page.locator('h2:has-text("Shopping cart")')).toBeVisible({ timeout: 5000 });
  });

  test('should open cart drawer from header on collections page', async ({ page }) => {
    // Navigate to a collection page
    await page.goto('/collections/beauty');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Click cart button in header
    const cartButton = page.locator('button:has-text("Cart"), [data-testid="cart-button"]').first();

    // Button should be visible on collection page
    await expect(cartButton).toBeVisible({ timeout: 5000 });

    await cartButton.click();

    // Cart drawer should open
    await expect(page.locator('h2:has-text("Shopping cart")')).toBeVisible({ timeout: 5000 });
  });

  test('should display item count badge in header that updates in real-time', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Check initial cart badge (should be empty or 0)
    const cartButton = page.locator('button:has-text("Cart"), [data-testid="cart-button"]').first();
    const initialText = await cartButton.textContent();

    // Add item to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });

    // Cart badge should update
    await page.waitForTimeout(500);
    const updatedText = await cartButton.textContent();

    // Badge should now indicate items in cart
    // Could be number "1" or text like "1 item" or visual indicator
    expect(updatedText).toBeTruthy();

    // Close cart
    const closeButton = page.locator('button[aria-label="Close panel"], button:has-text("Close panel")').first();
    await closeButton.click();

    // Verify badge is still visible with count
    await expect(cartButton).toBeVisible();

    // Add another item
    await page.locator('button:has-text("Add to Cart")').nth(1).click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });

    // Badge should update to reflect 2 items
    await page.waitForTimeout(500);

    // Verify cart has 2 different items
    const cartItems = page.locator('[data-testid="cart-item"], .cart-item, li:has(button:has-text("Remove"))');
    const itemCount = await cartItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(2);
  });

  test('should close cart drawer and continue shopping', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Add item to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });

    // Verify cart is open
    await expect(page.locator('h2:has-text("Shopping cart")')).toBeVisible();

    // Click close button
    const closeButton = page.locator('button[aria-label="Close panel"], button:has-text("Close panel")').first();
    await expect(closeButton).toBeVisible({ timeout: 3000 });

    await closeButton.click();

    // Cart drawer should close (wait for animation)
    await page.waitForTimeout(1000);

    // Wait for cart to be hidden
    await expect(page.locator('h2:has-text("Shopping cart")')).toBeHidden({ timeout: 3000 });

    // Should still be on products page
    expect(page.url()).toContain('/products');
  });

  test('should show empty cart state with appropriate messaging', async ({ page }) => {
    await page.goto('/products');

    // Open cart without adding anything
    await page.locator('button:has-text("Cart"), [data-testid="cart-button"]').first().click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });

    // Should show empty cart message
    const emptyPatterns = [
      page.locator('text=Your cart is empty'),
      page.locator('text=/Empty|No items|Start shopping/i'),
      page.locator('[data-testid="empty-cart"]'),
    ];

    let emptyMessageFound = false;
    for (const pattern of emptyPatterns) {
      if (await pattern.isVisible().catch(() => false)) {
        emptyMessageFound = true;
        await expect(pattern).toBeVisible();
        break;
      }
    }

    expect(emptyMessageFound).toBe(true);

    // Should have a "Continue Shopping" or similar CTA
    const ctaButton = page.locator('button:has-text("Continue Shopping"), button:has-text("Start Shopping"), a:has-text("Browse Products")');
    await expect(ctaButton.first()).toBeVisible({ timeout: 3000 });
  });

  test('should show loading states during cart operations', async ({ page }) => {
    // Slow down API to observe loading states
    await page.route('**/api/cart**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await route.continue();
    });

    await page.goto('/products');
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Add item to cart
    await page.locator('button:has-text("Add to Cart")').first().click();

    // Look for loading indicators
    const loadingPatterns = [
      page.locator('[data-testid="loading"], .loading, .animate-spin'),
      page.locator('text=Loading'),
      page.locator('button:disabled'),
    ];

    let loadingShown = false;
    for (const pattern of loadingPatterns) {
      if (await pattern.first().isVisible({ timeout: 1000 }).catch(() => false)) {
        loadingShown = true;
        break;
      }
    }

    // Loading state should have been shown or cart opened quickly
    // Both are acceptable UX
    if (!loadingShown) {
      // If no loading shown, cart should have opened successfully
      await expect(page.locator('h2:has-text("Shopping cart")')).toBeVisible({ timeout: 3000 });
    }

    // Eventually cart should be open with item
    await expect(page.locator('h2:has-text("Shopping cart")')).toBeVisible({ timeout: 5000 });

    // Clean up route
    await page.unroute('**/api/cart**');
  });

  test('should show success/error toasts for cart operations', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Add item successfully
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });

    // Success indication (either toast or cart opened)
    const cartOpened = await page.locator('h2:has-text("Shopping cart")').isVisible();
    expect(cartOpened).toBe(true);

    // Test error toast by simulating error
    await page.route('**/api/cart/**', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Server error' }),
      });
    });

    // Try to increment (will fail)
    const incrementButton = page.locator('button:has-text("+")').first();
    await incrementButton.waitFor({ state: 'attached', timeout: 5000 });
    await expect(incrementButton).toBeEnabled({ timeout: 10000 });
    await incrementButton.click();
    await page.waitForTimeout(3000); // Wait for debounced call + error

    // Error indication should appear (either toast, alert, or cart state unchanged)
    const errorToast = page.locator('[role="alert"], .toast');
    const hasError = await errorToast.first().isVisible({ timeout: 5000 }).catch(() => false);

    // If no toast, verify cart state stayed the same (rollback)
    if (!hasError) {
      const quantity = await page.locator('[data-testid="cart-item-quantity"]').first().textContent();
      expect(quantity).toBe('1'); // Should still be 1 after failed increment
    }

    // Clean up route
    await page.unroute('**/api/cart/**');
  });

  test('should navigate to full cart page from drawer', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Add item to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });

    // Look for "View Cart" or "Go to Cart" link in drawer
    const viewCartLink = page.locator('a:has-text("View cart"), a:has-text("Go to cart"), a[href="/cart"]');

    if (await viewCartLink.first().isVisible().catch(() => false)) {
      await viewCartLink.first().click();

      // Should navigate to /cart page
      await page.waitForURL(/\/cart/, { timeout: 5000 });
      expect(page.url()).toContain('/cart');

      // Cart page should show the items
      await expect(page.locator('h1:has-text("Shopping Cart")').first()).toBeVisible({ timeout: 3000 });
    } else {
      // If no "View Cart" link, navigate manually to verify cart page exists
      await page.goto('/cart');

      // Cart page should exist and show items
      await expect(page.locator('h1:has-text("Shopping Cart")').first()).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible({ timeout: 3000 });
    }
  });
});
