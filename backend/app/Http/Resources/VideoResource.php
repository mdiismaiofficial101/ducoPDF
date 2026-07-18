<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VideoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'url' => $this->url,
            'embed_url' => $this->embed_url,
            'embed_code' => $this->embed_code,
            'thumbnail_url' => $this->thumbnail_url,
            'duration' => $this->duration,
            'duration_formatted' => $this->duration_formatted,
            'is_featured' => $this->is_featured,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
