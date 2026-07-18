<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Video extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'type',
        'url',
        'embed_url',
        'video_id',
        'thumbnail_url',
        'filename',
        'file_size',
        'mime_type',
        'duration',
        'status',
        'is_featured',
        'meta',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'duration' => 'integer',
        'is_featured' => 'boolean',
        'meta' => 'json',
    ];

    const TYPES = ['youtube', 'vimeo', 'upload'];
    const STATUSES = ['active', 'inactive', 'processing', 'failed'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function getEmbedCodeAttribute(): ?string
    {
        return match($this->type) {
            'youtube' => $this->getYouTubeEmbedCode(),
            'vimeo' => $this->getVimeoEmbedCode(),
            'upload' => $this->getUploadEmbedCode(),
            default => null,
        };
    }

    private function getYouTubeEmbedCode(): string
    {
        $videoId = $this->video_id ?: $this->getYouTubeIdFromUrl();
        if (!$videoId) {
            return '';
        }
        return '<iframe width="560" height="315" src="https://www.youtube.com/embed/' . $videoId . '" frameborder="0" allowfullscreen></iframe>';
    }

    private function getVimeoEmbedCode(): string
    {
        $videoId = $this->video_id ?: $this->getVimeoIdFromUrl();
        if (!$videoId) {
            return '';
        }
        return '<iframe src="https://player.vimeo.com/video/' . $videoId . '" width="560" height="315" frameborder="0" allowfullscreen></iframe>';
    }

    private function getUploadEmbedCode(): string
    {
        if (!$this->url) {
            return '';
        }
        return '<video width="560" height="315" controls><source src="' . asset($this->url) . '" type="' . $this->mime_type . '"></video>';
    }

    private function getYouTubeIdFromUrl(): ?string
    {
        preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/', $this->url, $matches);
        return $matches[1] ?? null;
    }

    private function getVimeoIdFromUrl(): ?string
    {
        preg_match('/vimeo\.com\/(?:video\/)?(\d+)/', $this->url, $matches);
        return $matches[1] ?? null;
    }

    public function getDurationFormattedAttribute(): ?string
    {
        if (!$this->duration) {
            return null;
        }
        $hours = floor($this->duration / 3600);
        $minutes = floor(($this->duration % 3600) / 60);
        $seconds = $this->duration % 60;

        if ($hours > 0) {
            return sprintf('%d:%02d:%02d', $hours, $minutes, $seconds);
        }
        return sprintf('%d:%02d', $minutes, $seconds);
    }
}
