<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\SubscriptionResource;
use App\Models\Payment;
use App\Models\Subscription;
use App\Services\AuditService;
use App\Services\SSLCommerzService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    protected SSLCommerzService $sslCommerz;
    protected AuditService $auditService;

    public function __construct(SSLCommerzService $sslCommerz, AuditService $auditService)
    {
        $this->sslCommerz = $sslCommerz;
        $this->auditService = $auditService;
    }

    public function current(Request $request): JsonResponse
    {
        $subscription = $request->user()->subscription;

        if (!$subscription) {
            $subscription = Subscription::create([
                'user_id' => $request->user()->id,
                'plan' => 'free',
                'status' => 'active',
                'starts_at' => now(),
            ]);
        }

        return response()->json([
            'subscription' => new SubscriptionResource($subscription),
        ]);
    }

    public function plans(): JsonResponse
    {
        return response()->json([
            'plans' => [
                [
                    'id' => 'free',
                    'name' => 'Free',
                    'price' => 0,
                    'currency' => 'BDT',
                    'features' => [
                        'Basic PDF tools',
                        '5 files per day',
                        '5 MB max file size',
                        'Basic support',
                    ],
                ],
                [
                    'id' => 'pro_monthly',
                    'name' => 'Pro Monthly',
                    'price' => 499,
                    'currency' => 'BDT',
                    'duration_days' => 30,
                    'features' => [
                        'All PDF tools',
                        'Unlimited files',
                        '50 MB max file size',
                        'Priority support',
                        'No watermarks',
                        'Advanced features',
                    ],
                ],
                [
                    'id' => 'pro_yearly',
                    'name' => 'Pro Yearly',
                    'price' => 4999,
                    'currency' => 'BDT',
                    'duration_days' => 365,
                    'features' => [
                        'All PDF tools',
                        'Unlimited files',
                        '100 MB max file size',
                        'Priority support',
                        'No watermarks',
                        'Advanced features',
                        'Save 17% vs monthly',
                    ],
                ],
            ],
        ]);
    }

    public function initiatePayment(StorePaymentRequest $request): JsonResponse
    {
        $plan = $request->plan;
        $user = $request->user();

        if (!in_array($plan, ['pro_monthly', 'pro_yearly'])) {
            return response()->json([
                'message' => __('Invalid plan'),
            ], 422);
        }

        $payment = Payment::create([
            'user_id' => $user->id,
            'transaction_id' => 'SSLCZ_' . uniqid() . '_' . time(),
            'amount' => Subscription::PLAN_PRICES[$plan],
            'currency' => 'BDT',
            'payment_method' => 'sslcommerz',
            'status' => 'pending',
            'plan_type' => $plan,
        ]);

        $result = $this->sslCommerz->initiatePayment($user, $plan);

        if ($result['status'] === 'success') {
            $payment->update([
                'transaction_id' => $result['transaction_id'],
                'session_id' => $result['session_key'] ?? null,
            ]);

            $this->auditService->logPayment('initiated', [
                'payment_id' => $payment->id,
                'transaction_id' => $result['transaction_id'],
                'plan' => $plan,
                'amount' => $result['amount'],
            ]);

            return response()->json([
                'message' => __('Payment initiated'),
                'payment' => new PaymentResource($payment),
                'gateway_url' => $result['gateway_url'],
            ]);
        }

        $payment->update(['status' => 'failed']);

        return response()->json([
            'message' => $result['message'] ?? __('Payment initiation failed'),
        ], 422);
    }

    public function paymentSuccess(Request $request): JsonResponse
    {
        $result = $this->sslCommerz->handleSuccess($request->all());

        if ($result['status'] === 'success') {
            $this->auditService->logPayment('completed', $request->all());
            return response()->json([
                'message' => __('Payment successful'),
            ]);
        }

        return response()->json([
            'message' => $result['message'] ?? __('Payment failed'),
        ], 422);
    }

    public function paymentFailure(Request $request): JsonResponse
    {
        $this->sslCommerz->handleFailure($request->all());

        $this->auditService->logPayment('failed', $request->all());

        return response()->json([
            'message' => __('Payment failed'),
        ]);
    }

    public function paymentCancel(Request $request): JsonResponse
    {
        $this->sslCommerz->handleCancel($request->all());

        return response()->json([
            'message' => __('Payment cancelled'),
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $payments = Payment::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(config('docupdf.page_size', 20));

        return response()->json([
            'payments' => PaymentResource::collection($payments),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ],
        ]);
    }

    public function cancelSubscription(Request $request): JsonResponse
    {
        $subscription = $request->user()->subscription;

        if (!$subscription || $subscription->plan === 'free') {
            return response()->json([
                'message' => __('No active subscription to cancel'),
            ], 422);
        }

        $subscription->update([
            'status' => 'cancelled',
            'expires_at' => now(),
        ]);

        Subscription::create([
            'user_id' => $request->user()->id,
            'plan' => 'free',
            'status' => 'active',
            'starts_at' => now(),
        ]);

        $this->auditService->logSubscription('cancelled', [
            'user_id' => $request->user()->id,
            'previous_plan' => $subscription->plan,
        ]);

        return response()->json([
            'message' => __('Subscription cancelled'),
        ]);
    }
}
