<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

class PostFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->sentence(6);

        return [
            'user_id' => User::factory(),
            'title' => $title,
            'content' => fake()->paragraphs(5, true),
            'excerpt' => fake()->paragraph(2),
            'meta_title' => $title,
            'meta_description' => fake()->sentence(15),
            'status' => 'published',
            'published_at' => now()->subHours(fake()->numberBetween(1, 720)),
            'view_count' => fake()->numberBetween(0, 5000),
            'reading_time' => fake()->numberBetween(3, 15) . ' min read',
        ];
    }

    public function draft(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'draft',
            'published_at' => null,
        ]);
    }

    public function scheduled(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'scheduled',
            'scheduled_at' => now()->addDays(7),
            'published_at' => null,
        ]);
    }
}
