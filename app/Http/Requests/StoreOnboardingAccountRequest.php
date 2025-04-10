<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Dto\OnboardingAccountDto;
use Illuminate\Foundation\Http\FormRequest;

final class StoreOnboardingAccountRequest extends FormRequest
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
            'description' => ['nullable', 'string', 'max:255'],
            'balance' => ['required', 'numeric', 'min:0'],
            'currency_id' => ['required', 'string'],
            'type' => ['required', 'string'],
        ];
    }

    /*
     * Get the Data Transfer Object (DTO) for the request.
     */
    public function getDto(): OnboardingAccountDto
    {
        return new OnboardingAccountDto(
            name: $this->string('name')->value(),
            description: $this->string('description')->value(),
            balance: $this->float('balance'),
            currency_id: $this->string('currency_id')->value(),
            type: $this->string('type')->value(),
        );
    }
}
