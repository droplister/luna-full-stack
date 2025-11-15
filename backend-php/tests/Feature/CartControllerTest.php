<?php

namespace Tests\Feature;

use CodeIgniter\Test\FeatureTestTrait;
use CodeIgniter\Test\CIUnitTestCase;

/**
 * Integration tests for Cart API Controller
 *
 * Tests all 4 required endpoints from the prompt:
 * - GET /api/cart
 * - POST /api/cart/add
 * - PUT /api/cart/update/{line_id}
 * - DELETE /api/cart/remove/{line_id}
 *
 * Validates functional cart implementation with session persistence,
 * calculations, and error handling.
 */
class CartControllerTest extends CIUnitTestCase
{
    use FeatureTestTrait;

    protected function setUp(): void
    {
        parent::setUp();
        // Clear session before each test
        $_SESSION = [];
    }

    /**
     * Test 1: GET /api/cart returns empty cart initially
     */
    public function testGetEmptyCart()
    {
        $result = $this->get('/api/cart');

        $result->assertStatus(200);
        $result->assertJSONFragment([
            'items' => [],
            'subtotal' => 0,
            'currency' => 'USD'
        ]);
    }

    /**
     * Test 2: POST /api/cart/add successfully adds line
     */
    public function testAddLineToCart()
    {
        $product = [
            'product_id' => 1,
            'quantity' => 2,
            'title' => 'Test Product',
            'price' => 9.99,
            'image' => 'https://example.com/image.jpg',
            'brand' => 'Test Brand',
            'category' => 'Test Category',
            'sku' => 'TEST-001'
        ];

        $result = $this->withBodyFormat('json')->post('/api/cart/add', $product);

        $result->assertStatus(200);

        // Verify response structure
        $json = json_decode($result->getJSON());
        $this->assertObjectHasProperty('items', $json);
        $this->assertObjectHasProperty('subtotal', $json);

        // Verify calculations
        $this->assertEquals(1998, $json->subtotal); // 9.99 * 100 * 2 = 1998 cents

        // Verify line structure
        $this->assertCount(1, $json->items);
        $this->assertEquals('Test Product', $json->items[0]->title);
        $this->assertEquals(2, $json->items[0]->quantity);
        $this->assertEquals(999, $json->items[0]->price); // Price in cents
        $this->assertEquals(1998, $json->items[0]->line_total);
    }

    /**
     * Test 3: Adding same product twice updates quantity (MD5 ID prevents duplicates)
     */
    public function testAddSameProductUpdatesQuantity()
    {
        $product = [
            'product_id' => 1,
            'quantity' => 2,
            'title' => 'Product',
            'price' => 10.00
        ];

        // First add
        $this->withBodyFormat('json')->post('/api/cart/add', $product);

        // Second add (same product) - use withSession(null) to carry forward session
        $this->withSession(null)->withBodyFormat('json')->post('/api/cart/add', [
            'product_id' => 1,
            'quantity' => 3,
            'title' => 'Product',
            'price' => 10.00
        ]);

        $result = $this->withSession(null)->get('/api/cart');
        $json = json_decode($result->getJSON());

        // Should have 1 line with quantity 5, not 2 separate lines
        $this->assertCount(1, $json->items);
        $this->assertEquals(5, $json->items[0]->quantity);
        $this->assertEquals(5000, $json->subtotal); // 10.00 * 100 * 5
    }

    /**
     * Test 4: PUT /api/cart/update/{line_id} updates quantity
     */
    public function testUpdateLineQuantity()
    {
        // Add line first
        $product = [
            'product_id' => 1,
            'quantity' => 2,
            'title' => 'Product',
            'price' => 10.00
        ];
        $addResult = $this->withBodyFormat('json')->post('/api/cart/add', $product);
        $json = json_decode($addResult->getJSON());
        $lineId = $json->items[0]->line_id;

        // Update quantity to 5
        $result = $this->withSession(null)->withBodyFormat('json')->put("/api/cart/update/{$lineId}", ['quantity' => 5]);

        $result->assertStatus(200);

        $json = json_decode($result->getJSON());
        $this->assertEquals(5, $json->items[0]->quantity);
        $this->assertEquals(5000, $json->subtotal); // 10.00 * 100 * 5
    }

    /**
     * Test 5: Update quantity to 0 auto-removes line (cart pattern)
     */
    public function testUpdateQuantityToZeroRemovesLine()
    {
        // Add line
        $product = [
            'product_id' => 1,
            'quantity' => 2,
            'title' => 'Product',
            'price' => 10.00
        ];
        $addResult = $this->withBodyFormat('json')->post('/api/cart/add', $product);
        $json = json_decode($addResult->getJSON());
        $lineId = $json->items[0]->line_id;

        // Update to 0
        $result = $this->withSession(null)->withBodyFormat('json')->put("/api/cart/update/{$lineId}", ['quantity' => 0]);

        $result->assertStatus(200);

        $json = json_decode($result->getJSON());
        $this->assertCount(0, $json->items);
        $this->assertEquals(0, $json->subtotal);
    }

    /**
     * Test 6: DELETE /api/cart/remove/{line_id} removes line
     */
    public function testRemoveLine()
    {
        // Add line
        $product = [
            'product_id' => 1,
            'quantity' => 2,
            'title' => 'Product',
            'price' => 10.00
        ];
        $addResult = $this->withBodyFormat('json')->post('/api/cart/add', $product);
        $json = json_decode($addResult->getJSON());
        $lineId = $json->items[0]->line_id;

        // Remove line
        $result = $this->withSession(null)->delete("/api/cart/remove/{$lineId}");

        $result->assertStatus(200);

        $json = json_decode($result->getJSON());
        $this->assertCount(0, $json->items);
        $this->assertEquals(0, $json->subtotal);
    }

    /**
     * Test 7: Update non-existent line returns 404
     */
    public function testUpdateNonExistentLineReturns404()
    {
        $result = $this->withBodyFormat('json')->put('/api/cart/update/nonexistentid123', ['quantity' => 5]);

        $result->assertStatus(404);
        $json = json_decode($result->getJSON());
        $this->assertEquals(404, $json->status);
    }

    /**
     * Test 8: Remove non-existent line returns 404
     */
    public function testRemoveNonExistentLineReturns404()
    {
        $result = $this->delete('/api/cart/remove/nonexistentid123');

        $result->assertStatus(404);
        $json = json_decode($result->getJSON());
        $this->assertEquals(404, $json->status);
    }

    /**
     * Test 9: Add without required fields returns 400
     */
    public function testAddWithoutRequiredFieldsReturns400()
    {
        // Missing product_id and quantity
        $result = $this->withBodyFormat('json')->post('/api/cart/add', ['title' => 'Product']);

        $result->assertStatus(400);
        $json = json_decode($result->getJSON());
        $this->assertEquals(400, $json->status);
    }

    /**
     * Test 10: Multiple different lines in cart calculates correctly
     */
    public function testMultipleLinesInCart()
    {
        // Add two different products
        $this->withBodyFormat('json')->post('/api/cart/add', [
            'product_id' => 1,
            'quantity' => 2,
            'title' => 'Product 1',
            'price' => 10.00,
            'brand' => 'Brand A'
        ]);

        $this->withSession(null)->withBodyFormat('json')->post('/api/cart/add', [
            'product_id' => 2,
            'quantity' => 3,
            'title' => 'Product 2',
            'price' => 5.00,
            'brand' => 'Brand B'
        ]);

        $result = $this->withSession(null)->get('/api/cart');
        $json = json_decode($result->getJSON());

        // Verify two lines
        $this->assertCount(2, $json->items);

        // Verify totals
        $this->assertEquals(3500, $json->subtotal); // (10*100*2) + (5*100*3) = 2000 + 1500

        // Verify individual line totals
        $this->assertEquals(2000, $json->items[0]->line_total);
        $this->assertEquals(1500, $json->items[1]->line_total);
    }

    /**
     * Test 11: Session persistence - cart survives across requests
     */
    public function testCartPersistsAcrossRequests()
    {
        // Add line
        $this->withBodyFormat('json')->post('/api/cart/add', [
            'product_id' => 1,
            'quantity' => 2,
            'title' => 'Persistent Product',
            'price' => 15.00
        ]);

        // Make separate GET request (simulating page reload)
        $result = $this->withSession(null)->get('/api/cart');
        $json = json_decode($result->getJSON());

        // Cart should still have the line
        $this->assertCount(1, $json->items);
        $this->assertEquals('Persistent Product', $json->items[0]->title);
        $this->assertEquals(2, $json->items[0]->quantity);
    }

    /**
     * Test 12: Update missing quantity field returns 400
     */
    public function testUpdateWithoutQuantityReturns400()
    {
        // Add line first
        $addResult = $this->withBodyFormat('json')->post('/api/cart/add', [
            'product_id' => 1,
            'quantity' => 1,
            'title' => 'Product',
            'price' => 10.00
        ]);
        $json = json_decode($addResult->getJSON());
        $lineId = $json->items[0]->line_id;

        // Try to update without quantity field
        $result = $this->withSession(null)->withBodyFormat('json')->put("/api/cart/update/{$lineId}", []);

        $result->assertStatus(400);
        $json = json_decode($result->getJSON());
        $this->assertEquals(400, $json->status);
    }
}
