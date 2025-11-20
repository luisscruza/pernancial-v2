<?php

declare(strict_types=1);

namespace App\Dto;

use App\Enums\AccountType;

final readonly class UpdateAccountDto
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        public string $name,
        public AccountType $type,
        public string $emoji,
        public string $color,
        public bool $is_active,
        public ?float $balance_adjustment = null,
    ) {
        //
    }
}
