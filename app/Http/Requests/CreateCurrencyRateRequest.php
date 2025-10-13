<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class CreateCurrencyRateRequest extends FormRequest
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
            'rate' => ['required', 'numeric', 'min:0.000001'],
            'effective_date' => ['required', 'date', 'before_or_equal:today'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'rate.required' => 'La tasa es obligatoria.',
            'rate.numeric' => 'La tasa debe ser un número.',
            'rate.min' => 'La tasa debe ser mayor a 0.',
            'effective_date.required' => 'La fecha efectiva es obligatoria.',
            'effective_date.date' => 'La fecha efectiva debe ser una fecha válida.',
            'effective_date.before_or_equal' => 'La fecha efectiva no puede ser futura.',
        ];
    }
}
