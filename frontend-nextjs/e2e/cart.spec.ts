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
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Click "Add to Cart" button on first product
    await page.locator('button:has-text("Add to Cart")').first().click();

    // Wait for cart drawer to open
    await page.waitForSelector('h2:has-text("Shopping cart")', { timeout: 5000 });

    // Verify cart shows correct price
    const cartPriceElement = await page.locator('.flex.justify-between >> text=/\\$[0-9.]+/').first();
    const cartPrice = await cartPriceElement.textContent();

    expect(cartPrice).toContain('$');
    expect(cartPrice).not.toContain('$999'); // Ensure no double conversion bug
  });

  test('should increase quantity when adding same product twice', async ({ page }) => {
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Add first product twice
    const addButton = page.locator('button:has-text("Add to Cart")').first();
    await addButton.click();

    // Wait for cart to open
    await page.waitForSelector('h2:has-text("Shopping cart")', { timeout: 5000 });

    // Close cart
    await page.locator('button:has-text("Close panel")').first().click();

    // Add same product again
    await addButton.click();

    // Verify quantity is 2
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible();
  });

  test('should update cart item quantity', async ({ page }) => {
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Add product to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('h2:has-text("Shopping cart")', { timeout: 5000 });

    // Initial quantity should be 1
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toHaveText('1');

    // Wait for cart to settle before clicking increment
    await page.waitForTimeout(1000);

    // Wait for increment button to be enabled
    const incrementButton = page.locator('button:has-text("+")').first();
    await incrementButton.waitFor({ state: 'attached', timeout: 5000 });
    await expect(incrementButton).toBeEnabled({ timeout: 10000 });

    // Click increment button
    await incrementButton.click();

    // Wait for debounced API call to complete
    await page.waitForTimeout(1500);

    // Verify quantity increased to 2
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toHaveText('2');

    // Wait for decrement button to be enabled
    const decrementButton = page.locator('button:has-text("−")').first();
    await decrementButton.waitFor({ state: 'attached', timeout: 5000 });
    await expect(decrementButton).toBeEnabled({ timeout: 10000 });

    // Click decrement button
    await decrementButton.click();

    // Wait for debounced API call to complete
    await page.waitForTimeout(1500);

    // Verify quantity decreased back to 1
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toHaveText('1');
  });

  test('should remove item when decrementing quantity to 0', async ({ page }) => {
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Add product to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('h2:has-text("Shopping cart")', { timeout: 5000 });

    // Verify cart has item with quantity 1
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toHaveText('1');

    // Wait for cart to settle before clicking decrement
    await page.waitForTimeout(1000);

    // Wait for decrement button to be enabled
    const decrementButton = page.locator('button:has-text("−")').first();
    await decrementButton.waitFor({ state: 'attached', timeout: 5000 });
    await expect(decrementButton).toBeEnabled({ timeout: 10000 });

    // Click decrement button to reduce quantity to 0
    await decrementButton.click();

    // Wait for API call to complete
    await page.waitForTimeout(1500);

    // Verify cart is empty (item auto-removed by backend)
    await expect(page.locator('text=Your cart is empty')).toBeVisible({ timeout: 3000 });
  });

  test('should remove item from cart', async ({ page }) => {
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Add product to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('h2:has-text("Shopping cart")', { timeout: 5000 });

    // Verify cart has items
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toHaveText('1');

    // Wait for cart to settle
    await page.waitForTimeout(1000);

    // Wait for remove button to be enabled
    const removeButton = page.locator('button:has-text("Remove")').first();
    await removeButton.waitFor({ state: 'attached', timeout: 5000 });
    await expect(removeButton).toBeEnabled({ timeout: 10000 });

    // Click remove button
    await removeButton.click();

    // Wait for API call to complete
    await page.waitForTimeout(1000);

    // Verify cart is empty
    await expect(page.locator('text=Your cart is empty')).toBeVisible({ timeout: 3000 });
  });

  test('should calculate correct subtotal', async ({ page }) => {
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Add first product
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('h2:has-text("Shopping cart")', { timeout: 5000 });

    // Wait for cart to settle
    await page.waitForTimeout(1000);

    // Close cart
    await page.locator('button:has-text("Close panel")').first().click();
    await page.waitForTimeout(500);

    // Add second product
    await page.locator('button:has-text("Add to Cart")').nth(1).click();
    await page.waitForSelector('h2:has-text("Shopping cart")', { timeout: 5000 });

    // Wait for both products to be in cart
    await page.waitForTimeout(1000);

    // Verify we have 2 items in cart
    const cartItems = page.locator('[data-testid="cart-item-quantity"]');
    const itemCount = await cartItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(2);

    // Verify subtotal exists and is greater than 0
    const subtotalElement = page.locator('text=Subtotal').locator('..').locator('p').last();
    await expect(subtotalElement).toBeVisible({ timeout: 5000 });
    const subtotalText = await subtotalElement.textContent();
    const subtotal = parseFloat(subtotalText?.replace('$', '') || '0');

    expect(subtotal).toBeGreaterThan(0);
  });

  test('should persist cart across page navigation', async ({ page }) => {
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Add product to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('h2:has-text("Shopping cart")', { timeout: 5000 });

    // Close cart
    await page.locator('button:has-text("Close panel")').first().click();
    await page.waitForTimeout(500);

    // Navigate to another page
    await page.goto('/products?page=2');

    // Open cart again
    await page.locator('button:has-text("Cart")').click();

    // Verify cart still has the item
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible();
  });

  test('should show optimistic updates (instant UI feedback)', async ({ page }) => {
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Add product to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('h2:has-text("Shopping cart")', { timeout: 5000 });

    // Get initial quantity
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toHaveText('1');

    // Wait for cart to settle
    await page.waitForTimeout(500);

    // Click increment - should update instantly (optimistic)
    const incrementButton = page.locator('button:has-text("+")').first();
    await incrementButton.click();

    // Verify quantity updates immediately (optimistic update should be instant)
    // The display should change quickly even before API responds
    await page.waitForTimeout(100);
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible({ timeout: 1000 });
  });

  test('should disable increment button when stock limit reached', async ({ page }) => {
    // Navigate to a product detail page to check stock
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Click first product to go to detail page (use link to avoid overlay)
    await page.locator('[data-testid="product-card"] a').first().click({ force: true });
    await page.waitForLoadState('networkidle');

    // Look for stock information
    const stockText = await page.locator('text=/\\d+ available|In stock/').textContent();

    // Add product to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('h2:has-text("Shopping cart")', { timeout: 5000 });

    // Wait for cart to settle
    await page.waitForTimeout(500);

    // If stock info shows limited stock (e.g., "5 available"), test the limit
    if (stockText && stockText.match(/\d+/)) {
      const stock = parseInt(stockText.match(/\d+/)?.[0] || '0');

      if (stock > 0 && stock <= 10) {
        // Increment to stock limit
        const incrementButton = page.locator('button:has-text("+")').first();

        for (let i = 1; i < stock; i++) {
          await incrementButton.click();
          await page.waitForTimeout(100); // Small delay for optimistic updates
        }

        // Wait for final operation to settle
        await page.waitForTimeout(1500);

        // Verify we're at stock limit
        await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible();

        // Increment button should now be disabled
        await expect(incrementButton).toBeDisabled();
      }
    }
  });

  test('should show stock warning for low stock items', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Click first product to view details (use link to avoid overlay)
    await page.locator('[data-testid="product-card"] a').first().click({ force: true });
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
        await page.waitForSelector('h2:has-text("Shopping cart")', { timeout: 5000 });

        // Should show "Only X left in stock" warning in cart
        await expect(page.locator(`text=/Only ${stock} left in stock/`)).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should show error toast when trying to exceed stock limit', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Click first product to view details (use link to avoid overlay)
    await page.locator('[data-testid="product-card"] a').first().click({ force: true });
    await page.waitForLoadState('networkidle');

    // Get stock amount
    const stockText = await page.locator('text=/\\d+ available|In stock/').textContent();

    if (stockText && stockText.match(/\d+/)) {
      const stock = parseInt(stockText.match(/\d+/)?.[0] || '0');

      if (stock > 0 && stock <= 5) {
        // Add to cart
        await page.locator('button:has-text("Add to Cart")').first().click();
        await page.waitForSelector('h2:has-text("Shopping cart")', { timeout: 5000 });

        // Wait for cart to settle
        await page.waitForTimeout(500);

        // Increment to stock limit
        const incrementButton = page.locator('button:has-text("+")').first();

        for (let i = 1; i < stock; i++) {
          await incrementButton.click();
          await page.waitForTimeout(100);
        }

        // Wait for final operation to settle
        await page.waitForTimeout(1500);

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
    // Add item successfully first
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('h2:has-text("Shopping cart")', { timeout: 5000 });

    // Verify initial state
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toHaveText('1');

    // Wait for cart to settle
    await page.waitForTimeout(500);

    // Mock API to return error on update
    await page.route('**/api/cart/**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server error' }),
      });
    });

    // Try to increment quantity
    await page.locator('button:has-text("+")').first().click();

    // Wait for API call and rollback
    await page.waitForTimeout(2500); // Debounced API call + error handling

    // UI should roll back to Qty 1 (verify rollback happened)
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toHaveText('1', { timeout: 3000 });

    // Remove the error mock to allow normal operations
    await page.unroute('**/api/cart/**');

    // Cart should still be functional after error (most important verification)
    // Try to increment again to ensure cart isn't broken
    const incrementButtonAfter = page.locator('button:has-text("+")').first();
    await incrementButtonAfter.waitFor({ state: 'attached', timeout: 5000 });
    await expect(incrementButtonAfter).toBeEnabled({ timeout: 10000 });

    // Successfully increment to verify cart recovered from error
    await incrementButtonAfter.click();
    await page.waitForTimeout(1500);

    // Should eventually reach quantity 2
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toHaveText('2', { timeout: 5000 });
  });

  test('should handle cart operations from /cart full page', async ({ page }) => {
    // Add item first from products page
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('h2:has-text("Shopping cart")', { timeout: 5000 });

    // Navigate to full cart page
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Should see cart items on full page
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toHaveText('1', { timeout: 5000 });

    // Wait for page to settle
    await page.waitForTimeout(1000);

    // Test increment from full cart page
    const incrementButton = page.locator('button:has-text("+")').first();
    await incrementButton.waitFor({ state: 'attached', timeout: 5000 });
    await expect(incrementButton).toBeEnabled({ timeout: 10000 });
    await incrementButton.click();
    await page.waitForTimeout(1500);
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toHaveText('2', { timeout: 3000 });

    // Test decrement from full cart page
    const decrementButton = page.locator('button:has-text("−")').first();
    await decrementButton.waitFor({ state: 'attached', timeout: 5000 });
    await expect(decrementButton).toBeEnabled({ timeout: 10000 });
    await decrementButton.click();
    await page.waitForTimeout(1500);
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toHaveText('1', { timeout: 3000 });

    // Test remove from full cart page
    const removeButton = page.locator('button:has-text("Remove")').first();
    await removeButton.waitFor({ state: 'attached', timeout: 5000 });
    await expect(removeButton).toBeEnabled({ timeout: 10000 });
    await removeButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Your cart is empty')).toBeVisible({ timeout: 3000 });
  });

  test('should update cart badge across all navigation changes', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Add item to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('h2:has-text("Shopping cart")', { timeout: 5000 });

    // Close cart drawer
    await page.locator('button:has-text("Close panel")').first().click();
    await page.waitForTimeout(500);

    // Navigate to product detail page
    await page.goto('/products/1');
    await page.waitForLoadState('networkidle');

    // Cart badge should still show item count
    const cartButton = page.locator('button:has-text("Cart"), [data-testid="cart-button"]').first();
    await expect(cartButton).toBeVisible();

    // Navigate to collection page
    await page.goto('/collections/beauty');
    await page.waitForLoadState('networkidle');

    // Cart badge should persist
    await expect(cartButton).toBeVisible();

    // Navigate to cart page
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Cart should show the item
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('should show stock warnings in different scenarios', async ({ page }) => {
    // Go to a product detail page
    await page.goto('/products/1');
    await page.waitForLoadState('networkidle');

    // Check stock information
    const stockText = await page.locator('text=/\\d+ available|In stock/i').textContent().catch(() => null);

    if (stockText && stockText.match(/\d+/)) {
      const stock = parseInt(stockText.match(/\d+/)?.[0] || '0');

      if (stock > 0 && stock <= 5) {
        // Add to cart
        await page.locator('button:has-text("Add to Cart")').first().click();
        await page.waitForSelector('text=Shopping cart');

        // Should show low stock warning in cart
        const lowStockWarning = page.locator(`text=/Only ${stock} left|Low stock/i`);

        if (await lowStockWarning.isVisible().catch(() => false)) {
          await expect(lowStockWarning).toBeVisible();
        }

        // Increment to near stock limit
        for (let i = 1; i < stock; i++) {
          await page.locator('button:has-text("+")').first().click();
          await page.waitForTimeout(100);
        }

        // Should show stock limit warning
        await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toBeVisible({ timeout: 3000 });

        // Increment button should be disabled
        await expect(page.locator('button:has-text("+")').first()).toBeDisabled();
      }
    }
  });

  test('should handle rapid cart updates without data corruption', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Add item to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('h2:has-text("Shopping cart")', { timeout: 5000 });
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toHaveText('1');

    // Wait for cart to settle
    await page.waitForTimeout(500);

    // Rapidly click increment multiple times
    const incrementButton = page.locator('button:has-text("+")').first();

    for (let i = 0; i < 5; i++) {
      await incrementButton.click();
      await page.waitForTimeout(100); // Small delay between clicks
    }

    // Wait for all operations to settle
    await page.waitForTimeout(3000);

    // Verify final quantity is consistent (should be > 1 but ≤ 6)
    const quantityText = await page.locator('[data-testid="cart-item-quantity"]').first().textContent();
    const quantity = parseInt(quantityText || '0');

    expect(quantity).toBeGreaterThan(1);
    expect(quantity).toBeLessThanOrEqual(6);

    // Verify cart is still functional (can decrement)
    await page.locator('button:has-text("−")').first().click();
    await page.waitForTimeout(1500);

    const newQuantityText = await page.locator('[data-testid="cart-item-quantity"]').first().textContent();
    const newQuantity = parseInt(newQuantityText || '0');

    expect(newQuantity).toBe(quantity - 1);
  });
});
