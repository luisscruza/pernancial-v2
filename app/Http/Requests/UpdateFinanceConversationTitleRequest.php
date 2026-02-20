<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateFinanceConversationTitleRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:100'],
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
            'title.required' => 'El titulo es obligatorio.',
            'title.string' => 'El titulo debe ser texto.',
            'title.max' => 'El titulo no puede tener mas de 100 caracteres.',
        ];
    }

    public function prepareForValidation(): void
    {
        $this->merge([
            'title' => mb_trim((string) $this->input('title', '')),
        ]);
    }
}
