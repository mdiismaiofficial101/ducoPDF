<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

class SubscriptionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'plan' => fake()->randomElement(['free', 'pro_monthly', 'pro_yearly']),
            'status' => 'active',
            'starts_at' => now(),
            'expires_at' => now()->addMonth(),
            'amount' => fake()->randomElement([0, 499, 4999]),
            'currency' => 'BDT',
        ];
    }

    public function free(): static
    {
        return $this->state(fn(array $attributes) => [
            'plan' => 'free',
            'amount' => 0,
            'expires_at' => null,
        ]);
    }

    public function pro(): static
    {
        return $this->state(fn(array $attributes) => [
            'plan' => 'pro_monthly',
            'amount' => 499,
        ]);
    }
}
