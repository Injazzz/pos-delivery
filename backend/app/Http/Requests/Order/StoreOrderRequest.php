<?php

namespace App\Http\Requests\Order;

use App\Enums\OrderType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'order_type'           => ['required', new Enum(OrderType::class)],
            'notes'                => ['nullable', 'string', 'max:500'],
            'table_number'         => ['nullable', 'required_if:order_type,dine_in', 'string', 'max:20'],
            'customer_id'          => ['nullable', 'exists:customers,id'],

            // Delivery info
            'delivery_address'     => ['nullable', 'required_if:order_type,delivery', 'string'],
            'delivery_city'        => ['nullable', 'string', 'max:100'],
            'delivery_notes'       => ['nullable', 'string', 'max:300'],

            // Items
            'items'                => ['required', 'array', 'min:1'],
            'items.*.menu_id'      => ['required', 'exists:menus,id'],
            'items.*.qty'          => ['required', 'integer', 'min:1', 'max:99'],
            'items.*.note'         => ['nullable', 'string', 'max:200'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required'          => 'Pesanan tidak boleh kosong.',
            'items.min'               => 'Minimal 1 item pesanan.',
            'items.*.menu_id.exists'  => 'Menu tidak ditemukan.',
            'delivery_address.required_if' => 'Alamat pengiriman wajib diisi untuk delivery.',
            'table_number.required_if'     => 'Nomor meja wajib diisi untuk dine-in.',
        ];
    }
}
