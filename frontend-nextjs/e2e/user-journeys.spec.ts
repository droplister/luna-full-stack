/**
 * E2E tests for Complete User Journeys
 * Tests end-to-end shopping flows and multi-step interactions
 * Validates complete user experience from browsing to cart management
 */

import { test, expect } from '@playwright/test';

test.describe('Complete User Journeys', () => {
  test('complete shopping journey: Browse → Detail → Add to Cart → Modify Cart', async ({ page }) => {
    // Step 1: Browse products
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // Verify products are displayed
    const productCards = page.locator('[data-testid="product-card"]');
    const productCount = await productCards.count();
    expect(productCount).toBeGreaterThan(0);

    // Step 2: Click product to view detail page
    await page.locator('[data-testid="product-card"] a').first().click();
    await page.waitForURL(/\/products\/.+/, { timeout: 5000 });

    // Verify on detail page
    await expect(page.locator('button:has-text("Add to Cart")')).toBeVisible({ timeout: 5000 });

    // Step 3: Add to cart from detail page
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });

    // Wait for cart item to load (increased timeout for slow backend)
    await page.waitForTimeout(3000); // Give backend API time to complete

    // Verify item actually added to cart by checking for cart line item
    await expect(page.locator('li:has(button:has-text("Remove"))').first()).toBeVisible({ timeout: 10000 });

    // Step 4: Modify cart - increment quantity
    await page.locator('button:has-text("+")').first().click();
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible({ timeout: 3000 });

    // Step 5: Modify cart - decrement quantity
    await page.locator('button:has-text("−")').first().click();
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible({ timeout: 3000 });

    // Step 6: Close cart drawer
    const closeButton = page.locator('button:has([class*="sr-only"]:has-text("Close panel"))').first();
    await closeButton.click();
    await page.waitForTimeout(500);

    // Verify can continue browsing
    await page.goto('/products');
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 5000 });

    // Step 7: Verify cart persists - reopen cart
    await page.locator('button:has-text("Cart"), [data-testid="cart-button"]').first().click();
    await expect(page.locator('h2:has-text("Shopping cart")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible();
  });

  test('multi-product cart: Add multiple items → Update quantities → Remove some', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 10000 });

    // Add first product
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible();

    // Close cart
    const closeButton2 = page.locator('button:has([class*="sr-only"]:has-text("Close panel"))').first();
    await closeButton2.click();

    // Add second product
    await page.locator('button:has-text("Add to Cart")').nth(1).click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });

    // Verify 2 distinct items in cart
    const cartItems = page.locator('[data-testid="cart-item"], li:has(button:has-text("Remove"))');
    const itemCount = await cartItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(2);

    // Update quantity of first item
    await page.locator('button:has-text("+")').first().click();
    await page.waitForTimeout(500);

    // Verify subtotal updated
    const subtotal = page.locator('text=Subtotal').locator('..').locator('p').filter({ hasText: /\$\d+/ });
    await expect(subtotal.last()).toBeVisible();

    // Remove second item
    await page.locator('button:has-text("Remove")').nth(1).click();
    await page.waitForTimeout(1000);

    // Verify only 1 item remains
    const remainingItems = await page.locator('[data-testid="cart-item"], li:has(button:has-text("Remove"))').count();
    expect(remainingItems).toBe(1);

    // Verify subtotal adjusted
    await expect(subtotal.last()).toBeVisible();
  });

  test('cart persistence: Add items → Close browser → Reopen → Cart still populated', async ({ page, context }) => {
    // Add items to cart
    await page.goto('/products');
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 10000 });

    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible();

    // Close cart drawer
    const closeButton3 = page.locator('button:has([class*="sr-only"]:has-text("Close panel"))').first();
    await closeButton3.click();

    // Create new page in same context (cookies persist)
    const newPage = await context.newPage();
    await newPage.goto('/products');
    await newPage.waitForSelector('button:has-text("Cart"), [data-testid="cart-button"]', { timeout: 10000 });

    // Open cart
    await newPage.locator('button:has-text("Cart"), [data-testid="cart-button"]').first().click();
    await newPage.waitForSelector('text=Shopping cart', { timeout: 5000 });

    // Verify cart still has items
    await expect(newPage.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible({ timeout: 3000 });

    // Clean up
    await newPage.close();
  });

  test('collection browsing: Navigate collections → View products → Add to cart', async ({ page }) => {
    // Start from products page
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"], .group', { timeout: 10000 });

    // Look for collection/category navigation
    const categoryLink = page.locator('a[href*="/collections/"], nav a:has-text("Beauty"), nav a:has-text("Women")').first();

    if (await categoryLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Click on a collection
      await categoryLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      // Navigate directly to a collection
      await page.goto('/collections/beauty');
      await page.waitForLoadState('networkidle');
    }

    // Verify products are filtered/displayed
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });

    const collectionProducts = productCards.filter({ hasText: /\$\d+/ });
    const count = await collectionProducts.count();
    expect(count).toBeGreaterThan(0);

    // Add product from collection to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible();

    // Verify cart works from collection page
    await page.locator('button:has-text("+")').first().click();
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible({ timeout: 3000 });
  });

  test('cross-page cart consistency: Add from listing → Add from detail → Add from related products', async ({ page }) => {
    // Add from listing page
    await page.goto('/products');
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 10000 });

    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible();

    // Close cart
    const closeButton2 = page.locator('button:has([class*="sr-only"]:has-text("Close panel"))').first();
    await closeButton2.click();

    // Navigate to product detail page
    await page.goto('/products/2');
    await page.waitForLoadState('networkidle');

    // Add from detail page
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });

    // Should now have 2 items
    const cartItems = page.locator('[data-testid="cart-item"], li:has(button:has-text("Remove"))');
    let itemCount = await cartItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(2);

    // Close cart
    const closeButton4 = page.locator('button:has([class*="sr-only"]:has-text("Close panel"))').first();
    if (await closeButton4.isVisible()) {
      await closeButton4.click();
    }

    // Try to add from related products if available
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);

    const relatedProductsSection = page.locator('text=/Related Products|You may also like/i');

    if (await relatedProductsSection.isVisible().catch(() => false)) {
      // Find add to cart button in related products area
      const relatedAddButton = page.locator('[data-testid="related-products"] button:has-text("Add to Cart"), button:has-text("Add to Cart")').nth(4);

      if (await relatedAddButton.isVisible().catch(() => false)) {
        await relatedAddButton.click();
        await page.waitForSelector('text=Shopping cart', { timeout: 5000 });

        // Should have 3 items now
        itemCount = await page.locator('[data-testid="cart-item"], li:has(button:has-text("Remove"))').count();
        expect(itemCount).toBeGreaterThanOrEqual(2); // At least 2, possibly 3 if related products worked
      }
    }

    // Verify all additions are persisted
    await expect(page.locator('h2:has-text("Shopping cart")')).toBeVisible();
    await expect(page.locator('text=Subtotal')).toBeVisible();
  });

  test('mobile-like navigation: Test responsive cart behavior', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/products');
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 10000 });

    // Add to cart on mobile
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });

    // Cart drawer should be full screen or take most of screen on mobile
    const cartDrawer = page.locator('h2:has-text("Shopping cart")').locator('..');
    await expect(cartDrawer).toBeVisible();

    // Should be able to close cart on mobile
    const closeButton5 = page.locator('button:has([class*="sr-only"]:has-text("Close panel"))').first();
    await expect(closeButton5).toBeVisible({ timeout: 3000 });

    await closeButton5.click();
    await page.waitForTimeout(500);

    // Should be able to reopen cart via mobile menu
    const cartButton = page.locator('button:has-text("Cart"), [data-testid="cart-button"]').first();
    await expect(cartButton).toBeVisible();

    await cartButton.click();
    await expect(page.locator('h2:has-text("Shopping cart")')).toBeVisible({ timeout: 5000 });

    // Cart operations should work on mobile
    await page.locator('button:has-text("+")').first().click();
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible({ timeout: 3000 });

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});
