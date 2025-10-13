<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Currency;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

final class UpdateCurrencyRequest extends FormRequest
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
        /** @var Currency|null $currency */
        $currency = $this->route('currency');

        return [
            'code' => [
                'required',
                'string',
                'max:10',
                'alpha',
                Rule::unique('currencies', 'code')
                    ->where('user_id', Auth::id())
                    ->ignore($currency?->id),
            ],
            'name' => ['required', 'string', 'max:255'],
            'symbol' => ['required', 'string', 'max:10'],
            'decimal_places' => ['required', 'integer', 'min:0', 'max:8'],
            'decimal_separator' => ['required', 'string', 'max:5'],
            'thousands_separator' => ['required', 'string', 'max:5'],
            'symbol_position' => ['required', 'string', 'in:before,after'],
            'conversion_rate' => ['required', 'numeric', 'min:0.000001'],
            'is_base' => ['boolean'],
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
            'code.required' => 'El código de la moneda es obligatorio.',
            'code.unique' => 'Ya tienes una moneda con este código.',
            'code.alpha' => 'El código debe contener solo letras.',
            'code.max' => 'El código no puede tener más de 10 caracteres.',
            'name.required' => 'El nombre de la moneda es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 255 caracteres.',
            'symbol.required' => 'El símbolo de la moneda es obligatorio.',
            'symbol.max' => 'El símbolo no puede tener más de 10 caracteres.',
            'decimal_places.required' => 'Los decimales son obligatorios.',
            'decimal_places.integer' => 'Los decimales deben ser un número entero.',
            'decimal_places.min' => 'Los decimales deben ser al menos 0.',
            'decimal_places.max' => 'Los decimales no pueden ser más de 8.',
            'decimal_separator.required' => 'El separador decimal es obligatorio.',
            'thousands_separator.required' => 'El separador de miles es obligatorio.',
            'symbol_position.required' => 'La posición del símbolo es obligatoria.',
            'symbol_position.in' => 'La posición del símbolo debe ser antes o después.',
            'conversion_rate.required' => 'La tasa de conversión es obligatoria.',
            'conversion_rate.numeric' => 'La tasa de conversión debe ser un número.',
            'conversion_rate.min' => 'La tasa de conversión debe ser mayor a 0.',
        ];
    }
}
