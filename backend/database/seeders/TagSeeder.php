<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tag;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            'PDF', 'Merge', 'Split', 'Compress', 'Protect',
            'Convert', 'Edit', 'OCR', 'Watermark', 'eSignature',
            'Tutorial', 'Guide', 'Tips', 'Productivity', 'Business',
        ];

        foreach ($tags as $tag) {
            Tag::create(['name' => $tag]);
        }
    }
}
