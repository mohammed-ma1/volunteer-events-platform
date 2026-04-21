<?php

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', env(
            'CORS_ALLOWED_ORIGINS',
            'http://localhost:4200,http://127.0.0.1:4200'
        ))
    ))),

    /**
     * Any port — `ng serve` falls back to a random port when 4200 is busy, which breaks a fixed
     * CORS_ALLOW_ORIGINS list (e.g. only :4200).
     */
    'allowed_origins_patterns' => [
        '#^http://localhost:\d+\z#u',
        '#^http://127\.0\.0\.1:\d+\z#u',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['X-Cart-Token', 'Authorization'],

    'max_age' => 0,

    'supports_credentials' => false,

];
