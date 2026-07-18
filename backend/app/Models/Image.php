<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Image extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'filename',
        'original_filename',
        'path',
        'url',
        'thumbnail_url',
        'webp_url',
        'file_size',
        'width',
        'height',
        'mime_type',
        'disk',
        'collection',
        'meta',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'meta' => 'json',
    ];

    const COLLECTIONS = ['default', 'blog', 'avatar', 'thumbnail'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeByCollection($query, $collection)
    {
        return $query->where('collection', $collection);
    }

    public function scopeByMimeType($query, $mimeType)
    {
        return $query->where('mime_type', $mimeType);
    }

    public function getUrlAttribute($value): string
    {
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }
        return asset($value);
    }

    public function getThumbnailUrlAttribute($value): ?string
    {
        if (!$value) {
            return null;
        }
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }
        return asset($value);
    }

    public function getWebpUrlAttribute($value): ?string
    {
        if (!$value) {
            return null;
        }
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }
        return asset($value);
    }

    public function getSizeForHumansAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
