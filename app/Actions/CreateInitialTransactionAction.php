<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\CreateTransactionDto;
use App\Models\Account;
use Illuminate\Support\Facades\DB;

final readonly class CreateInitialTransactionAction
{
    public function __construct(
        private CreateTransactionAction $createTransactionAction,
    ) {
        //
    }

    /**
     * Execute the action.
     */
    public function handle(Account $account, float $balance): void
    {
        DB::transaction(function () use ($account, $balance): void {

            if ($balance === 0.0) {
                return;
            }

            $this->createTransactionAction->handle($account, new CreateTransactionDto(
                type: 'initial',
                amount: $balance,
                transaction_date: now()->format('Y-m-d'),
                description: 'Balance inicial',
                destination_account_id: null,
                category_id: null,
                conversion_rate: null,
            ));
        });
    }
}
