<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;

class ImageService
{
    private ?ImageManager $image;
    private array $thumbSizes;
    private int $quality;
    private int $webpQuality;

    public function __construct()
    {
        if (extension_loaded('gd')) {
            $this->image = new ImageManager(['driver' => 'gd']);
        } else {
            $this->image = null;
        }
        $this->thumbSizes = config('image.templates', [
            'small' => [120, 120],
            'medium' => [400, 300],
            'large' => [1200, 630],
        ]);
        $this->quality = config('image.quality', 80);
        $this->webpQuality = config('image.webp_quality', 75);
    }

    public function upload(UploadedFile $file, string $path = 'uploads/blog', array $options = []): array
    {
        if (!$this->image) {
            throw new \RuntimeException('Image processing requires GD extension');
        }
        $generateWebp = $options['webp'] ?? true;
        $generateThumbnail = $options['thumbnail'] ?? true;
        $resize = $options['resize'] ?? true;
        $maxWidth = $options['max_width'] ?? 1920;
        $maxHeight = $options['max_height'] ?? 1080;

        $originalFilename = $file->getClientOriginalName();
        $filename = $this->generateFilename($file);
        $extension = $file->getClientOriginalExtension();
        $mimeType = $file->getMimeType();

        $fullPath = rtrim($path, '/');
        $this->ensureDirectoryExists($fullPath);

        $image = $this->image->make($file->getRealPath());
        $originalWidth = $image->width();
        $originalHeight = $image->height();

        if ($resize && ($originalWidth > $maxWidth || $originalHeight > $maxHeight)) {
            $image->resize($maxWidth, $maxHeight, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
        }

        $imagePath = "{$fullPath}/{$filename}.{$extension}";
        $image->save(public_path($imagePath), $this->quality);

        $result = [
            'filename' => "{$filename}.{$extension}",
            'original_filename' => $originalFilename,
            'path' => $imagePath,
            'url' => asset($imagePath),
            'file_size' => filesize(public_path($imagePath)),
            'width' => $image->width(),
            'height' => $image->height(),
            'mime_type' => $mimeType,
        ];

        if ($generateWebp && in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'gif'])) {
            $webpPath = "{$fullPath}/{$filename}.webp";
            $webpImage = $this->image->make($file->getRealPath());
            if ($resize && ($originalWidth > $maxWidth || $originalHeight > $maxHeight)) {
                $webpImage->resize($maxWidth, $maxHeight, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
            }
            $webpImage->encode('webp', $this->webpQuality)->save(public_path($webpPath));
            $result['webp_url'] = asset($webpFilename = "{$fullPath}/{$filename}.webp");
            $result['webp_filename'] = "{$filename}.webp";
        }

        if ($generateThumbnail) {
            $thumbFilename = "{$filename}_thumb.{$extension}";
            $thumbPath = "{$fullPath}/{$thumbFilename}";
            $thumbImage = $this->image->make($file->getRealPath());
            $thumbImage->fit($this->thumbSizes['medium'][0], $this->thumbSizes['medium'][1]);
            $thumbImage->save(public_path($thumbPath), $this->quality);
            $result['thumbnail_url'] = asset($thumbPath);
            $result['thumbnail_filename'] = $thumbFilename;
        }

        return $result;
    }

    public function delete(string $path): bool
    {
        $fullPath = public_path($path);
        if (file_exists($fullPath)) {
            return unlink($fullPath);
        }
        return false;
    }

    public function deleteWithVariants(string $path): void
    {
        $info = pathinfo($path);
        $dir = $info['dirname'];
        $filename = $info['filename'];

        $this->delete($path);
        $this->delete("{$dir}/{$filename}_thumb.{$info['extension']}");
        $this->delete("{$dir}/{$filename}.webp");
    }

    public function optimize(UploadedFile $file, int $quality = 80): string
    {
        if (!$this->image) {
            throw new \RuntimeException('Image processing requires GD extension');
        }
        $image = $this->image->make($file->getRealPath());
        $path = $file->getPathname();
        $image->save($path, $quality);
        return $path;
    }

    public function createThumbnail(string $path, int $width = 400, int $height = 300): string
    {
        if (!$this->image) {
            throw new \RuntimeException('Image processing requires GD extension');
        }
        $image = $this->image->make(public_path($path));
        $info = pathinfo($path);
        $thumbPath = "{$info['dirname']}/{$info['filename']}_thumb.{$info['extension']}";
        $image->fit($width, $height);
        $image->save(public_path($thumbPath), $this->quality);
        return $thumbPath;
    }

    private function generateFilename(UploadedFile $file): string
    {
        $timestamp = now()->format('Ymd_His');
        $random = substr(uniqid(), -6);
        $name = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $slug = str($name)->slug('-')->substr(0, 50);
        return "{$timestamp}_{$random}_{$slug}";
    }

    private function ensureDirectoryExists(string $path): void
    {
        $fullPath = public_path($path);
        if (!is_dir($fullPath)) {
            mkdir($fullPath, 0755, true);
        }
    }

    public function getImageDimensions(string $path): array
    {
        $fullPath = public_path($path);
        if (!file_exists($fullPath)) {
            return [0, 0];
        }
        if (!$this->image) {
            return [0, 0];
        }
        $image = $this->image->make($fullPath);
        return [$image->width(), $image->height()];
    }

    public function cleanupUnused(array $usedPaths, string $directory): void
    {
        $files = glob(public_path($directory) . '/*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE);
        foreach ($files as $file) {
            $relativePath = str_replace(public_path(), '', $file);
            if (!in_array($relativePath, $usedPaths)) {
                unlink($file);
            }
        }
    }
}
