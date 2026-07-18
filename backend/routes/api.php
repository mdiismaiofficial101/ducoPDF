<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\SubscriptionController;
use App\Http\Controllers\Api\V1\PdfHistoryController;
use App\Http\Controllers\Api\V1\BlogController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\TagController;
use App\Http\Controllers\Api\V1\ImageController;
use App\Http\Controllers\Api\V1\VideoController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\SettingsController;
use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;

Route::prefix('v1')->group(function () {

    // Health check
    Route::get('health', function () {
        return response()->json([
            'status' => 'ok',
            'version' => '1.0.0',
            'timestamp' => now(),
        ]);
    });

    // Public routes
    Route::get('plans', [SubscriptionController::class, 'plans']);
    Route::get('blog/posts', [BlogController::class, 'index']);
    Route::get('blog/posts/featured', [BlogController::class, 'featured']);
    Route::get('blog/posts/{post:slug}', [BlogController::class, 'showBySlug']);
    Route::get('blog/posts/{post}', [BlogController::class, 'show']);
    Route::get('blog/posts/{post}/related', [BlogController::class, 'related']);
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{category:slug}', [CategoryController::class, 'showBySlug']);
    Route::get('categories/{category}', [CategoryController::class, 'show']);
    Route::get('tags', [TagController::class, 'index']);
    Route::get('tags/{tag}', [TagController::class, 'show']);
    Route::get('videos', [VideoController::class, 'index']);
    Route::get('videos/{video}', [VideoController::class, 'show']);

    // Auth routes
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('auth/reset-password', [AuthController::class, 'resetPassword']);

    // Payment webhooks (no auth)
    Route::post('payments/success', [SubscriptionController::class, 'paymentSuccess']);
    Route::post('payments/failure', [SubscriptionController::class, 'paymentFailure']);
    Route::post('payments/cancel', [SubscriptionController::class, 'paymentCancel']);

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        // Auth
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/user', [AuthController::class, 'user']);
        Route::post('auth/email/verify', [AuthController::class, 'verifyEmail']);
        Route::post('auth/email/resend', [AuthController::class, 'resendVerification']);

        // Profile
        Route::get('profile', [ProfileController::class, 'show']);
        Route::put('profile', [ProfileController::class, 'update']);
        Route::post('profile/avatar', [ProfileController::class, 'uploadAvatar']);
        Route::delete('profile', [ProfileController::class, 'destroy']);

        // Subscriptions
        Route::get('subscription', [SubscriptionController::class, 'current']);
        Route::post('subscription/initiate', [SubscriptionController::class, 'initiatePayment']);
        Route::get('subscription/history', [SubscriptionController::class, 'history']);
        Route::post('subscription/cancel', [SubscriptionController::class, 'cancelSubscription']);

        // PDF History
        Route::get('pdf-history', [PdfHistoryController::class, 'index']);
        Route::get('pdf-history/stats', [PdfHistoryController::class, 'stats']);
        Route::get('pdf-history/tool/{tool}', [PdfHistoryController::class, 'toolStats']);
        Route::get('pdf-history/{pdfHistory}', [PdfHistoryController::class, 'show']);
        Route::delete('pdf-history/{pdfHistory}', [PdfHistoryController::class, 'destroy']);
        Route::delete('pdf-history', [PdfHistoryController::class, 'clearAll']);

        // Images
        Route::get('images', [ImageController::class, 'index']);
        Route::post('images', [ImageController::class, 'store']);
        Route::get('images/{image}', [ImageController::class, 'show']);
        Route::delete('images/{image}', [ImageController::class, 'destroy']);

        // Admin routes
        Route::prefix('admin')->middleware(['role:admin'])->group(function () {
            Route::get('dashboard', [DashboardController::class, 'index']);
            Route::get('users', [DashboardController::class, 'users']);
            Route::get('users/{user}', [DashboardController::class, 'userShow']);
            Route::put('users/{user}', [DashboardController::class, 'updateUser']);
            Route::delete('users/{user}', [DashboardController::class, 'deleteUser']);
            Route::get('payments', [DashboardController::class, 'payments']);
            Route::get('analytics', [DashboardController::class, 'analytics']);

            // Blog management
            Route::apiResource('posts', BlogController::class)->except(['index', 'show']);
            Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
            Route::apiResource('tags', TagController::class)->except(['index', 'show']);
            Route::apiResource('videos', VideoController::class)->except(['index', 'show']);

            // Settings
            Route::get('settings', [SettingsController::class, 'index']);
            Route::get('settings/{key}', [SettingsController::class, 'show']);
            Route::get('settings/group/{group}', [SettingsController::class, 'getByGroup']);
            Route::put('settings', [SettingsController::class, 'update']);
            Route::delete('settings/{key}', [SettingsController::class, 'destroy']);
        });
    });
});
