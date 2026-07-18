<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Post;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BlogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_can_view_published_posts()
    {
        $admin = User::factory()->admin()->create();
        $admin->assignRole('admin');

        $category = Category::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $admin->id,
            'category_id' => $category->id,
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/blog/posts');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'posts',
                'meta',
            ]);
    }

    public function test_cannot_view_draft_posts()
    {
        $admin = User::factory()->admin()->create();
        $admin->assignRole('admin');

        $post = Post::factory()->draft()->create([
            'user_id' => $admin->id,
        ]);

        $response = $this->getJson("/api/v1/blog/posts/{$post->slug}");

        $response->assertStatus(404);
    }

    public function test_can_view_categories()
    {
        Category::factory(3)->create();

        $response = $this->getJson('/api/v1/categories');

        $response->assertStatus(200)
            ->assertJsonStructure(['categories']);
    }

    public function test_admin_can_create_post()
    {
        $admin = User::factory()->admin()->create();
        $admin->assignRole('admin');
        $token = $admin->createToken('test')->plainTextToken;

        $category = Category::factory()->create();

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/admin/posts', [
                'title' => 'Test Post Title',
                'content' => 'This is the content of the test post.',
                'category_id' => $category->id,
                'status' => 'published',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'post']);
    }
}
