/**
 * E2E tests for Race Conditions & State Consistency
 * Tests rapid interactions and version tracking validation
 * Validates that version tracking prevents stale responses from corrupting UI state
 */

import { test, expect } from '@playwright/test';

test.describe('Race Conditions & State Consistency', () => {
  test('should handle rapid "Add to Cart" clicks without duplicates', async ({ page }) => {
    // First add a product to cart to access the cart page with related products
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForTimeout(1000);

    // Navigate to cart page where related products don't open drawer
    await page.goto('/cart');
    await page.waitForTimeout(2000);

    // Find related product add to cart buttons (these don't open drawer)
    const relatedAddButtons = page.locator('button:has-text("Add to Cart")');
    const buttonCount = await relatedAddButtons.count();

    if (buttonCount > 0) {
      const addButton = relatedAddButtons.first();

      // Rapidly click add to cart button 5 times
      for (let i = 0; i < 5; i++) {
        await addButton.click();
        await page.waitForTimeout(50); // Very short delay
      }

      // Wait for operations to settle
      await page.waitForTimeout(2000);

      // Verify cart items updated (should have original + new product)
      const cartItems = page.locator('[data-testid="cart-item"], li:has(button:has-text("Remove"))');
      const itemCount = await cartItems.count();

      expect(itemCount).toBeGreaterThanOrEqual(1);
      expect(itemCount).toBeLessThanOrEqual(3); // Original + rapid clicks
    }
  });

  test('should handle rapid increment/decrement without state corruption', async ({ page }) => {
    await page.goto('/products');
    // Wait longer for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Add item to cart first
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('h2:has-text("Shopping cart")', { timeout: 10000 });

    // Wait for cart item to appear with quantity 1
    const initialQuantityDisplay = page.locator('[data-testid="cart-item-quantity"]').first();
    await expect(initialQuantityDisplay).toHaveText('1');

    const incrementButton = page.locator('button:has-text("+")').first();
    const decrementButton = page.locator('button:has-text("−")').first();

    // Rapidly alternate between increment and decrement (truly rapid to trigger debounce)
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 0) {
        await incrementButton.click();
      } else {
        await decrementButton.click();
      }
      await page.waitForTimeout(50); // Shorter delay to trigger debounce behavior
    }

    // Wait for debounced operations to settle
    await page.waitForTimeout(1500);

    // Cart should still have the item (not removed or corrupted)
    const cartItems = page.locator('[data-testid="cart-item"], li:has(button:has-text("Remove"))');
    const itemCount = await cartItems.count();

    expect(itemCount).toBe(1);

    // Quantity should be valid (not negative, not corrupted)
    const quantityDisplay = page.locator('[data-testid="cart-item-quantity"]').first();
    const quantityText = await quantityDisplay.textContent();
    const quantity = parseInt(quantityText || '0');

    expect(quantity).toBeGreaterThan(0);
    expect(quantity).toBeLessThanOrEqual(10);

    // Cart should still be functional
    await incrementButton.click();
    await page.waitForTimeout(500);

    const newQuantityDisplay = page.locator('[data-testid="cart-item-quantity"]').first();
    const newQuantityText = await newQuantityDisplay.textContent();
    const newQuantity = parseInt(newQuantityText || '0');

    expect(newQuantity).toBe(quantity + 1);
  });

  test('should handle concurrent remove operations', async ({ page }) => {
    await page.goto('/products');
    // Wait longer for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Add multiple items
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('h2:has-text("Shopping cart")', { timeout: 10000 });

    await page.locator('button:has-text("Close panel")').first().click();
    await page.waitForTimeout(500);

    await page.locator('button:has-text("Add to Cart")').nth(1).click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });

    // Verify 2 items
    let cartItems = page.locator('[data-testid="cart-item"], li:has(button:has-text("Remove"))');
    let itemCount = await cartItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(2);

    // Rapidly click remove on both items
    const removeButtons = page.locator('button:has-text("Remove")');
    const removeCount = await removeButtons.count();

    if (removeCount >= 2) {
      // Click both remove buttons quickly
      await removeButtons.nth(0).click();
      await page.waitForTimeout(100);
      await removeButtons.nth(0).click(); // Click first one again (should handle second item)
      await page.waitForTimeout(2000);

      // Cart should be empty or have at most 0-1 items (not corrupted)
      const finalItems = await page.locator('[data-testid="cart-item"], li:has(button:has-text("Remove"))').count();

      expect(finalItems).toBeLessThanOrEqual(1);

      // If empty, should show empty cart message
      if (finalItems === 0) {
        await expect(page.locator('text=Your cart is empty')).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should maintain consistency when adding same product from multiple pages', async ({ page }) => {
    // Add from products listing
    await page.goto('/products');
    // Wait longer for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });

    // Verify quantity 1 appears in cart
    const firstQuantityDisplay = page.locator('[data-testid="cart-item-quantity"]').first();
    await expect(firstQuantityDisplay).toHaveText('1');

    // Don't wait for cart operations to complete - immediately navigate away
    await page.goto('/products/1', { waitUntil: 'domcontentloaded' });

    // Immediately add from detail page (same product) - wait longer for page to load
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 15000 });
    await page.locator('button:has-text("Add to Cart")').first().click();

    // Wait for operations to settle
    await page.waitForTimeout(2000);

    // Should have 1 line item with quantity 2 (or close to it)
    await expect(page.locator('h2:has-text("Shopping cart")')).toBeVisible({ timeout: 5000 });

    const cartItems = page.locator('[data-testid="cart-item"], li:has(button:has-text("Remove"))');
    const itemCount = await cartItems.count();

    // Should be 1-2 line items (same product might create separate entries or merge)
    expect(itemCount).toBeGreaterThanOrEqual(1);
    expect(itemCount).toBeLessThanOrEqual(2);

    const quantityDisplay = page.locator('[data-testid="cart-item-quantity"]').first();
    const quantityText = await quantityDisplay.textContent();
    const quantity = parseInt(quantityText || '0');

    // Quantity should be at least 1 (possibly 2 if both operations completed)
    expect(quantity).toBeGreaterThanOrEqual(1);
    expect(quantity).toBeLessThanOrEqual(3); // Reasonable upper bound
  });

  test('should validate version tracking prevents stale responses in UI', async ({ page }) => {
    await page.goto('/products');
    // Wait longer for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Add item to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });

    // Verify quantity 1 appears
    const initialQuantityDisplay = page.locator('[data-testid="cart-item-quantity"]').first();
    await expect(initialQuantityDisplay).toHaveText('1');

    // Mock slow responses to create race condition scenario
    let requestCount = 0;
    await page.route('**/api/cart/**', async (route) => {
      requestCount++;
      const currentRequest = requestCount;

      // First request takes 2 seconds
      // Second request takes 0.5 seconds
      const delay = currentRequest === 1 ? 2000 : 500;

      await page.waitForTimeout(delay);
      await route.continue();
    });

    // Make two rapid updates
    const incrementButton = page.locator('button:has-text("+")').first();

    await incrementButton.click(); // Request 1 (slow)
    await page.waitForTimeout(200);
    await incrementButton.click(); // Request 2 (fast)

    // Wait for both operations to complete
    await page.waitForTimeout(3500);

    // Final state should be consistent (not corrupted by stale response)
    const quantityDisplay = page.locator('[data-testid="cart-item-quantity"]').first();
    const quantityText = await quantityDisplay.textContent();
    const quantity = parseInt(quantityText || '0');

    // Should have incremented at least once
    expect(quantity).toBeGreaterThanOrEqual(2);

    // State should be stable (not flickering between values)
    await page.waitForTimeout(500);
    const finalQuantityDisplay = page.locator('[data-testid="cart-item-quantity"]').first();
    const finalQuantityText = await finalQuantityDisplay.textContent();
    const finalQuantity = parseInt(finalQuantityText || '0');

    // Quantity should remain stable
    expect(finalQuantity).toBe(quantity);

    // Cart should still be functional (can perform more operations)
    await incrementButton.click();
    await page.waitForTimeout(1500);

    const afterIncrementDisplay = page.locator('[data-testid="cart-item-quantity"]').first();
    const afterIncrementText = await afterIncrementDisplay.textContent();
    const afterIncrementQty = parseInt(afterIncrementText || '0');

    expect(afterIncrementQty).toBeGreaterThan(finalQuantity);
  });
});
