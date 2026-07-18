<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'site_name', 'value' => 'DocuPDF', 'type' => 'string', 'group' => 'general', 'is_public' => true],
            ['key' => 'site_description', 'value' => 'Free Online PDF Tools - Merge, Split, Compress, Convert PDF files', 'type' => 'string', 'group' => 'general', 'is_public' => true],
            ['key' => 'site_keywords', 'value' => 'PDF tools, merge PDF, split PDF, compress PDF, convert PDF', 'type' => 'string', 'group' => 'seo', 'is_public' => true],
            ['key' => 'footer_text', 'value' => '© ' . date('Y') . ' DocuPDF. All rights reserved.', 'type' => 'string', 'group' => 'general', 'is_public' => true],
            ['key' => 'contact_email', 'value' => 'contact@docupdf.com', 'type' => 'string', 'group' => 'contact', 'is_public' => true],
            ['key' => 'max_file_size', 'value' => '20', 'type' => 'integer', 'group' => 'limits', 'is_public' => false],
            ['key' => 'free_daily_limit', 'value' => '5', 'type' => 'integer', 'group' => 'limits', 'is_public' => false],
            ['key' => 'maintenance_mode', 'value' => 'false', 'type' => 'boolean', 'group' => 'general', 'is_public' => false],
            ['key' => 'google_analytics_id', 'value' => '', 'type' => 'string', 'group' => 'analytics', 'is_public' => false],
            ['key' => 'social_links', 'value' => json_encode([
                'facebook' => 'https://facebook.com/docupdf',
                'twitter' => 'https://twitter.com/docupdf',
                'linkedin' => 'https://linkedin.com/company/docupdf',
            ]), 'type' => 'json', 'group' => 'social', 'is_public' => true],
        ];

        foreach ($settings as $setting) {
            Setting::create($setting);
        }
    }
}
