<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

// Default route
$routes->get('/', 'Home::index');

/**
 * Cart API Routes (prompt requirements)
 * All routes are prefixed with /api
 *
 * Required endpoints:
 * - GET /api/cart
 * - POST /api/cart/add
 * - PUT /api/cart/update/{id}  (id = MD5 hash of product_id)
 * - DELETE /api/cart/remove/{id}
 */
$routes->group('api', ['namespace' => 'App\Controllers'], function ($routes) {
    // Cart endpoints
    $routes->get('cart', 'CartController::index');
    $routes->post('cart/add', 'CartController::add');
    $routes->put('cart/update/(:any)', 'CartController::update/$1');      // (:any) for MD5 hash
    $routes->delete('cart/remove/(:any)', 'CartController::remove/$1');   // (:any) for MD5 hash
});
