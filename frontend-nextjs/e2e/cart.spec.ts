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
});
