<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PdfFile extends Model
{
    protected $fillable = [
        'pdf_history_id',
        'disk',
        'path',
        'filename',
        'file_size',
        'mime_type',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function pdfHistory(): BelongsTo
    {
        return $this->belongsTo(PdfHistory::class);
    }
}
