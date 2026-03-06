<?php

namespace App\Http\Requests\Menu;

use Illuminate\Foundation\Http\FormRequest;

class UploadMenuImagesRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'images'   => ['required', 'array', 'min:1', 'max:5'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'], // max 2MB per file
        ];
    }

    public function messages(): array
    {
        return [
            'images.required'  => 'Minimal 1 gambar harus diupload.',
            'images.max'       => 'Maksimal 5 gambar per menu.',
            'images.*.image'   => 'File harus berupa gambar.',
            'images.*.max'     => 'Ukuran gambar maksimal 2MB.',
        ];
    }
}
