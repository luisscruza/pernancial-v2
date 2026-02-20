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
            'message' => ['nullable', 'string', 'max:4000', 'required_without:statement_file'],
            'conversation_id' => ['nullable', 'string', 'size:36'],
            'statement_file' => [
                'nullable',
                'file',
                'mimetypes:application/pdf,image/jpeg,image/png,image/webp',
                'max:20480',
                'required_without:message',
            ],
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
            'message.required_without' => 'Escribe un mensaje o adjunta un archivo.',
            'message.string' => 'El mensaje debe ser texto.',
            'message.max' => 'El mensaje no puede tener mas de 4000 caracteres.',
            'conversation_id.string' => 'La conversacion no es valida.',
            'conversation_id.size' => 'La conversacion no es valida.',
            'statement_file.required_without' => 'Adjunta un archivo o escribe un mensaje.',
            'statement_file.file' => 'El archivo adjunto no es valido.',
            'statement_file.mimetypes' => 'Solo se aceptan PDF, JPG, PNG o WEBP.',
            'statement_file.max' => 'El archivo no puede pesar mas de 20 MB.',
        ];
    }

    public function prepareForValidation(): void
    {
        $conversationId = mb_trim((string) $this->input('conversation_id', ''));
        $message = mb_trim((string) $this->input('message', ''));

        $this->merge([
            'message' => $message !== '' ? $message : null,
            'conversation_id' => $conversationId !== '' ? $conversationId : null,
        ]);
    }
}
