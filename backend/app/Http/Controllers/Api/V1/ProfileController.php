<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\AuditService;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    protected AuditService $auditService;
    protected ImageService $imageService;

    public function __construct(AuditService $auditService, ImageService $imageService)
    {
        $this->auditService = $auditService;
        $this->imageService = $imageService;
    }

    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()->load('subscription')),
        ]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $oldData = $user->toArray();

        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                $this->imageService->delete("uploads/avatars/{$user->avatar}");
            }
            $result = $this->imageService->upload(
                $request->file('avatar'),
                'uploads/avatars',
                ['thumbnail' => false, 'webp' => false, 'resize' => true, 'max_width' => 300, 'max_height' => 300]
            );
            $data['avatar'] = $result['filename'];
        }

        unset($data['avatar']);
        if (isset($result)) {
            $data['avatar'] = $result['filename'];
        }

        if (isset($data['current_password'])) {
            unset($data['current_password']);
        }

        $user->update($data);

        $this->auditService->logModelUpdated($user, $oldData, $user->toArray());

        return response()->json([
            'message' => __('Profile updated successfully'),
            'user' => new UserResource($user->fresh()),
        ]);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,gif,webp', 'max:2048'],
        ]);

        $user = $request->user();

        if ($user->avatar) {
            $this->imageService->delete("uploads/avatars/{$user->avatar}");
        }

        $result = $this->imageService->upload(
            $request->file('avatar'),
            'uploads/avatars',
            ['thumbnail' => false, 'webp' => false, 'resize' => true, 'max_width' => 300, 'max_height' => 300]
        );

        $user->update(['avatar' => $result['filename']]);

        return response()->json([
            'message' => __('Avatar uploaded successfully'),
            'avatar_url' => $result['url'],
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->tokens()->delete();
        $user->delete();

        $this->auditService->logModelDeleted($user);

        return response()->json([
            'message' => __('Account deleted successfully'),
        ]);
    }
}
