<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreVideoRequest;
use App\Http\Resources\VideoResource;
use App\Models\Video;
use App\Services\AuditService;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    protected AuditService $auditService;
    protected ImageService $imageService;

    public function __construct(AuditService $auditService, ImageService $imageService)
    {
        $this->auditService = $auditService;
        $this->imageService = $imageService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Video::query();

        if ($request->type) {
            $query->ofType($request->type);
        }

        if (!$request->user() || !$request->user()->hasRole('admin')) {
            $query->active();
        }

        if ($request->featured) {
            $query->featured();
        }

        $videos = $query->latest()->paginate(config('docupdf.page_size', 20));

        return response()->json([
            'videos' => VideoResource::collection($videos),
            'meta' => [
                'current_page' => $videos->currentPage(),
                'last_page' => $videos->lastPage(),
                'per_page' => $videos->perPage(),
                'total' => $videos->total(),
            ],
        ]);
    }

    public function store(StoreVideoRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        if ($request->type === 'upload' && $request->hasFile('video')) {
            $file = $request->file('video');
            $filename = $this->generateVideoFilename($file);
            $path = "uploads/videos/" . now()->format('Y/m/d');
            $file->move(public_path($path), $filename);

            $data['url'] = "{$path}/{$filename}";
            $data['filename'] = $filename;
            $data['file_size'] = $file->getSize();
            $data['mime_type'] = $file->getMimeType();
        }

        if ($request->type === 'youtube' && empty($data['video_id'])) {
            $data['video_id'] = $this->extractYouTubeId($data['url']);
        }

        if ($request->type === 'vimeo' && empty($data['video_id'])) {
            $data['video_id'] = $this->extractVimeoId($data['url']);
        }

        $video = Video::create($data);

        $this->auditService->logModelCreated($video);

        return response()->json([
            'message' => __('Video created'),
            'video' => new VideoResource($video),
        ], 201);
    }

    public function show(Video $video): JsonResponse
    {
        return response()->json([
            'video' => new VideoResource($video),
        ]);
    }

    public function update(Request $request, Video $video): JsonResponse
    {
        $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_featured' => ['boolean'],
            'status' => ['sometimes', 'in:active,inactive'],
        ]);

        $oldData = $video->toArray();
        $video->update($request->only(['title', 'description', 'is_featured', 'status']));

        $this->auditService->logModelUpdated($video, $oldData, $video->toArray());

        return response()->json([
            'message' => __('Video updated'),
            'video' => new VideoResource($video),
        ]);
    }

    public function destroy(Request $request, Video $video): JsonResponse
    {
        if ($video->type === 'upload' && $video->filename) {
            $filePath = public_path($video->url);
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }

        $video->delete();

        $this->auditService->logModelDeleted($video);

        return response()->json([
            'message' => __('Video deleted'),
        ]);
    }

    private function generateVideoFilename($file): string
    {
        $timestamp = now()->format('Ymd_His');
        $random = substr(uniqid(), -6);
        $extension = $file->getClientOriginalExtension();
        return "{$timestamp}_{$random}.{$extension}";
    }

    private function extractYouTubeId(string $url): ?string
    {
        preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/', $url, $matches);
        return $matches[1] ?? null;
    }

    private function extractVimeoId(string $url): ?string
    {
        preg_match('/vimeo\.com\/(?:video\/)?(\d+)/', $url, $matches);
        return $matches[1] ?? null;
    }
}
