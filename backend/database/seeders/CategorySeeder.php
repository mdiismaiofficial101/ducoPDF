<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'PDF Tips & Tricks', 'description' => 'Learn useful PDF tips and tricks', 'color' => '#3B82F6'],
            ['name' => 'Productivity', 'description' => 'Boost your productivity with PDF tools', 'color' => '#10B981'],
            ['name' => 'Tutorials', 'description' => 'Step-by-step PDF tutorials', 'color' => '#F59E0B'],
            ['name' => 'News & Updates', 'description' => 'Latest news and product updates', 'color' => '#EF4444'],
            ['name' => 'Business', 'description' => 'PDF solutions for business', 'color' => '#8B5CF6'],
            ['name' => 'Education', 'description' => 'PDF tools for education', 'color' => '#06B6D4'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
