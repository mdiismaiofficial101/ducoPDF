<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SSLCommerzService
{
    private string $storeId;
    private string $storePassword;
    private bool $sandbox;
    private string $currency;

    public function __construct()
    {
        $this->storeId = config('services.sslcommerz.store_id');
        $this->storePassword = config('services.sslcommerz.store_password');
        $this->sandbox = config('services.sslcommerz.sandbox', true);
        $this->currency = config('services.sslcommerz.currency', 'BDT');
    }

    public function initiatePayment(User $user, string $plan): array
    {
        $amount = Subscription::PLAN_PRICES[$plan] ?? 0;
        $tranId = 'SSLCZ_' . uniqid() . '_' . time();

        $postData = [
            'store_id' => $this->storeId,
            'store_passwd' => $this->storePassword,
            'total_amount' => $amount,
            'currency' => $this->currency,
            'tran_id' => $tranId,
            'success_url' => config('services.sslcommerz.success_url'),
            'fail_url' => config('services.sslcommerz.fail_url'),
            'cancel_url' => config('services.sslcommerz.cancel_url'),
            'ipn_url' => config('services.sslcommerz.ipn_url'),
            'cus_name' => $user->name,
            'cus_email' => $user->email,
            'cus_phone' => $user->phone ?? 'N/A',
            'cus_add1' => 'N/A',
            'cus_city' => 'N/A',
            'cus_postcode' => 'N/A',
            'cus_country' => 'Bangladesh',
            'shipping_method' => 'NO',
            'num_of_item' => 1,
            'product_name' => $plan,
            'product_category' => 'Subscription',
            'product_profile' => 'general',
        ];

        try {
            $response = Http::asForm()->post($this->getInitUrl(), $postData);

            if ($response->successful()) {
                $data = $response->json();

                if (isset($data['status']) && $data['status'] === 'SUCCESS') {
                    return [
                        'status' => 'success',
                        'session_key' => $data['sessionkey'] ?? null,
                        'gateway_url' => $data['GatewayPageURL'] ?? null,
                        'transaction_id' => $tranId,
                        'amount' => $amount,
                    ];
                }

                Log::error('SSLCommerz initiation failed', ['response' => $data]);
                return [
                    'status' => 'failed',
                    'message' => $data['failedreason'] ?? 'Payment initiation failed',
                ];
            }

            Log::error('SSLCommerz HTTP error', ['status' => $response->status()]);
            return [
                'status' => 'error',
                'message' => 'Payment gateway communication failed',
            ];
        } catch (\Exception $e) {
            Log::error('SSLCommerz exception', ['error' => $e->getMessage()]);
            return [
                'status' => 'error',
                'message' => 'Payment gateway error: ' . $e->getMessage(),
            ];
        }
    }

    public function validatePayment(array $requestData): array
    {
        $validationUrl = $this->getValidationUrl() . '?val_id=' . ($requestData['val_id'] ?? '') . '&store_id=' . $this->storeId . '&store_passwd=' . $this->storePassword . '&v=1&format=json';

        try {
            $response = Http::get($validationUrl);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'status' => $data['status'] ?? 'FAILED',
                    'data' => $data,
                ];
            }

            return [
                'status' => 'FAILED',
                'message' => 'Validation request failed',
            ];
        } catch (\Exception $e) {
            Log::error('SSLCommerz validation exception', ['error' => $e->getMessage()]);
            return [
                'status' => 'FAILED',
                'message' => $e->getMessage(),
            ];
        }
    }

    public function handleSuccess(array $requestData): array
    {
        $payment = Payment::where('transaction_id', $requestData['tran_id'])->first();

        if (!$payment) {
            return ['status' => 'error', 'message' => 'Transaction not found'];
        }

        if ($payment->isCompleted()) {
            return ['status' => 'success', 'message' => 'Already processed'];
        }

        $validation = $this->validatePayment($requestData);

        if ($validation['status'] === 'VALID' || $validation['status'] === 'VALIDATED') {
            $payment->update([
                'status' => 'completed',
                'paid_at' => now(),
                'gateway_response' => $validation['data'],
            ]);

            $this->activateSubscription($payment);

            return ['status' => 'success', 'message' => 'Payment verified and subscription activated'];
        }

        $payment->update([
            'status' => 'failed',
            'gateway_response' => $validation,
        ]);

        return ['status' => 'failed', 'message' => 'Payment validation failed'];
    }

    public function handleFailure(array $requestData): void
    {
        Payment::where('transaction_id', $requestData['tran_id'] ?? '')
            ->update(['status' => 'failed']);
    }

    public function handleCancel(array $requestData): void
    {
        Payment::where('transaction_id', $requestData['tran_id'] ?? '')
            ->update(['status' => 'cancelled']);
    }

    private function activateSubscription(Payment $payment): void
    {
        $plan = $payment->plan_type;
        $duration = $plan === 'pro_yearly' ? 365 : 30;

        Subscription::updateOrCreate(
            ['user_id' => $payment->user_id, 'plan' => $plan],
            [
                'status' => 'active',
                'starts_at' => now(),
                'expires_at' => now()->addDays($duration),
                'payment_method' => 'sslcommerz',
                'transaction_id' => $payment->transaction_id,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
            ]
        );
    }

    private function getInitUrl(): string
    {
        return config('services.sslcommerz.init_url',
            $this->sandbox
                ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
                : 'https://secure.sslcommerz.com/gwprocess/v4/api.php'
        );
    }

    private function getValidationUrl(): string
    {
        return config('services.sslcommerz.validation_url',
            $this->sandbox
                ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
                : 'https://secure.sslcommerz.com/validator/api/validationserverAPI.php'
        );
    }
}
