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
            'api' => [
                'name' => 'Rebuy Engine API',
                'version' => '1.0.0',
                'framework' => 'CodeIgniter 4'
            ],
            'endpoints' => [
                [
                    'method' => 'GET',
                    'path' => '/api/cart',
                    'description' => 'Get cart state'
                ],
                [
                    'method' => 'POST',
                    'path' => '/api/cart/add',
                    'description' => 'Add line to cart'
                ],
                [
                    'method' => 'PUT',
                    'path' => '/api/cart/update/{line_id}',
                    'description' => 'Update cart line'
                ],
                [
                    'method' => 'DELETE',
                    'path' => '/api/cart/remove/{line_id}',
                    'description' => 'Remove cart line'
                ]
            ]
        ]);
    }
}
