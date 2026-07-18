<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreCategoryRequest;
use App\Http\Requests\Api\V1\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    protected AuditService $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    public function index(Request $request): JsonResponse
    {
        $categories = Category::withCount('posts')
            ->active()
            ->get();

        return response()->json([
            'categories' => CategoryResource::collection($categories),
        ]);
    }

    public function show(Category $category): JsonResponse
    {
        return response()->json([
            'category' => new CategoryResource($category->loadCount('posts')),
        ]);
    }

    public function showBySlug(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        return response()->json([
            'category' => new CategoryResource($category->loadCount('posts')),
        ]);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        $this->auditService->logModelCreated($category);

        return response()->json([
            'message' => __('Category created'),
            'category' => new CategoryResource($category),
        ], 201);
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $oldData = $category->toArray();
        $category->update($request->validated());

        $this->auditService->logModelUpdated($category, $oldData, $category->toArray());

        return response()->json([
            'message' => __('Category updated'),
            'category' => new CategoryResource($category),
        ]);
    }

    public function destroy(Request $request, Category $category): JsonResponse
    {
        if ($category->posts()->count() > 0) {
            return response()->json([
                'message' => __('Cannot delete category with posts'),
            ], 422);
        }

        $category->delete();

        $this->auditService->logModelDeleted($category);

        return response()->json([
            'message' => __('Category deleted'),
        ]);
    }
}
