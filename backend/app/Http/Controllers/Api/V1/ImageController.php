<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreImageRequest;
use App\Http\Resources\ImageResource;
use App\Models\Image;
use App\Services\AuditService;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ImageController extends Controller
{
    protected ImageService $imageService;
    protected AuditService $auditService;

    public function __construct(ImageService $imageService, AuditService $auditService)
    {
        $this->imageService = $imageService;
        $this->auditService = $auditService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Image::query();

        if ($request->collection) {
            $query->byCollection($request->collection);
        }

        if (!$request->user()->hasRole('admin')) {
            $query->where('user_id', $request->user()->id);
        }

        $images = $query->latest()->paginate(config('docupdf.page_size', 20));

        return response()->json([
            'images' => ImageResource::collection($images),
            'meta' => [
                'current_page' => $images->currentPage(),
                'last_page' => $images->lastPage(),
                'per_page' => $images->perPage(),
                'total' => $images->total(),
            ],
        ]);
    }

    public function store(StoreImageRequest $request): JsonResponse
    {
        $collection = $request->collection ?? 'default';
        $path = "uploads/{$collection}";

        $result = $this->imageService->upload(
            $request->file('image'),
            $path,
            [
                'webp' => $collection !== 'avatar',
                'thumbnail' => $collection === 'blog',
                'resize' => true,
            ]
        );

        $image = Image::create([
            'user_id' => $request->user()->id,
            'filename' => $result['filename'],
            'original_filename' => $result['original_filename'],
            'path' => $result['path'],
            'url' => $result['url'],
            'thumbnail_url' => $result['thumbnail_url'] ?? null,
            'webp_url' => $result['webp_url'] ?? null,
            'file_size' => $result['file_size'],
            'width' => $result['width'],
            'height' => $result['height'],
            'mime_type' => $result['mime_type'],
            'disk' => 'uploads',
            'collection' => $collection,
        ]);

        $this->auditService->logModelCreated($image);

        return response()->json([
            'message' => __('Image uploaded'),
            'image' => new ImageResource($image),
        ], 201);
    }

    public function show(Image $image): JsonResponse
    {
        return response()->json([
            'image' => new ImageResource($image),
        ]);
    }

    public function destroy(Request $request, Image $image): JsonResponse
    {
        if (!$request->user()->hasRole('admin') && $image->user_id !== $request->user()->id) {
            return response()->json(['message' => __('Forbidden')], 403);
        }

        $this->imageService->deleteWithVariants($image->path);
        $image->delete();

        $this->auditService->logModelDeleted($image);

        return response()->json([
            'message' => __('Image deleted'),
        ]);
    }
}
