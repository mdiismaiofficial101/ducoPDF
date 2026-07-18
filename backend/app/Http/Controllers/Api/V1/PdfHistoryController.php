<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PdfHistoryResource;
use App\Models\PdfHistory;
use App\Services\PdfHistoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PdfHistoryController extends Controller
{
    protected PdfHistoryService $pdfHistoryService;

    public function __construct(PdfHistoryService $pdfHistoryService)
    {
        $this->pdfHistoryService = $pdfHistoryService;
    }

    public function index(Request $request): JsonResponse
    {
        $histories = PdfHistory::byUser($request->user()->id)
            ->latest()
            ->paginate(config('docupdf.page_size', 20));

        return response()->json([
            'histories' => PdfHistoryResource::collection($histories),
            'meta' => [
                'current_page' => $histories->currentPage(),
                'last_page' => $histories->lastPage(),
                'per_page' => $histories->perPage(),
                'total' => $histories->total(),
            ],
        ]);
    }

    public function show(Request $request, PdfHistory $pdfHistory): JsonResponse
    {
        if ($pdfHistory->user_id !== $request->user()->id) {
            return response()->json(['message' => __('Forbidden')], 403);
        }

        return response()->json([
            'history' => new PdfHistoryResource($pdfHistory->load('files')),
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $stats = $this->pdfHistoryService->getUserStats($request->user()->id);

        return response()->json([
            'stats' => $stats,
        ]);
    }

    public function toolStats(Request $request, string $tool): JsonResponse
    {
        $stats = $this->pdfHistoryService->getToolStats($tool);

        return response()->json([
            'tool' => $tool,
            'stats' => $stats,
        ]);
    }

    public function destroy(Request $request, PdfHistory $pdfHistory): JsonResponse
    {
        if ($pdfHistory->user_id !== $request->user()->id && !$request->user()->hasRole('admin')) {
            return response()->json(['message' => __('Forbidden')], 403);
        }

        $pdfHistory->delete();

        return response()->json([
            'message' => __('History deleted'),
        ]);
    }

    public function clearAll(Request $request): JsonResponse
    {
        PdfHistory::byUser($request->user()->id)->delete();

        return response()->json([
            'message' => __('All history cleared'),
        ]);
    }
}
