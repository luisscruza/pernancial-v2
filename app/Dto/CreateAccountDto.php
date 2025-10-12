<?php

declare(strict_types=1);

namespace App\Dto;

use App\Enums\AccountType;
use App\Models\Currency;

final readonly class CreateAccountDto
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        public string $name,
        public ?string $description,
        public float $balance,
        public Currency $currency,
        public AccountType $type
    ) {
        //
    }
}
