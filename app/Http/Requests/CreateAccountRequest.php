<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Dto\CreateAccountDto;
use App\Enums\AccountType;
use App\Models\Currency;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class CreateAccountRequest extends FormRequest
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
            'description' => ['nullable', 'string', 'max:255'],
            'balance' => ['required', 'numeric'],
            'currency_id' => ['required', 'integer', 'exists:currencies,id'],
            'type' => ['required', 'string', Rule::enum(AccountType::class)],
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
            'balance.required' => 'El saldo inicial es requerido.',
            'balance.numeric' => 'El saldo debe ser un número válido.',
            'currency_id.required' => 'La moneda es requerida.',
            'currency_id.exists' => 'La moneda seleccionada no es válida.',
            'type.required' => 'El tipo de cuenta es requerido.',
            'type.enum' => 'El tipo de cuenta seleccionado no es válido.',
        ];
    }

    /*
     * Get the Data Transfer Object (DTO) for the request.
     */
    public function getDto(): CreateAccountDto
    {
        return new CreateAccountDto(
            name: $this->string('name')->value(),
            description: $this->string('description')->value(),
            balance: $this->float('balance'),
            currency: Currency::findOrFail($this->integer('currency_id')),
            type: AccountType::from($this->string('type')->value())
        );
    }
}
