<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\BudgetPeriodType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

final class CreateBudgetPeriodRequest extends FormRequest
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
            'type' => ['required', 'string', Rule::enum(BudgetPeriodType::class)],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'budgets' => ['required', 'array', 'min:1'],
            'budgets.*.category_id' => [
                'required',
                Rule::exists('categories', 'id')->where('user_id', Auth::id()),
            ],
            'budgets.*.amount' => ['required', 'numeric'],
            'budgets.*.name' => ['nullable', 'string', 'max:255'],
            'budgets.*.description' => ['nullable', 'string', 'max:500'],
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
            'name.required' => 'El nombre del período es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 255 caracteres.',
            'type.required' => 'El tipo de período es obligatorio.',
            'type.enum' => 'El tipo de período seleccionado no es válido.',
            'start_date.required' => 'La fecha de inicio es obligatoria.',
            'start_date.date' => 'La fecha de inicio debe ser una fecha válida.',
            'end_date.required' => 'La fecha de fin es obligatoria.',
            'end_date.date' => 'La fecha de fin debe ser una fecha válida.',
            'end_date.after' => 'La fecha de fin debe ser posterior a la fecha de inicio.',
            'budgets.required' => 'Debes agregar al menos un presupuesto.',
            'budgets.min' => 'Debes agregar al menos un presupuesto.',
            'budgets.*.category_id.required' => 'La categoría es obligatoria.',
            'budgets.*.category_id.exists' => 'La categoría seleccionada no existe.',
            'budgets.*.amount.required' => 'El monto es obligatorio.',
            'budgets.*.amount.numeric' => 'El monto debe ser un número.',
            'budgets.*.amount.min' => 'El monto debe ser mayor a 0.',
            'budgets.*.name.max' => 'El nombre no puede tener más de 255 caracteres.',
            'budgets.*.description.max' => 'La descripción no puede tener más de 500 caracteres.',
        ];
    }
}
