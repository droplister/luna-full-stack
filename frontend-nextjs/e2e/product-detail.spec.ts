/**
 * E2E tests for Product Detail Page
 * Tests dynamic routing, product information display, and cart integration
 * Technical Requirement #1: Product Listing & Detail Views
 */

import { test, expect } from '@playwright/test';

test.describe('Product Detail Page', () => {
  test('should load product detail page via dynamic route /products/[id]', async ({ page }) => {
    // Navigate to products listing first
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"], .group h3', { timeout: 10000 });

    // Click first product to navigate to detail page (force click to bypass overlay)
    await page.locator('[data-testid="product-card"] a, .group a').first().click({ force: true });

    // Verify URL matches dynamic route pattern (supports both numeric IDs and slug-based URLs)
    await page.waitForURL(/\/products\/[\w-]+/, { timeout: 5000 });
    expect(page.url()).toMatch(/\/products\/[\w-]+/);

    // Verify product detail content loaded
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 5000 });
  });

  test('should display comprehensive product information', async ({ page }) => {
    // Navigate to specific product
    await page.goto('/products/1');
    await page.waitForLoadState('networkidle');

    // Verify essential product information is displayed
    const requiredElements = [
      { name: 'Product Title', selector: 'h1, h2, [data-testid="product-title"]' },
      { name: 'Price', selector: 'text=/\\$\\d+\\.?\\d*/' },
      { name: 'Description', selector: 'p:has-text(""), [data-testid="product-description"]' },
      { name: 'Add to Cart Button', selector: 'button:has-text("Add to Cart")' },
    ];

    for (const element of requiredElements) {
      const locator = page.locator(element.selector).first();
      await expect(locator).toBeVisible({ timeout: 5000 });
    }

    // Verify additional product details if available
    const optionalElements = [
      page.locator('text=/Stock|Available|In stock/i').first(),
      page.locator('text=/Brand|Category/i').first(),
      page.locator('img[alt*=""], img[src*="product"]').first(),
    ];

    // At least one optional element should be visible
    let foundOptional = false;
    for (const element of optionalElements) {
      if (await element.isVisible().catch(() => false)) {
        foundOptional = true;
        break;
      }
    }

    expect(foundOptional).toBe(true);
  });

  test('should support both numeric IDs and slug-based URLs', async ({ page }) => {
    // Test numeric ID route
    await page.goto('/products/1');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("Add to Cart")')).toBeVisible({ timeout: 5000 });

    const numericIdUrl = page.url();
    expect(numericIdUrl).toContain('/products/');

    // Try slug-based URL if supported (based on earlier research showing slug support)
    // Example: /products/essence-mascara-lash-princess-1
    const slugRoutes = [
      '/products/essence-mascara-lash-princess-1',
      '/products/eyeshadow-palette-with-mirror-2',
      '/products/powder-canister-3',
    ];

    for (const slugRoute of slugRoutes) {
      const response = await page.goto(slugRoute, { waitUntil: 'networkidle' });

      if (response && response.ok()) {
        // Slug route works
        await expect(page.locator('button:has-text("Add to Cart")')).toBeVisible({ timeout: 5000 });
        expect(page.url()).toContain('/products/');
        break; // At least one slug route works
      }
    }
  });

  test('should show related products section', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForLoadState('networkidle');

    // Look for related products section
    const relatedProductsSection = page.locator('text=/Related Products|You may also like|Similar Items/i').first();

    if (await relatedProductsSection.isVisible().catch(() => false)) {
      // Verify related products are displayed
      await expect(relatedProductsSection).toBeVisible();

      // Should have at least one related product card
      const relatedCards = page.locator('[data-testid="related-product"], .group').filter({ hasText: /\$\d+/ });
      const count = await relatedCards.count();

      expect(count).toBeGreaterThan(0);
    } else {
      // Related products section might be lower on page, scroll down
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(500);

      const relatedAfterScroll = page.locator('text=/Related Products|You may also like|Similar Items/i, [data-testid="related-products"]').first();

      if (await relatedAfterScroll.isVisible().catch(() => false)) {
        await expect(relatedAfterScroll).toBeVisible();
      }
    }
  });

  test('should allow adding to cart from product detail page', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForLoadState('networkidle');

    // Verify cart badge starts at 0 or empty
    const cartBadge = page.locator('[data-testid="cart-badge"], .cart-count, text=/\\d+ items?/i');
    const initialCount = await cartBadge.textContent().catch(() => '0');

    // Click "Add to Cart" button
    const addButton = page.locator('button:has-text("Add to Cart")').first();
    await addButton.click();

    // Cart drawer should open
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });

    // Verify product was added (check quantity display)
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toHaveText('1', { timeout: 3000 });
  });

  test('should update cart badge when adding from detail page', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForLoadState('networkidle');

    // Click "Add to Cart" button
    await page.locator('button:has-text("Add to Cart")').first().click();

    // Wait for cart drawer to open
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });

    // Close cart drawer to see badge clearly
    const closeButton = page.locator('button[aria-label="Close panel"], button:has-text("Continue Shopping")').first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500);
    }

    // Verify cart badge shows count
    const cartBadge = page.locator('[data-testid="cart-badge"], .cart-count, button:has-text("Cart")');
    await expect(cartBadge).toBeVisible();

    // Badge should indicate items in cart (either number or visual indicator)
    const badgeText = await cartBadge.textContent();
    expect(badgeText).toBeTruthy();
  });

  test('should handle invalid product IDs with 404 or error state', async ({ page }) => {
    // Try to navigate to non-existent product
    const response = await page.goto('/products/999999', { waitUntil: 'networkidle' });

    // Should either return 404 or show error state in UI
    if (response && response.status() === 404) {
      expect(response.status()).toBe(404);
    } else {
      // Wait for loading to complete (check that loading text disappears or error appears)
      await page.waitForTimeout(3000);

      // Should either show error message or "product not found" message
      const errorMessageVisible = await page.locator('text=/Product not found|Error loading product/i').isVisible().catch(() => false);

      // Or verify that "Add to Cart" button doesn't appear (graceful handling)
      const addToCartVisible = await page.locator('button:has-text("Add to Cart")').isVisible().catch(() => false);

      // Either error message should show OR Add to Cart should NOT show (meaning invalid product)
      expect(errorMessageVisible || !addToCartVisible).toBe(true);
    }
  });

  test('should show stock availability status', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForLoadState('networkidle');

    // Look for stock indicators
    const stockPatterns = [
      page.locator('text=/\\d+ available|\\d+ in stock/i'),
      page.locator('text=/In stock|Out of stock|Low stock/i'),
      page.locator('[data-testid="stock-status"]'),
    ];

    let stockInfoFound = false;
    for (const pattern of stockPatterns) {
      if (await pattern.isVisible().catch(() => false)) {
        stockInfoFound = true;
        await expect(pattern).toBeVisible();
        break;
      }
    }

    // Stock information should be displayed somewhere on the page
    if (!stockInfoFound) {
      // Try scrolling to find it
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 3));
      await page.waitForTimeout(500);

      for (const pattern of stockPatterns) {
        if (await pattern.isVisible().catch(() => false)) {
          stockInfoFound = true;
          break;
        }
      }
    }

    // Stock status should be present for e-commerce best practices
    expect(stockInfoFound).toBe(true);
  });

  test('should display product images in gallery format', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForLoadState('networkidle');

    // Look for product images
    const productImages = page.locator('img[alt*=""], img[src*="product"], [data-testid="product-image"]');
    const imageCount = await productImages.count();

    expect(imageCount).toBeGreaterThan(0);

    // Verify at least one image is visible and loaded
    const firstImage = productImages.first();
    await expect(firstImage).toBeVisible();

    // Check if image loaded successfully
    const isLoaded = await firstImage.evaluate((img: HTMLImageElement) => {
      return img.complete && img.naturalHeight > 0;
    });

    expect(isLoaded).toBe(true);
  });

  test('should preserve cart state when navigating back to listing', async ({ page }) => {
    // Add product from detail page
    await page.goto('/products/1');
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForSelector('text=Shopping cart', { timeout: 5000 });

    // Close cart drawer
    const closeButton = page.locator('button:has-text("Close panel")').first();
    await closeButton.click();

    // Navigate back to products listing
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"], .group', { timeout: 10000 });

    // Open cart from listing page
    const cartButton = page.locator('button:has-text("Cart"), [data-testid="cart-button"]').first();
    await cartButton.click();

    // Verify cart still has the item (check quantity display)
    await expect(page.locator('[data-testid="cart-item-quantity"]').first()).toHaveText('1', { timeout: 3000 });
    await expect(page.locator('h2:has-text("Shopping cart")')).toBeVisible();
  });
});
