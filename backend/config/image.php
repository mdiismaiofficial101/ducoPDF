<?php

return [
    'driver' => env('IMAGE_DRIVER', 'gd'),
    'templates' => [
        'small' => [120, 120],
        'medium' => [400, 300],
        'large' => [1200, 630],
    ],
    'quality' => env('IMAGE_QUALITY', 80),
    'webp_quality' => env('WEBP_QUALITY', 75),
];
