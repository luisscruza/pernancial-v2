<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateBudgetPeriodRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'budgets' => 'required|array',
            'budgets.*.amount' => 'required|numeric|min:0',
            'budgets.*.category_id' => 'required|exists:categories,id',
            'budgets.*.budget_id' => 'nullable|exists:budgets,id',
        ];
    }
}
