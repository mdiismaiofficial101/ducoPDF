<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreTagRequest;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    protected AuditService $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    public function index(Request $request): JsonResponse
    {
        $tags = Tag::popular()->get();

        return response()->json([
            'tags' => TagResource::collection($tags),
        ]);
    }

    public function show(Tag $tag): JsonResponse
    {
        return response()->json([
            'tag' => new TagResource($tag->loadCount('posts')),
        ]);
    }

    public function store(StoreTagRequest $request): JsonResponse
    {
        $tag = Tag::create($request->validated());

        $this->auditService->logModelCreated($tag);

        return response()->json([
            'message' => __('Tag created'),
            'tag' => new TagResource($tag),
        ], 201);
    }

    public function update(Request $request, Tag $tag): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:tags,name,' . $tag->id],
        ]);

        $oldData = $tag->toArray();
        $tag->update($request->only('name'));

        $this->auditService->logModelUpdated($tag, $oldData, $tag->toArray());

        return response()->json([
            'message' => __('Tag updated'),
            'tag' => new TagResource($tag),
        ]);
    }

    public function destroy(Request $request, Tag $tag): JsonResponse
    {
        $tag->delete();

        $this->auditService->logModelDeleted($tag);

        return response()->json([
            'message' => __('Tag deleted'),
        ]);
    }
}
