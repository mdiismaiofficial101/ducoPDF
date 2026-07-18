<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PdfHistory extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'tool',
        'filename',
        'original_filename',
        'file_size',
        'mime_type',
        'status',
        'meta',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'meta' => 'json',
    ];

    const TOOLS = [
        'merge',
        'split',
        'compress',
        'protect',
        'unlock',
        'rotate',
        'watermark',
        'ocr',
        'convert',
        'edit',
        'sign',
        'redact',
        'repair',
        'translate',
        'organize',
        'crop',
        'resize',
        'pdf-to-word',
        'word-to-pdf',
        'pdf-to-excel',
        'excel-to-pdf',
        'pdf-to-jpg',
        'jpg-to-pdf',
        'pdf-to-ppt',
        'ppt-to-pdf',
        'html-to-pdf',
        'pdf-to-markdown',
        'pdf-to-pdfa',
        'scan-to-pdf',
        'delete-pages',
        'page-numbers',
        'password-check',
        'smart-watermark',
        'esignature',
        'summarizer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(PdfFile::class);
    }

    public function scopeByTool($query, $tool)
    {
        return $query->where('tool', $tool);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function getFileSizeForHumansAttribute(): string
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

    public function getToolLabelAttribute(): string
    {
        return ucwords(str_replace(['-', '_'], ' ', $this->tool));
    }
}
