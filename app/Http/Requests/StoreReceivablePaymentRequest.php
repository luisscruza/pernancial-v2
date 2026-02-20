<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Dto\CreateReceivablePaymentDto;
use App\Models\Account;
use App\Models\Category;
use App\Models\Receivable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

final class StoreReceivablePaymentRequest extends FormRequest
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
            'account_id' => ['required', 'integer', 'exists:accounts,id'],
            'amount' => ['required', 'numeric', 'not_in:0'],
            'paid_at' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:255'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
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
            'account_id.required' => 'Selecciona la cuenta que recibe el pago.',
            'account_id.exists' => 'La cuenta seleccionada no existe.',
            'amount.required' => 'El monto es obligatorio.',
            'amount.numeric' => 'El monto debe ser un número.',
            'amount.not_in' => 'El monto no puede ser cero.',
            'paid_at.required' => 'La fecha de pago es obligatoria.',
            'paid_at.date' => 'La fecha de pago debe ser una fecha válida.',
            'note.max' => 'La nota no puede tener más de 255 caracteres.',
            'category_id.exists' => 'La categoría seleccionada no existe.',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $receivable = $this->route('receivable');

                if (! $receivable instanceof Receivable) {
                    return;
                }

                $amount = (float) $this->input('amount');
                $remaining = $receivable->amount_total - $receivable->amount_paid;

                if ($amount > $remaining + 0.01) {
                    $validator->errors()->add('amount', 'El monto supera el saldo pendiente.');
                }
            },
        ];
    }

    public function getDto(): CreateReceivablePaymentDto
    {
        return new CreateReceivablePaymentDto(
            account: Account::findOrFail($this->integer('account_id')),
            amount: $this->float('amount'),
            paid_at: $this->string('paid_at')->value(),
            note: $this->string('note')->value(),
            category: $this->filled('category_id') ? Category::find($this->integer('category_id')) : null,
        );
    }
}
