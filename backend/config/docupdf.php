<?php

return [
    'page_size' => env('PAGE_SIZE', 20),
    'max_page_size' => env('MAX_PAGE_SIZE', 100),
    'upload_max_size' => env('UPLOAD_MAX_SIZE', 20480),
    'allowed_image_types' => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    'allowed_video_types' => ['mp4', 'webm', 'ogg'],
    'allowed_document_types' => ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
    'thumbnail_width' => 400,
    'thumbnail_height' => 300,
];
