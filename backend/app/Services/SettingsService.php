<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class SettingsService
{
    private string $cacheKey = 'app_settings';

    public function get(string $key, $default = null): mixed
    {
        return Setting::getValue($key, $default);
    }

    public function set(string $key, mixed $value, string $type = 'string', string $group = 'general', bool $isPublic = false): void
    {
        Setting::setValue($key, $value, $type, $group, $isPublic);
        Cache::forget($this->cacheKey);
    }

    public function getAll(): array
    {
        return Cache::rememberForever($this->cacheKey, function () {
            return Setting::all()
                ->groupBy('group')
                ->map(function ($settings) {
                    return $settings->mapWithKeys(function ($setting) {
                        return [$setting['key'] => $this->castValue($setting)];
                    });
                })
                ->toArray();
        });
    }

    public function getPublic(): array
    {
        return Cache::remember('public_settings', 3600, function () {
            return Setting::public()
                ->get()
                ->mapWithKeys(function ($setting) {
                    return [$setting['key'] => $this->castValue($setting)];
                })
                ->toArray();
        });
    }

    public function getByGroup(string $group): array
    {
        return Setting::byGroup($group)
            ->get()
            ->mapWithKeys(function ($setting) {
                return [$setting['key'] => $this->castValue($setting)];
            })
            ->toArray();
    }

    public function delete(string $key): bool
    {
        $result = Setting::where('key', $key)->delete();
        Cache::forget($this->cacheKey);
        return $result;
    }

    public function has(string $key): bool
    {
        return Setting::where('key', $key)->exists();
    }

    private function castValue(Setting $setting): mixed
    {
        return match($setting->type) {
            'boolean' => (bool) $setting->value,
            'integer' => (int) $setting->value,
            'float' => (float) $setting->value,
            'json', 'array' => json_decode($setting->value, true),
            default => $setting->value,
        };
    }
}
