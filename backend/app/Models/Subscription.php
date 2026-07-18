<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'plan',
        'status',
        'starts_at',
        'expires_at',
        'trial_ends_at',
        'payment_method',
        'transaction_id',
        'amount',
        'currency',
        'meta',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'amount' => 'decimal:2',
        'meta' => 'json',
    ];

    const PLANS = [
        'free' => 0,
        'pro_monthly' => 1,
        'pro_yearly' => 2,
    ];

    const PLAN_PRICES = [
        'free' => 0,
        'pro_monthly' => 499,
        'pro_yearly' => 4999,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function isActive(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        if ($this->plan === 'free') {
            return true;
        }

        return $this->expires_at && $this->expires_at->isFuture();
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isOnTrial(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    public function daysRemaining(): int
    {
        if (!$this->expires_at) {
            return 0;
        }
        return max(0, now()->diffInDays($this->expires_at, false));
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByPlan($query, $plan)
    {
        return $query->where('plan', $plan);
    }

    public function scopeExpiringSoon($query, $days = 7)
    {
        return $query->where('status', 'active')
            ->where('plan', '!=', 'free')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now()->addDays($days));
    }

    public function getPriceAttribute(): int
    {
        return self::PLAN_PRICES[$this->plan] ?? 0;
    }

    public function getPlanLabelAttribute(): string
    {
        return match($this->plan) {
            'free' => 'Free',
            'pro_monthly' => 'Pro Monthly',
            'pro_yearly' => 'Pro Yearly',
            default => ucfirst($this->plan),
        };
    }
}
