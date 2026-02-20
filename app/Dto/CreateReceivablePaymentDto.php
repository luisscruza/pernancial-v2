<?php

declare(strict_types=1);

namespace App\Dto;

use App\Models\Account;

final readonly class CreateReceivablePaymentDto
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        public Account $account,
        public float $amount,
        public string $paid_at,
        public ?string $note = null,
    ) {
        //
    }
}
