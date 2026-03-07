<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

class InitiatePaymentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'order_id'    => ['required', 'exists:orders,id'],
            'method'      => ['required', 'in:midtrans,qris,transfer,downpayment'],
            'amount'      => ['required', 'numeric', 'min:1000'],
        ];
    }
}
