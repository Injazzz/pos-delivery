<?php

namespace App\Http\Requests\Delivery;

use App\Enums\DeliveryStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateDeliveryStatusRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'status' => ['required', new Enum(DeliveryStatus::class)],
            'notes'  => ['nullable', 'string', 'max:500'],
        ];
    }
}
