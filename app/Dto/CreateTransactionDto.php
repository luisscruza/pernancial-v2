<?php

declare(strict_types=1);

namespace App\Dto;

use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Category;

final class CreateTransactionDto
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        public TransactionType $type,
        public float $amount,
        public string $transaction_date,
        public ?string $description,
        public ?Account $destination_account,
        public ?Category $category,
        public ?float $conversion_rate,
    ) {
        //
    }
}
