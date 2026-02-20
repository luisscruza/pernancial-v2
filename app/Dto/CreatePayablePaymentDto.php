<?php

declare(strict_types=1);

namespace App\Dto;

use App\Models\Account;
use App\Models\Category;

final readonly class CreatePayablePaymentDto
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        public Account $account,
        public float $amount,
        public string $paid_at,
        public ?string $note = null,
        public ?Category $category = null,
    ) {
        //
    }
}
