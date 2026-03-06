<?php

namespace App\Http\Requests\Menu;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'             => ['sometimes', 'string', 'max:150'],
            'description'      => ['sometimes', 'nullable', 'string', 'max:1000'],
            'price'            => ['sometimes', 'numeric', 'min:0'],
            'category'         => ['sometimes', 'string', 'max:100'],
            'is_available'     => ['sometimes', 'boolean'],
            'stock'            => ['sometimes', 'nullable', 'integer', 'min:0'],
            'preparation_time' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:120'],
        ];
    }
}
