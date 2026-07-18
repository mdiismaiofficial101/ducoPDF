<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SubscriptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_free_subscription_is_active()
    {
        $subscription = Subscription::factory()->free()->make();

        $this->assertTrue($subscription->isActive());
    }

    public function test_expired_subscription_is_not_active()
    {
        $subscription = Subscription::factory()->pro()->make([
            'status' => 'active',
            'expires_at' => now()->subDay(),
        ]);

        $this->assertFalse($subscription->isActive());
    }

    public function test_valid_subscription_is_active()
    {
        $subscription = Subscription::factory()->pro()->make([
            'status' => 'active',
            'expires_at' => now()->addMonth(),
        ]);

        $this->assertTrue($subscription->isActive());
    }

    public function test_cancelled_subscription_is_not_active()
    {
        $subscription = Subscription::factory()->pro()->make([
            'status' => 'cancelled',
            'expires_at' => now()->addMonth(),
        ]);

        $this->assertFalse($subscription->isActive());
    }

    public function test_days_remaining()
    {
        $subscription = Subscription::factory()->make([
            'expires_at' => now()->addDays(10),
        ]);

        $this->assertEquals(10, $subscription->daysRemaining());
    }
}
