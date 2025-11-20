<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Dto\UpdateAccountDto;
use App\Enums\AccountType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateAccountRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', Rule::enum(AccountType::class)],
            'emoji' => ['required', 'string', 'max:10'],
            'color' => ['required', 'string', 'max:7'],
            'is_active' => ['required', 'boolean'],
            'balance_adjustment' => ['nullable', 'numeric'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre de la cuenta es requerido.',
            'name.max' => 'El nombre no puede tener más de 255 caracteres.',
            'type.required' => 'El tipo de cuenta es requerido.',
            'type.enum' => 'El tipo de cuenta seleccionado no es válido.',
            'emoji.required' => 'El emoji es requerido.',
            'color.required' => 'El color es requerido.',
            'is_active.required' => 'El estado de la cuenta es requerido.',
            'is_active.boolean' => 'El estado de la cuenta debe ser verdadero o falso.',
            'balance_adjustment.numeric' => 'El ajuste de balance debe ser un número válido.',
        ];
    }

    /**
     * Get the Data Transfer Object (DTO) for the request.
     */
    public function getDto(): UpdateAccountDto
    {
        return new UpdateAccountDto(
            name: $this->string('name')->value(),
            type: AccountType::from($this->string('type')->value()),
            emoji: $this->string('emoji')->value(),
            color: $this->string('color')->value(),
            is_active: $this->boolean('is_active'),
            balance_adjustment: $this->has('balance_adjustment') ? $this->float('balance_adjustment') : null,
        );
    }
}
