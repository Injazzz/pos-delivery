<?php

namespace App\Http\Requests\Delivery;

use Illuminate\Foundation\Http\FormRequest;

class AssignCourierRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'courier_id' => ['required', 'exists:users,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'courier_id.required' => 'Kurir wajib dipilih.',
            'courier_id.exists'   => 'Kurir tidak ditemukan.',
        ];
    }
}
