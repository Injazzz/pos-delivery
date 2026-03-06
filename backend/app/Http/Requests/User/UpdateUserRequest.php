<?php

namespace App\Http\Requests\User;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        return [
            'name'     => ['sometimes', 'string', 'max:100'],
            'email'    => ['sometimes', 'email', "unique:users,email,{$userId}"],
            'password' => ['sometimes', 'nullable', Password::min(8)->letters()->numbers()],
            'role'     => ['sometimes', new Enum(UserRole::class)],
            'phone'    => ['sometimes', 'nullable', 'string', 'max:20'],
            'status'   => ['sometimes', 'in:active,inactive'],
        ];
    }
}
