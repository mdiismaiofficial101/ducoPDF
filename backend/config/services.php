<?php

return [
    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],
    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],
    'resend' => [
        'key' => env('RESEND_KEY'),
    ],
    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
    'sslcommerz' => [
        'sandbox' => env('SSLCOMMERZ_SANDBOX', true),
        'store_id' => env('SSLCOMMERZ_STORE_ID'),
        'store_password' => env('SSLCOMMERZ_STORE_PASSWORD'),
        'currency' => env('SSLCOMMERZ_CURRENCY', 'BDT'),
        'success_url' => env('SSLCOMMERZ_SUCCESS_URL'),
        'fail_url' => env('SSLCOMMERZ_FAIL_URL'),
        'cancel_url' => env('SSLCOMMERZ_CANCEL_URL'),
        'ipn_url' => env('SSLCOMMERZ_IPN_URL'),
        'init_url' => env('SSLCOMMERZ_INIT_URL', 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'),
        'validation_url' => env('SSLCOMMERZ_VALIDATION_URL', 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'),
    ],
    'recaptcha' => [
        'site_key' => env('RECAPTCHA_SITE_KEY'),
        'secret_key' => env('RECAPTCHA_SECRET_KEY'),
    ],
];
