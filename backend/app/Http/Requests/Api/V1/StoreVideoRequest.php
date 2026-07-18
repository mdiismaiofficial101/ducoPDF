<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreVideoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        $rules = [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'type' => ['required', 'in:youtube,vimeo,upload'],
            'is_featured' => ['boolean'],
        ];

        if ($this->type === 'upload') {
            $rules['video'] = ['required', 'file', 'mimes:mp4,webm,ogg', 'max:102400'];
        } else {
            $rules['url'] = ['required', 'url', 'max:500'];
            $rules['video_id'] = ['nullable', 'string', 'max:255'];
        }

        return $rules;
    }
}
