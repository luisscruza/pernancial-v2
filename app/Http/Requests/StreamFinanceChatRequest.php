<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class StreamFinanceChatRequest extends FormRequest
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
            'message' => ['required', 'string', 'max:4000'],
            'conversation_id' => ['nullable', 'string', 'size:36'],
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
            'message.required' => 'El mensaje es obligatorio.',
            'message.string' => 'El mensaje debe ser texto.',
            'message.max' => 'El mensaje no puede tener mas de 4000 caracteres.',
            'conversation_id.string' => 'La conversacion no es valida.',
            'conversation_id.size' => 'La conversacion no es valida.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $conversationId = mb_trim((string) $this->input('conversation_id', ''));

        $this->merge([
            'message' => mb_trim((string) $this->input('message', '')),
            'conversation_id' => $conversationId !== '' ? $conversationId : null,
        ]);
    }
}
