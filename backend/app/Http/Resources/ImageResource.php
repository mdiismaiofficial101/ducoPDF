<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'filename' => $this->filename,
            'original_filename' => $this->original_filename,
            'url' => $this->url,
            'thumbnail_url' => $this->thumbnail_url,
            'webp_url' => $this->webp_url,
            'file_size' => $this->file_size,
            'file_size_formatted' => $this->size_for_humans,
            'width' => $this->width,
            'height' => $this->height,
            'mime_type' => $this->mime_type,
            'collection' => $this->collection,
            'created_at' => $this->created_at,
        ];
    }
}
