<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Post;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@docupdf.com')->first();
        $categories = Category::all();
        $tags = Tag::all();

        $posts = [
            [
                'title' => 'How to Merge PDF Files Online for Free',
                'content' => 'Merging PDF files is a common task that many people need to do...',
                'excerpt' => 'Learn how to combine multiple PDF files into one document quickly and easily with our free online tool.',
                'status' => 'published',
            ],
            [
                'title' => '5 Tips to Compress PDF Size Without Losing Quality',
                'content' => 'Large PDF files can be problematic when sharing via email...',
                'excerpt' => 'Discover effective techniques to reduce PDF file size while maintaining document quality.',
                'status' => 'published',
            ],
            [
                'title' => 'The Ultimate Guide to PDF Security and Protection',
                'content' => 'Protecting your PDF documents is essential in today\'s digital world...',
                'excerpt' => 'Everything you need to know about securing your PDF files with passwords and permissions.',
                'status' => 'published',
            ],
            [
                'title' => 'How to Convert Word to PDF Without Losing Formatting',
                'content' => 'Converting Word documents to PDF format is a common requirement...',
                'excerpt' => 'A comprehensive guide to converting Word documents to PDF while preserving all formatting.',
                'status' => 'published',
            ],
            [
                'title' => 'Top 10 PDF Tools Every Professional Should Know',
                'content' => 'PDF documents are ubiquitous in the professional world...',
                'excerpt' => 'Discover the essential PDF tools that can boost your productivity at work.',
                'status' => 'published',
            ],
            [
                'title' => 'How to Add Watermarks to Your PDF Documents',
                'content' => 'Watermarks are a great way to protect your intellectual property...',
                'excerpt' => 'Learn how to add text and image watermarks to your PDF files for branding and protection.',
                'status' => 'published',
            ],
        ];

        foreach ($posts as $index => $postData) {
            $post = Post::create([
                'user_id' => $admin->id,
                'category_id' => $categories[$index % count($categories)]->id,
                'title' => $postData['title'],
                'content' => $postData['content'] . "\n\n" . fake()->paragraphs(10, true),
                'excerpt' => $postData['excerpt'],
                'meta_title' => $postData['title'],
                'meta_description' => $postData['excerpt'],
                'status' => $postData['status'],
                'published_at' => now()->subDays(count($posts) - $index),
                'view_count' => fake()->numberBetween(100, 5000),
                'reading_time' => fake()->numberBetween(3, 10) . ' min read',
            ]);

            $post->tags()->attach($tags->random(min(3, $tags->count()))->pluck('id')->toArray());
        }
    }
}
