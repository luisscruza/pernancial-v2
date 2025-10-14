<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\BudgetPeriodType;
use App\Enums\BudgetType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

final class CreateBudgetRequest extends FormRequest
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
            'amount' => ['required', 'numeric', 'min:0.01'],
            'type' => ['required', 'string', Rule::enum(BudgetType::class)],
            'period_type' => ['required', 'string', Rule::enum(BudgetPeriodType::class)],
            'category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')->where('user_id', Auth::id()),
            ],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'description' => ['nullable', 'string', 'max:500'],
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
            'name.required' => 'El nombre del presupuesto es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 255 caracteres.',
            'amount.required' => 'El monto del presupuesto es obligatorio.',
            'amount.numeric' => 'El monto debe ser un número.',
            'amount.min' => 'El monto debe ser mayor a 0.',
            'type.required' => 'El tipo de presupuesto es obligatorio.',
            'type.enum' => 'El tipo de presupuesto seleccionado no es válido.',
            'period_type.required' => 'El tipo de período es obligatorio.',
            'period_type.enum' => 'El tipo de período seleccionado no es válido.',
            'category_id.required' => 'La categoría es obligatoria.',
            'category_id.exists' => 'La categoría seleccionada no existe.',
            'start_date.required' => 'La fecha de inicio es obligatoria.',
            'start_date.date' => 'La fecha de inicio debe ser una fecha válida.',
            'start_date.after_or_equal' => 'La fecha de inicio debe ser hoy o posterior.',
            'end_date.required' => 'La fecha de fin es obligatoria.',
            'end_date.date' => 'La fecha de fin debe ser una fecha válida.',
            'end_date.after' => 'La fecha de fin debe ser posterior a la fecha de inicio.',
            'description.max' => 'La descripción no puede tener más de 500 caracteres.',
        ];
    }
}
