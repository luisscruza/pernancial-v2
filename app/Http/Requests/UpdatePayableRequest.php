<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Dto\UpdatePayableDto;
use App\Models\Contact;
use App\Models\Currency;
use App\Models\Payable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

final class UpdatePayableRequest extends FormRequest
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
            'contact_id' => ['required', 'integer', 'exists:contacts,id'],
            'currency_id' => ['required', 'integer', 'exists:currencies,id'],
            'amount_total' => ['required', 'numeric', 'not_in:0'],
            'due_date' => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:255'],
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
            'contact_id.required' => 'Selecciona la persona a la que debes.',
            'contact_id.exists' => 'La persona seleccionada no existe.',
            'currency_id.required' => 'Selecciona la moneda.',
            'currency_id.exists' => 'La moneda seleccionada no existe.',
            'amount_total.required' => 'El monto es obligatorio.',
            'amount_total.numeric' => 'El monto debe ser un número.',
            'amount_total.not_in' => 'El monto no puede ser cero.',
            'due_date.required' => 'La fecha de vencimiento es obligatoria.',
            'due_date.date' => 'La fecha de vencimiento debe ser una fecha válida.',
            'description.max' => 'La descripción no puede tener más de 255 caracteres.',
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
                $payable = $this->route('payable');

                if (! $payable instanceof Payable) {
                    return;
                }

                if ($this->float('amount_total') < $payable->amount_paid) {
                    $validator->errors()->add('amount_total', 'El monto no puede ser menor al monto ya pagado.');
                }
            },
        ];
    }

    public function getDto(): UpdatePayableDto
    {
        return new UpdatePayableDto(
            contact: Contact::findOrFail($this->integer('contact_id')),
            currency: Currency::findOrFail($this->integer('currency_id')),
            amount_total: $this->float('amount_total'),
            due_date: $this->string('due_date')->value(),
            description: $this->string('description')->value(),
        );
    }
}
