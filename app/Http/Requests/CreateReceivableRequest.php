<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Dto\CreateReceivableDto;
use App\Dto\CreateReceivableSeriesDto;
use App\Models\Contact;
use App\Models\Currency;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

final class CreateReceivableRequest extends FormRequest
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
            'is_recurring' => ['nullable', 'boolean'],
            'series_name' => ['nullable', 'string', 'max:120'],
            'recurrence_frequency' => ['nullable', 'string', Rule::in(['monthly'])],
            'recurrence_day' => ['nullable', 'integer', 'min:1', 'max:28'],
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
            'contact_id.required' => 'Selecciona la persona que debe el dinero.',
            'contact_id.exists' => 'La persona seleccionada no existe.',
            'currency_id.required' => 'Selecciona la moneda.',
            'currency_id.exists' => 'La moneda seleccionada no existe.',
            'amount_total.required' => 'El monto es obligatorio.',
            'amount_total.numeric' => 'El monto debe ser un número.',
            'amount_total.not_in' => 'El monto no puede ser cero.',
            'due_date.required' => 'La fecha de vencimiento es obligatoria.',
            'due_date.date' => 'La fecha de vencimiento debe ser una fecha válida.',
            'description.max' => 'La descripción no puede tener más de 255 caracteres.',
            'series_name.max' => 'El nombre de la serie no puede tener más de 120 caracteres.',
            'recurrence_frequency.in' => 'La frecuencia seleccionada no es válida.',
            'recurrence_day.min' => 'El día de cobro debe ser entre 1 y 28.',
            'recurrence_day.max' => 'El día de cobro debe ser entre 1 y 28.',
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
                if (! $this->boolean('is_recurring')) {
                    return;
                }

                if (! $this->filled('series_name')) {
                    $validator->errors()->add('series_name', 'El nombre de la serie es obligatorio para recurrencia.');
                }

                if (! $this->filled('recurrence_frequency')) {
                    $validator->errors()->add('recurrence_frequency', 'Selecciona una frecuencia válida.');
                }

                if (! $this->filled('recurrence_day')) {
                    $validator->errors()->add('recurrence_day', 'Selecciona el día de cobro para la recurrencia.');
                }
            },
        ];
    }

    public function getReceivableDto(): CreateReceivableDto
    {
        return new CreateReceivableDto(
            contact: Contact::findOrFail($this->integer('contact_id')),
            currency: Currency::findOrFail($this->integer('currency_id')),
            amount_total: $this->float('amount_total'),
            due_date: $this->string('due_date')->value(),
            description: $this->string('description')->value(),
        );
    }

    public function getSeriesDto(): ?CreateReceivableSeriesDto
    {
        if (! $this->boolean('is_recurring')) {
            return null;
        }

        return new CreateReceivableSeriesDto(
            contact: Contact::findOrFail($this->integer('contact_id')),
            currency: Currency::findOrFail($this->integer('currency_id')),
            name: $this->string('series_name')->value(),
            default_amount: $this->float('amount_total'),
            is_recurring: true,
            recurrence_rule: $this->buildRecurrenceRule(),
            next_due_date: $this->string('due_date')->value(),
        );
    }

    /**
     * @return array<string, mixed>|null
     */
    private function buildRecurrenceRule(): ?array
    {
        if (! $this->boolean('is_recurring')) {
            return null;
        }

        return [
            'frequency' => $this->string('recurrence_frequency')->value(),
            'day_of_month' => $this->integer('recurrence_day'),
        ];
    }
}
