<?php

declare(strict_types=1);

namespace App\Dto;

final readonly class OnboardingAccountDto
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        public string $name,
        public string $description,
        public float $balance,
        public string $currency_id,
        public string $type
    ) {
        //
    }
}
