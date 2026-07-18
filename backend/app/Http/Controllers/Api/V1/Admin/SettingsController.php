<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\SettingsService;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    protected SettingsService $settingsService;
    protected AuditService $auditService;

    public function __construct(SettingsService $settingsService, AuditService $auditService)
    {
        $this->settingsService = $settingsService;
        $this->auditService = $auditService;
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'settings' => $this->settingsService->getAll(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string'],
            'settings.*.value' => ['nullable'],
            'settings.*.type' => ['sometimes', 'string', 'in:string,boolean,integer,float,json'],
            'settings.*.group' => ['sometimes', 'string'],
            'settings.*.is_public' => ['sometimes', 'boolean'],
        ]);

        foreach ($request->settings as $setting) {
            $this->settingsService->set(
                $setting['key'],
                $setting['value'],
                $setting['type'] ?? 'string',
                $setting['group'] ?? 'general',
                $setting['is_public'] ?? false
            );
        }

        $this->auditService->log('settings_updated', null, null, null, [
            'count' => count($request->settings),
        ]);

        return response()->json([
            'message' => __('Settings updated'),
            'settings' => $this->settingsService->getAll(),
        ]);
    }

    public function show(string $key): JsonResponse
    {
        return response()->json([
            'key' => $key,
            'value' => $this->settingsService->get($key),
        ]);
    }

    public function getByGroup(string $group): JsonResponse
    {
        return response()->json([
            'group' => $group,
            'settings' => $this->settingsService->getByGroup($group),
        ]);
    }

    public function destroy(string $key): JsonResponse
    {
        $this->settingsService->delete($key);

        return response()->json([
            'message' => __('Setting deleted'),
        ]);
    }
}
