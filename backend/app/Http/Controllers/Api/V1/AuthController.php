<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\RegisterRequest;
use App\Http\Requests\Api\V1\LoginRequest;
use App\Http\Requests\Api\V1\ForgotPasswordRequest;
use App\Http\Requests\Api\V1\ResetPasswordRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected AuditService $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        $user->assignRole('user');

        $token = $user->createToken('auth_token')->plainTextToken;

        $this->auditService->log('user_registered', $user, null, [
            'email' => $user->email,
        ]);

        return response()->json([
            'message' => __('auth.registration_success'),
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $request->authenticate();

        $user = Auth::user();

        if (!$user->email_verified_at && config('auth.require_email_verification', false)) {
            return response()->json([
                'message' => __('auth.email_not_verified'),
                'requires_verification' => true,
            ], 403);
        }

        $token = $user->createToken('auth_token', ['*'], now()->addDays(30))->plainTextToken;

        $this->auditService->logLogin($user->id);

        return response()->json([
            'message' => __('auth.login_success'),
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        $this->auditService->logLogout();

        return response()->json([
            'message' => __('auth.logout_success'),
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink(
            $request->only('email')
        );

        return response()->json([
            'message' => __($status),
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => __($status),
            ]);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json([
                'message' => __('auth.email_already_verified'),
            ]);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json([
            'message' => __('auth.verification_link_sent'),
        ]);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json([
                'message' => __('auth.email_already_verified'),
            ]);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json([
            'message' => __('auth.verification_link_sent'),
        ]);
    }
}
