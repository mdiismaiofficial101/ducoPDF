<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,gif,webp,svg', 'max:10240'],
            'collection' => ['nullable', 'string', 'in:default,blog,avatar,thumbnail'],
        ];
    }
}
