<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Dto\CreateTransactionDto;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class CreateTransactionRequest extends FormRequest
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
            'type' => ['required', 'string', Rule::enum(TransactionType::class)],
            'amount' => ['required', 'numeric', 'not_in:0'],
            'received_amount' => ['nullable', 'numeric', 'not_in:0'],
            'description' => ['nullable', 'string', 'max:255'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'destination_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'transaction_date' => ['required', 'date'],
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
            'type.required' => 'El tipo de transacción es obligatorio.',
            'type.enum' => 'El tipo de transacción seleccionado no es válido.',
            'amount.required' => 'El monto es obligatorio.',
            'amount.numeric' => 'El monto debe ser un número.',
            'amount.not_in' => 'El monto no puede ser cero.',
            'description.max' => 'La descripción no puede tener más de 255 caracteres.',
            'category_id.exists' => 'La categoría seleccionada no existe.',
            'destination_account_id.exists' => 'La cuenta de destino seleccionada no existe.',
            'transaction_date.required' => 'La fecha de transacción es obligatoria.',
            'transaction_date.date' => 'La fecha de transacción debe ser una fecha válida.',
        ];
    }

    /*
     * Get the Data Transfer Object (DTO) for the request.
     */
    public function getDto(): CreateTransactionDto
    {
        $receivedAmount = null;

        if (array_key_exists('received_amount', $this->all()) && $this->get('received_amount') !== null) {
            $receivedAmount = (float) $this->get('received_amount');
        }

        return new CreateTransactionDto(
            type: TransactionType::from($this->string('type')->value()),
            amount: $this->float('amount'),
            transaction_date: $this->string('transaction_date')->value(),
            description: $this->string('description')->value(),
            destination_account: Account::find($this->integer('destination_account_id')),
            category: Category::find($this->integer('category_id')),
            conversion_rate: null,
            received_amount: $receivedAmount,
        );
    }
}
