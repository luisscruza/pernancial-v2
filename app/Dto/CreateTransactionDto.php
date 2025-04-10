<?php

declare(strict_types=1);

namespace App\Dto;

final class CreateTransactionDto
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        public string $type,
        public float $amount,
        public string $transaction_date,
        public ?string $description,
        public ?int $destination_account_id,
        public ?int $category_id,
        public ?float $conversion_rate,
    ) {
        //
    }
}
