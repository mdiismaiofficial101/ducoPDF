<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StorePostRequest;
use App\Http\Requests\Api\V1\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Services\AuditService;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    protected AuditService $auditService;
    protected ImageService $imageService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Post::with(['user', 'category', 'tags']);

        if ($request->user() && $request->user()->hasRole('admin')) {
            if ($request->status) {
                $query->where('status', $request->status);
            }
        } else {
            $query->published();
        }

        if ($request->category) {
            $query->byCategory($request->category);
        }

        if ($request->tag) {
            $query->whereHas('tags', fn($q) => $q->where('slug', $request->tag));
        }

        if ($request->search) {
            $query->search($request->search);
        }

        if ($request->featured) {
            $query->featured();
        }

        $posts = $query->latest('published_at')
            ->paginate(config('docupdf.page_size', 20));

        return response()->json([
            'posts' => PostResource::collection($posts),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    public function show(Request $request, Post $post): JsonResponse
    {
        if (!$post->isPublished() && (!$request->user() || !$request->user()->hasRole('admin'))) {
            return response()->json(['message' => __('Not found')], 404);
        }

        if ($post->isPublished()) {
            $post->increment('view_count');
        }

        return response()->json([
            'post' => new PostResource($post->load(['user', 'category', 'tags'])),
        ]);
    }

    public function showBySlug(Request $request, string $slug): JsonResponse
    {
        $post = Post::where('slug', $slug)->firstOrFail();

        if (!$post->isPublished() && (!$request->user() || !$request->user()->hasRole('admin'))) {
            return response()->json(['message' => __('Not found')], 404);
        }

        $post->increment('view_count');

        return response()->json([
            'post' => new PostResource($post->load(['user', 'category', 'tags'])),
        ]);
    }

    public function store(StorePostRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('featured_image')) {
            $result = $this->imageService->upload(
                $request->file('featured_image'),
                'uploads/blog',
                ['webp' => true, 'thumbnail' => true]
            );
            $data['featured_image'] = $result['filename'];
            if (isset($result['thumbnail_filename'])) {
                $data['thumbnail'] = $result['thumbnail_filename'];
            }
        }

        $data['user_id'] = $request->user()->id;

        if ($data['status'] === 'published' && !isset($data['published_at'])) {
            $data['published_at'] = now();
        }

        $post = Post::create($data);

        if (isset($data['tags'])) {
            $post->tags()->sync($data['tags']);
        }

        $this->auditService->logModelCreated($post, $data);

        return response()->json([
            'message' => __('Post created'),
            'post' => new PostResource($post->load(['user', 'category', 'tags'])),
        ], 201);
    }

    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        $oldData = $post->toArray();
        $data = $request->validated();

        if ($request->hasFile('featured_image')) {
            if ($post->featured_image) {
                $this->imageService->deleteWithVariants("uploads/blog/{$post->featured_image}");
            }
            $result = $this->imageService->upload(
                $request->file('featured_image'),
                'uploads/blog',
                ['webp' => true, 'thumbnail' => true]
            );
            $data['featured_image'] = $result['filename'];
            if (isset($result['thumbnail_filename'])) {
                $data['thumbnail'] = $result['thumbnail_filename'];
            }
        }

        if (isset($data['status']) && $data['status'] === 'published' && !$post->published_at) {
            $data['published_at'] = now();
        }

        $post->update($data);

        if (isset($data['tags'])) {
            $post->tags()->sync($data['tags']);
        }

        $this->auditService->logModelUpdated($post, $oldData, $post->fresh()->toArray());

        return response()->json([
            'message' => __('Post updated'),
            'post' => new PostResource($post->fresh()->load(['user', 'category', 'tags'])),
        ]);
    }

    public function destroy(Request $request, Post $post): JsonResponse
    {
        if ($post->featured_image) {
            $this->imageService->deleteWithVariants("uploads/blog/{$post->featured_image}");
        }

        $post->delete();

        $this->auditService->logModelDeleted($post);

        return response()->json([
            'message' => __('Post deleted'),
        ]);
    }

    public function featured(Request $request): JsonResponse
    {
        $posts = Post::published()
            ->featured()
            ->latest('published_at')
            ->take(6)
            ->get();

        return response()->json([
            'posts' => PostResource::collection($posts),
        ]);
    }

    public function related(Request $request, Post $post): JsonResponse
    {
        $related = Post::published()
            ->where('id', '!=', $post->id)
            ->where(function ($q) use ($post) {
                if ($post->category_id) {
                    $q->where('category_id', $post->category_id);
                }
                $q->orWhereHas('tags', function ($q) use ($post) {
                    $q->whereIn('tags.id', $post->tags->pluck('id'));
                });
            })
            ->latest('published_at')
            ->take(4)
            ->get();

        return response()->json([
            'posts' => PostResource::collection($related),
        ]);
    }
}
