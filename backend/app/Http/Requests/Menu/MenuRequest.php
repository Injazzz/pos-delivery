<?php

namespace App\Http\Requests\Menu;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'             => ['required', 'string', 'max:150'],
            'description'      => ['nullable', 'string', 'max:1000'],
            'price'            => ['required', 'numeric', 'min:0'],
            'category'         => ['required', 'string', 'max:100'],
            'is_available'     => ['boolean'],
            'stock'            => ['nullable', 'integer', 'min:0'],
            'preparation_time' => ['nullable', 'integer', 'min:1', 'max:120'],
            // images dihandle terpisah via uploadImages endpoint
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'     => 'Nama menu wajib diisi.',
            'price.required'    => 'Harga wajib diisi.',
            'price.min'         => 'Harga tidak boleh negatif.',
            'category.required' => 'Kategori wajib diisi.',
        ];
    }
}
