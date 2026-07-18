<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

class AuditService
{
    public function log(
        string $action,
        ?Model $model = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?array $meta = null
    ): AuditLog {
        return AuditLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'model_type' => $model ? get_class($model) : null,
            'model_id' => $model?->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'meta' => $meta,
        ]);
    }

    public function logLogin(int $userId, bool $success = true): void
    {
        $this->log(
            $success ? 'login_success' : 'login_failed',
            null,
            null,
            null,
            ['user_id' => $userId]
        );
    }

    public function logLogout(): void
    {
        $this->log('logout');
    }

    public function logModelCreated(Model $model, array $data = []): void
    {
        $this->log('created', $model, null, $data);
    }

    public function logModelUpdated(Model $model, array $oldValues, array $newValues): void
    {
        $this->log('updated', $model, $oldValues, $newValues);
    }

    public function logModelDeleted(Model $model): void
    {
        $this->log('deleted', $model, $model->toArray());
    }

    public function logPayment(string $action, array $data = []): void
    {
        $this->log("payment_{$action}", null, null, null, $data);
    }

    public function logSubscription(string $action, array $data = []): void
    {
        $this->log("subscription_{$action}", null, null, null, $data);
    }
}
