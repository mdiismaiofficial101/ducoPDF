<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'plan' => $this->plan,
            'plan_label' => $this->plan_label,
            'status' => $this->status,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'starts_at' => $this->starts_at,
            'expires_at' => $this->expires_at,
            'trial_ends_at' => $this->trial_ends_at,
            'days_remaining' => $this->days_remaining,
            'is_active' => $this->isActive(),
            'is_expired' => $this->isExpired(),
            'is_on_trial' => $this->isOnTrial(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
