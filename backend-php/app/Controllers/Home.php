<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\API\ResponseTrait;

/**
 * Home Controller
 * Provides basic API info endpoint
 */
class Home extends ResourceController
{
    use ResponseTrait;

    public function index()
    {
        return $this->respond([
            'success' => true,
            'message' => 'Rebuy Engine API - CodeIgniter 4',
            'version' => '1.0.0',
            'endpoints' => [
                'GET /api/cart' => 'Get cart state',
                'POST /api/cart/add' => 'Add line to cart',
                'PUT /api/cart/update/{line_id}' => 'Update cart line',
                'DELETE /api/cart/remove/{line_id}' => 'Remove cart line'
            ]
        ]);
    }
}
