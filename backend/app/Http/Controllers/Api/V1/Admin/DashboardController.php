<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\PdfHistoryResource;
use App\Http\Resources\UserResource;
use App\Models\Payment;
use App\Models\PdfHistory;
use App\Models\Post;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    protected AuditService $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    public function index(): JsonResponse
    {
        $totalUsers = User::count();
        $totalPosts = Post::count();
        $totalPayments = Payment::completed()->sum('amount');
        $totalOperations = PdfHistory::count();
        $activeSubscriptions = \App\Models\Subscription::active()->count();

        $recentUsers = User::latest()->take(5)->get();
        $recentOperations = PdfHistory::latest()->take(10)->get();

        $monthlyRevenue = Payment::completed()
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount');

        $userGrowth = User::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'total_posts' => $totalPosts,
                'total_revenue' => $totalPayments,
                'total_operations' => $totalOperations,
                'active_subscriptions' => $activeSubscriptions,
                'monthly_revenue' => $monthlyRevenue,
                'user_growth' => $userGrowth,
            ],
            'recent_users' => UserResource::collection($recentUsers),
            'recent_operations' => PdfHistoryResource::collection($recentOperations),
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        if ($request->role) {
            $query->role($request->role);
        }

        if ($request->trashed) {
            $query->onlyTrashed();
        }

        $users = $query->latest()->paginate(config('docupdf.page_size', 20));

        return response()->json([
            'users' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function userShow(User $user): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($user->load(['subscription', 'payments', 'pdfHistories'])),
        ]);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'unique:users,email,' . $user->id],
            'role' => ['sometimes', 'exists:roles,name'],
        ]);

        $oldData = $user->toArray();

        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        $user->save();

        if ($request->has('role')) {
            $user->syncRoles([$request->role]);
        }

        $this->auditService->logModelUpdated($user, $oldData, $user->toArray());

        return response()->json([
            'message' => __('User updated'),
            'user' => new UserResource($user->fresh()),
        ]);
    }

    public function deleteUser(User $user): JsonResponse
    {
        $user->delete();

        $this->auditService->logModelDeleted($user);

        return response()->json([
            'message' => __('User deleted'),
        ]);
    }

    public function payments(Request $request): JsonResponse
    {
        $query = Payment::with('user');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->date_from) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->where('created_at', '<=', $request->date_to);
        }

        $payments = $query->latest()->paginate(config('docupdf.page_size', 20));

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

    public function analytics(Request $request): JsonResponse
    {
        $days = $request->days ?? 30;
        $startDate = now()->subDays($days);

        $revenue = Payment::completed()
            ->where('paid_at', '>=', $startDate)
            ->selectRaw('DATE(paid_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $users = User::where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $operations = PdfHistory::where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $popularTools = PdfHistory::where('created_at', '>=', $startDate)
            ->selectRaw('tool, COUNT(*) as total')
            ->groupBy('tool')
            ->orderByDesc('total')
            ->take(10)
            ->get();

        return response()->json([
            'revenue' => $revenue,
            'users' => $users,
            'operations' => $operations,
            'popular_tools' => $popularTools,
            'period_days' => $days,
        ]);
    }
}
