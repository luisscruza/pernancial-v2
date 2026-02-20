<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Dto\CreateTransactionDto;
use App\Enums\CategoryType;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

final class UpdateTransactionRequest extends FormRequest
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
            'splits' => ['nullable', 'array', 'min:1'],
            'splits.*.category_id' => ['required', 'integer', 'exists:categories,id', 'distinct:strict'],
            'splits.*.amount' => ['required', 'numeric', 'not_in:0'],
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
            'splits.array' => 'Las divisiones deben ser una lista válida.',
            'splits.min' => 'Agrega al menos una división.',
            'splits.*.category_id.required' => 'La categoría de la división es obligatoria.',
            'splits.*.category_id.exists' => 'La categoría de la división no existe.',
            'splits.*.category_id.distinct' => 'No puedes repetir categorías en las divisiones.',
            'splits.*.amount.required' => 'El monto de la división es obligatorio.',
            'splits.*.amount.numeric' => 'El monto de la división debe ser un número.',
            'splits.*.amount.not_in' => 'El monto de la división no puede ser cero.',
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
                $type = TransactionType::tryFrom($this->string('type')->value());

                if (! $type) {
                    return;
                }

                $splits = $this->input('splits', []);
                $hasSplits = is_array($splits) && count($splits) > 0;

                if ($type === TransactionType::TRANSFER && $hasSplits) {
                    $validator->errors()->add('splits', 'Las transferencias no pueden dividirse en categorías.');

                    return;
                }

                if ($type !== TransactionType::TRANSFER && ! $hasSplits && ! $this->filled('category_id')) {
                    $validator->errors()->add('category_id', 'Selecciona una categoría o divide el monto.');
                }

                if ($hasSplits && $this->filled('category_id')) {
                    $validator->errors()->add('category_id', 'No puedes usar categoría principal cuando hay divisiones.');
                }

                if (! $hasSplits) {
                    return;
                }

                $amount = (float) $this->input('amount');
                $sum = 0.0;
                $categoryIds = [];

                foreach ($splits as $split) {
                    $sum += (float) ($split['amount'] ?? 0);
                    if (isset($split['category_id'])) {
                        $categoryIds[] = (int) $split['category_id'];
                    }
                }

                if (abs($sum - $amount) > 0.01) {
                    $validator->errors()->add('splits', 'La suma de las divisiones debe ser igual al monto total.');
                }

                if (! $categoryIds) {
                    return;
                }

                $expectedCategoryType = $type === TransactionType::INCOME
                    ? CategoryType::INCOME
                    : CategoryType::EXPENSE;

                $categories = Category::query()
                    ->whereIn('id', $categoryIds)
                    ->get()
                    ->keyBy('id');

                foreach ($categoryIds as $categoryId) {
                    $category = $categories->get($categoryId);

                    if (! $category) {
                        continue;
                    }

                    if ($category->type !== $expectedCategoryType) {
                        $validator->errors()->add('splits', 'Todas las divisiones deben tener categorías del mismo tipo.');

                        return;
                    }
                }
            },
        ];
    }

    /*
     * Get the Data Transfer Object (DTO) for the request.
     */
    public function getDto(): CreateTransactionDto
    {
        return new CreateTransactionDto(
            type: TransactionType::from($this->input('type')),
            amount: (float) $this->input('amount'),
            transaction_date: $this->input('transaction_date'),
            description: $this->input('description'),
            destination_account: Account::find($this->input('destination_account_id')),
            category: Category::find($this->input('category_id')),
            conversion_rate: null,
            received_amount: $this->input('received_amount') ? (float) $this->input('received_amount') : null,
            splits: $this->normalizeSplits(),
        );
    }

    /**
     * @return array<int, array{category_id: int, amount: float}>
     */
    private function normalizeSplits(): array
    {
        $splits = $this->input('splits', []);

        if (! is_array($splits)) {
            return [];
        }

        $normalized = [];

        foreach ($splits as $split) {
            if (! is_array($split)) {
                continue;
            }

            if (! array_key_exists('category_id', $split) || ! array_key_exists('amount', $split)) {
                continue;
            }

            $normalized[] = [
                'category_id' => (int) $split['category_id'],
                'amount' => (float) $split['amount'],
            ];
        }

        return $normalized;
    }
}
