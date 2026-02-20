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
     *
     * @param  array<int, array{category_id: int, amount: float}>  $splits
     * @param  array<int, array{contact_id: int, amount: float, paid_account_id?: int|null}>  $shared_receivables
     */
    public function __construct(
        public TransactionType $type,
        public float $amount,
        public ?float $personal_amount,
        public string $transaction_date,
        public ?string $description,
        public ?Account $destination_account,
        public ?Category $category,
        public ?float $conversion_rate,
        public ?float $received_amount = null,
        public bool $ai_assisted = false,
        public array $splits = [],
        public bool $is_shared = false,
        public array $shared_receivables = [],
    ) {
        //
    }
}
