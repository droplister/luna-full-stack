<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\API\ResponseTrait;

/**
 * Cart API Controller
 * Implements requirements with session-based cart storage
 *
 * Endpoints:
 * - GET /api/cart
 * - POST /api/cart/add
 * - PUT /api/cart/update/{line_id}
 * - DELETE /api/cart/remove/{line_id}
 *
 * Uses CodeIgniter sessions for "would be nice" persistence
 * No database required - sessions provide temporary storage
 */
class CartController extends ResourceController
{
    use ResponseTrait;

    /**
     * GET /api/cart
     * Retrieve the current cart state from session
     *
     * Returns: Full cart object with lines and financials
     */
    public function index()
    {
        $cart = $this->getCartFromSession();
        return $this->respond($cart);
    }

    /**
     * POST /api/cart/add
     * Add a line to the cart
     *
     * Request body:
     * {
     *   "product_id": 1,      // product_id from DummyJSON
     *   "quantity": 2,
     *   "title": "Product Name",
     *   "price": 9.99,
     *   "image": "https://...",
     *   "product_data": { ... } // Additional DummyJSON fields
     * }
     *
     * Returns: Full updated cart object
     */
    public function add()
    {
        $request = $this->request->getJSON();

        if (!$request || !isset($request->product_id) || !isset($request->quantity)) {
            return $this->fail([
                'status' => 400,
                'message' => 'Cart Error',
                'description' => 'Missing required fields: product_id and quantity'
            ], 400);
        }

        $cart = $this->getCartFromSession();

        // Generate line ID to check if line already exists
        $lineId = $this->generateLineId($request->product_id);

        $existingIndex = $this->findLineIndex($cart['items'], $lineId);

        if ($existingIndex !== false) {
            // Update existing line quantity
            $cart['items'][$existingIndex]['quantity'] += $request->quantity;
            $cart['items'][$existingIndex]['line_total'] =
                $cart['items'][$existingIndex]['price'] * $cart['items'][$existingIndex]['quantity'];
        } else {
            // Add new line
            $newLine = $this->buildCartLine($request);
            $cart['items'][] = $newLine;
        }

        // Recalculate totals
        $cart = $this->recalculateCart($cart);

        // Save to session
        $this->saveCartToSession($cart);

        return $this->respond($cart);
    }

    /**
     * PUT /api/cart/update/{line_id}
     * Update cart line quantity
     * Setting quantity to 0 auto-removes the line
     *
     * Request body:
     * {
     *   "quantity": 3
     * }
     *
     * Returns: Full updated cart object
     */
    public function update($lineId)
    {
        $request = $this->request->getJSON();

        if (!$request || !isset($request->quantity)) {
            return $this->fail([
                'status' => 400,
                'message' => 'Cart Error',
                'description' => 'Quantity is required'
            ], 400);
        }

        $cart = $this->getCartFromSession();
        $lineIndex = $this->findLineIndex($cart['items'], $lineId);

        if ($lineIndex === false) {
            return $this->fail([
                'status' => 404,
                'message' => 'Cart Error',
                'description' => 'Line not found in cart'
            ], 404);
        }

        // CI3 Cart pattern: Setting quantity to 0 removes the line
        if ($request->quantity <= 0) {
            array_splice($cart['items'], $lineIndex, 1);
        } else {
            // Update quantity
            $cart['items'][$lineIndex]['quantity'] = $request->quantity;
            $cart['items'][$lineIndex]['line_total'] =
                $cart['items'][$lineIndex]['price'] * $request->quantity;
        }

        // Recalculate totals
        $cart = $this->recalculateCart($cart);

        // Save to session
        $this->saveCartToSession($cart);

        return $this->respond($cart);
    }

    /**
     * DELETE /api/cart/remove/{line_id}
     * Remove a line from the cart
     *
     * Returns: Full updated cart object
     */
    public function remove($lineId)
    {
        $cart = $this->getCartFromSession();
        $lineIndex = $this->findLineIndex($cart['items'], $lineId);

        if ($lineIndex === false) {
            return $this->fail([
                'status' => 404,
                'message' => 'Cart Error',
                'description' => 'Line not found in cart'
            ], 404);
        }

        // Remove line from array
        array_splice($cart['items'], $lineIndex, 1);

        // Recalculate totals
        $cart = $this->recalculateCart($cart);

        // Save to session
        $this->saveCartToSession($cart);

        return $this->respond($cart);
    }

    /**
     * Get cart from CodeIgniter session or initialize empty cart
     */
    private function getCartFromSession(): array
    {
        $cart = session()->get('cart');

        if (!$cart) {
            $cart = $this->initializeEmptyCart();
        }

        return $cart;
    }

    /**
     * Save cart to CodeIgniter session
     */
    private function saveCartToSession(array $cart): void
    {
        session()->set('cart', $cart);
    }

    /**
     * Initialize an empty cart
     * Simple structure matching DummyJSON products
     */
    private function initializeEmptyCart(): array
    {
        return [
            'items' => [],
            'subtotal' => 0,
            'currency' => 'USD'
        ];
    }

    /**
     * Build cart line from request data
     * Uses MD5 hash of product_id for unique identification
     */
    private function buildCartLine($request): array
    {
        $priceInCents = (int)($request->price * 100);
        $quantity = $request->quantity;

        // Generate unique line ID using MD5 hash of product_id
        $lineId = $this->generateLineId($request->product_id);

        return [
            'line_id' => $lineId,                   // MD5 hash for unique identification
            'product_id' => $request->product_id,   // DummyJSON product ID
            'title' => $request->title ?? 'Product',
            'price' => $priceInCents,               // Price in cents
            'quantity' => $quantity,
            'image' => $request->image ?? $request->thumbnail ?? '',
            'brand' => $request->brand ?? null,
            'category' => $request->category ?? null,
            'sku' => $request->sku ?? null,
            'line_total' => $priceInCents * $quantity
        ];
    }

    /**
     * Find line index in cart by line ID
     * Lookup by MD5 hash instead of product_id
     */
    private function findLineIndex(array $lines, string $lineId)
    {
        foreach ($lines as $index => $line) {
            if ($line['line_id'] === $lineId) {
                return $index;
            }
        }
        return false;
    }

    /**
     * Recalculate cart totals
     * Only calculates subtotal - tax and shipping require checkout info
     */
    private function recalculateCart(array $cart): array
    {
        $subtotal = 0;

        foreach ($cart['items'] as $line) {
            $subtotal += $line['line_total'];
        }

        $cart['subtotal'] = $subtotal;

        return $cart;
    }

    /**
     * Generate unique ID for cart line
     * Uses MD5 hash of product_id for unique identification
     *
     * @param int $productId DummyJSON product ID
     * @return string MD5 hash line ID
     */
    private function generateLineId(int $productId): string
    {
        return md5((string)$productId);
    }
}
