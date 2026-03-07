<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

class CashPaymentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'order_id'      => ['required', 'exists:orders,id'],
            'cash_received' => ['required', 'numeric', 'min:0'],
        ];
    }
}
