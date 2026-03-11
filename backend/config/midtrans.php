<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Midtrans Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration for Midtrans payment gateway integration.
    | Midtrans is used for online payment processing.
    |
    */

    'server_key' => env('MIDTRANS_SERVER_KEY'),
    'client_key' => env('MIDTRANS_CLIENT_KEY'),

    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    'is_sanitized' => env('MIDTRANS_IS_SANITIZED', true),
    'is_3ds' => env('MIDTRANS_IS_3DS', true),

    /*
    |--------------------------------------------------------------------------
    | Callback Configuration
    |--------------------------------------------------------------------------
    |
    | URLs that Midtrans will call after transaction completion
    |
    */

    'callback' => [
        'finish_url' => env('APP_FRONTEND_URL', 'http://localhost:5173') . '/my-orders',
        'webhook_url' => env('APP_URL', 'http://localhost:8000') . '/api/payments/midtrans/webhook',
    ],

    /*
    |--------------------------------------------------------------------------
    | Item Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for item details sent to Midtrans
    |
    */

    'item' => [
        'max_name_length' => 50,
    ],
];
